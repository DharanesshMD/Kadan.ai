import { NextRequest, NextResponse } from 'next/server';
import { UserInput, CalculationResult } from '@/types';
import { getMasterPrompt } from '@/lib/prompts';

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY!;

// Models raced in parallel; the first one to return valid JSON wins.
const MODELS = [
  { name: "minimaxai/minimax-m3.1-flash", maxTokens: 8192, topP: 0.95 },
  { name: "google/gemma-4-31b-it", maxTokens: 4096, topP: 1 },
];

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

const callModel = async (
  model: (typeof MODELS)[number],
  prompt: string,
  signal: AbortSignal
): Promise<CalculationResult> => {
  const response = await fetch(NVIDIA_API_URL, {
    method: 'POST',
    signal,
    headers: {
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model.name,
      messages: [{ role: "user", content: prompt }],
      max_tokens: model.maxTokens,
      seed: 0,
      temperature: 0.2,
      top_p: model.topP,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${model.name} ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return parseResult(data.choices[0].message.content);
};

const calculate = async (input: UserInput): Promise<CalculationResult> => {
  const prompt = getMasterPrompt(input, new Date().getFullYear());
  const controllers = MODELS.map(() => new AbortController());

  try {
    // Promise.any resolves with the first successful (valid JSON) result
    const { result, winner } = await Promise.any(
      MODELS.map((model, i) =>
        callModel(model, prompt, controllers[i].signal).then((result) => ({
          result,
          winner: i,
        }))
      )
    );
    console.log("Fastest model:", MODELS[winner].name);

    // Cancel the slower request(s) immediately
    controllers.forEach((c, i) => {
      if (i !== winner) c.abort();
    });

    return result;
  } catch (error) {
    controllers.forEach((c) => c.abort());
    const errors = error instanceof AggregateError ? error.errors : [error];
    errors.forEach((e) => console.error("Model failed:", (e as Error).message));
    throw new Error("Failed to calculate. Please try again.");
  }
};

export async function POST(req: NextRequest) {
  try {
    const userInput = await req.json();
    const results = await calculate(userInput);
    return NextResponse.json(results);
  } catch (error) {
    console.error('API route calculation error:', error);
    return NextResponse.json({ error: 'Failed to calculate' }, { status: 500 });
  }
}
