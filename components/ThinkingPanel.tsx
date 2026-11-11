'use client';

import { useEffect, useRef, useState } from 'react';

interface ThinkingPanelProps {
  /** Live reasoning text streamed from the model (may be empty at first). */
  thinking: string;
  /** Notice such as "High demand, retrying shortly..." (may be empty). */
  retryMessage: string;
}

export default function ThinkingPanel({ thinking, retryMessage }: ThinkingPanelProps) {
  const [elapsed, setElapsed] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 500);
    return () => clearInterval(id);
  }, []);

  // Keep the newest reasoning in view as it streams in
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [thinking]);

  const text = thinking.trim();

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
            aria-live="off"
            className="h-56 overflow-y-auto text-sm leading-relaxed text-gray-700 whitespace-pre-wrap break-words"
          >
            {text ? (
              <>
                {text}
                <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 bg-blue-500 animate-pulse" />
              </>
            ) : (
              <span className="text-gray-400 animate-pulse">Waiting for the AI to start thinking...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
