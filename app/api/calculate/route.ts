import { NextRequest } from 'next/server';
import { UserInput, CalculationResult } from '@/types';
import { getMasterPrompt } from '@/lib/prompts';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const NVIDIA_API_URL = process.env.NVIDIA_API_URL || "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY!;

interface ModelConfig {
  name: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  // Extra body fields for this model (e.g. enabling reasoning)
  extraBody?: Record<string, unknown>;
  // Whether this model's reasoning tokens are streamed to the UI
  showThinking?: boolean;
  // Hedge: only start this model if nobody has won after this many ms.
  // Saves rate-limit quota (each started model costs 1 request).
  startDelayMs?: number;
}

// Models raced; the first one to return valid JSON wins.
const MODELS: ModelConfig[] = [
  { name: "minimaxai/minimax-m3.1-flash", maxTokens: 8192, temperature: 0.2, topP: 0.95 },
  { name: "google/gemma-4-31b-it", maxTokens: 4096, temperature: 0.2, topP: 1, startDelayMs: 5000 },
  {
    name: "nvidia/nemotron-3.5-lightning-30b-a3b",
    maxTokens: 8192,
    temperature: 0.6,
    topP: 0.95,
    extraBody: {
      chat_template_kwargs: { enable_thinking: true },
      reasoning_budget: 4096,
    },
    showThinking: true,
  },
];

// ---- Rate limiting & retries -------------------------------------------
// NVIDIA's API allows ~40 requests/minute per key. We keep a sliding-window
// limiter below that (headroom for other instances) and retry transient errors.
// NOTE: state is per server instance; a shared store (e.g. Redis/KV) would be
// needed for a strict global limit across serverless instances.
const RPM_LIMIT = Number(process.env.NVIDIA_RPM_LIMIT) || 35;
const MAX_ATTEMPTS = 3;
const DEADLINE_MS = 55_000; // stay under maxDuration
const requestLog: number[] = [];

class HttpError extends Error {
  constructor(public status: number, message: string, public retryAfterMs?: number) {
    super(message);
  }
}

const abortError = () => new DOMException('Aborted', 'AbortError');

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(abortError());
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError());
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal.addEventListener('abort', onAbort, { once: true });
  });

// Wait until a request slot is free in the sliding 60s window.
const acquireSlot = async (signal: AbortSignal) => {
  while (true) {
    const now = Date.now();
    while (requestLog.length && now - requestLog[0] >= 60_000) requestLog.shift();
    if (requestLog.length < RPM_LIMIT) {
      requestLog.push(now);
      return;
    }
    await sleep(60_000 - (now - requestLog[0]) + 50, signal);
  }
};

const isRetryable = (e: unknown) => {
  if (e instanceof HttpError) return [408, 429, 500, 502, 503, 504].includes(e.status);
  if (e instanceof SyntaxError) return true; // model returned malformed JSON
  return e instanceof TypeError; // network failure (fetch failed)
};

const parseResult = (raw: string): CalculationResult => {
  // Strip any <think>...</think> reasoning block
  let jsonContent = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  // Remove markdown code fences if present
  if (jsonContent.includes('```json')) {
    jsonContent = jsonContent.replace(/```json\s*/, '').replace(/\s*```[\s\S]*$/, '');
  } else if (jsonContent.includes('```')) {
    jsonContent = jsonContent.replace(/```\s*/, '').replace(/\s*```[\s\S]*$/, '');
  }

  // Find JSON object boundaries
  const jsonStart = jsonContent.indexOf('{');
  const jsonEnd = jsonContent.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
  }

  return JSON.parse(jsonContent);
};

