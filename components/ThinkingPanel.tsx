'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';

interface ThinkingPanelProps {
  /** Live reasoning text streamed from the model (may be empty at first). */
  thinking: string;
  /** Notice such as "High demand, retrying shortly..." (may be empty). */
  retryMessage: string;
}

// Tailwind styling for the markdown elements (no typography plugin needed).
const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => <h3 className="mt-3 mb-1 text-base font-bold text-gray-900">{children}</h3>,
  h2: ({ children }) => <h3 className="mt-3 mb-1 text-base font-bold text-gray-900">{children}</h3>,
  h3: ({ children }) => <h4 className="mt-2 mb-1 text-sm font-semibold text-gray-900">{children}</h4>,
  h4: ({ children }) => <h4 className="mt-2 mb-1 text-sm font-semibold text-gray-900">{children}</h4>,
  ul: ({ children }) => <ul className="mb-2 ml-5 list-disc space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 ml-5 list-decimal space-y-0.5">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-2 border-blue-300 pl-3 text-gray-500">{children}</blockquote>
  ),
  code: ({ children, className }) =>
    className ? (
      // fenced block (has a language-* class)
      <code className="font-mono text-xs">{children}</code>
    ) : (
      <code className="rounded bg-white/70 px-1 py-0.5 font-mono text-[0.8em] text-blue-800">{children}</code>
    ),
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-lg bg-white/70 p-2 text-gray-700">{children}</pre>
  ),
  hr: () => <hr className="my-3 border-blue-100" />,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
      {children}
    </a>
  ),
};

export default function ThinkingPanel({ thinking, retryMessage }: ThinkingPanelProps) {
  const [elapsed, setElapsed] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 500);
    return () => clearInterval(id);
  }, []);

  // Auto-follow the stream, but yield to the user. Direction-based so tiny
  // trackpad scrolls count: new content only ever *increases* scrollTop, so
  // any decrease means the user scrolled up -> stop following. Following
  // resumes only once the user reaches the very bottom again.
  const stickToBottom = useRef(true);
  const lastScrollTop = useRef(0);

  const handleScroll = () => {
    const el = feedRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (el.scrollTop < lastScrollTop.current - 1) {
      stickToBottom.current = false;
    } else if (distanceFromBottom < 4) {
      stickToBottom.current = true;
    }
    lastScrollTop.current = el.scrollTop;
  };

  useEffect(() => {
    const el = feedRef.current;
    if (el && stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
      lastScrollTop.current = el.scrollTop;
    }
  }, [thinking]);

  // Models put reasoning on single newlines; markdown would collapse those
  // into spaces, so turn them into hard line breaks.
  const markdown = useMemo(
    () => thinking.trim().replace(/([^\n])\n(?=[^\n])/g, '$1  \n'),
    [thinking]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm p-4"
      role="status"
    >
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-100 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Calculating your future...</h2>
          </div>
          <span className="text-xs tabular-nums text-gray-400">{elapsed}s</span>
        </div>

        {retryMessage && (
          <p className="mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
            {retryMessage}
          </p>
        )}

        {/* Live reasoning feed */}
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-blue-400">
            AI reasoning
          </p>
          <div
            ref={feedRef}
            onScroll={handleScroll}
            onWheel={(e) => {
              // Scrolling up = the user wants to read; stop following immediately
              if (e.deltaY < 0 && e.currentTarget.scrollTop > 0) stickToBottom.current = false;
            }}
            aria-live="off"
            className="h-56 overflow-y-auto break-words text-sm leading-relaxed text-gray-700"
          >
            {markdown ? (
              <ReactMarkdown components={markdownComponents}>{markdown}</ReactMarkdown>
            ) : (
              <span className="text-gray-400 animate-pulse">Waiting for the AI to start thinking...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