// Streams one model's completion; reports reasoning tokens via onThinking.
const callModel = async (
  model: ModelConfig,
  prompt: string,
  signal: AbortSignal,
  onThinking: (text: string) => void
): Promise<CalculationResult> => {
  const response = await fetch(NVIDIA_API_URL, {
    method: 'POST',
    signal,
    headers: {
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
      "Accept": "text/event-stream",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model.name,
      messages: [{ role: "user", content: prompt }],
      max_tokens: model.maxTokens,
      seed: 0,
      temperature: model.temperature,
      top_p: model.topP,
      stream: true,
      ...model.extraBody,
    }),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text().catch(() => '');
    const retryAfter = Number(response.headers.get('retry-after'));
    throw new HttpError(
      response.status,
      `${model.name} ${response.status}: ${errorText}`,
      retryAfter > 0 ? retryAfter * 1000 : undefined
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';

  const handleLine = (line: string) => {
    if (!line.startsWith('data:')) return;
    const data = line.slice(5).trim();
    if (!data || data === '[DONE]') return;
    let delta;
    try {
      delta = JSON.parse(data).choices?.[0]?.delta;
    } catch {
      return; // partial/invalid chunk
    }
    if (!delta) return;
    const reasoning = delta.reasoning_content ?? delta.reasoning;
    if (reasoning && model.showThinking) onThinking(reasoning);
    if (delta.content) content += delta.content;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    lines.forEach(handleLine);
  }
  if (buffer) handleLine(buffer);

  return parseResult(content);
};

// Runs one model with rate limiting + retry/backoff on transient failures.
const callModelWithRetry = async (
  model: ModelConfig,
  prompt: string,
  signal: AbortSignal,
  onThinking: (text: string) => void,
  onRetry: (message: string) => void
): Promise<CalculationResult> => {
  for (let attempt = 1; ; attempt++) {
    try {
      await acquireSlot(signal);
      return await callModel(model, prompt, signal, onThinking);
    } catch (e) {
      if (signal.aborted || attempt >= MAX_ATTEMPTS || !isRetryable(e)) throw e;
      // Honor Retry-After, else exponential backoff (1s, 2s, 4s...) + jitter
      const backoff = Math.min(1000 * 2 ** (attempt - 1), 8000) + Math.random() * 500;
      const delay = e instanceof HttpError && e.retryAfterMs ? e.retryAfterMs : backoff;
      const rateLimited = e instanceof HttpError && e.status === 429;
      console.warn(`${model.name} attempt ${attempt} failed (${(e as Error).message.slice(0, 120)}); retrying in ${Math.round(delay)}ms`);
      if (model.showThinking) {
        onRetry(rateLimited ? 'High demand, retrying shortly...' : 'Retrying...');
      }
      await sleep(delay, signal);
    }
  }
};

export async function POST(req: NextRequest) {
  const userInput: UserInput = await req.json();
  const prompt = getMasterPrompt(userInput, new Date().getFullYear());
  const controllers = MODELS.map(() => new AbortController());
  const abortAll = (except = -1) =>
    controllers.forEach((c, i) => i !== except && c.abort());

  // Stop all upstream requests if the client disconnects
  req.signal.addEventListener('abort', () => abortAll());

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (event: object) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
        } catch {
          closed = true; // client went away
        }
      };
      const close = () => {
        if (closed) return;
        closed = true;
        controller.close();
      };

      send({ type: 'status', message: 'Analyzing your college and finances...' });

      // Hard deadline so we fail cleanly before the platform kills the function
      const deadline = setTimeout(() => abortAll(), DEADLINE_MS);

      try {
        // Promise.any resolves with the first successful (valid JSON) result
        const { result, winner } = await Promise.any(
          MODELS.map(async (model, i) => {
            const signal = controllers[i].signal;
            // Hedged models start late (and never start if someone already won)
            if (model.startDelayMs) await sleep(model.startDelayMs, signal);
            const result = await callModelWithRetry(
              model,
              prompt,
              signal,
              (text) => send({ type: 'thinking', text }),
              (message) => send({ type: 'retry', message })
            );
            return { result, winner: i };
          })
        );
        console.log("Fastest model:", MODELS[winner].name);

        // Cancel the slower request(s) immediately
        abortAll(winner);

        send({ type: 'result', data: result, model: MODELS[winner].name });
      } catch (error) {
        abortAll();
        const errors = error instanceof AggregateError ? error.errors : [error];
        errors.forEach((e) => console.error("Model failed:", (e as Error).message));
        send({ type: 'error', message: 'Failed to calculate. Please try again.' });
      } finally {
        clearTimeout(deadline);
        close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}
