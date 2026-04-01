'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Clock, AlertTriangle, Terminal, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';


interface OutputConsoleProps {
  stdout: string;
  stderr: string;
  executionTimeMs: number | null;
  status: string;
  isLoading: boolean;
}


function formatExecTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/** Maps queue status strings to terminal-style labels */
function statusLabel(status: string): string {
  const map: Record<string, string> = {
    queued:     '$ waiting in queue...',
    processing: '$ executing...',
    running:    '$ running...',
  };
  return map[status] ?? `$ ${status}...`;
}

/** Safely copies text, swallows clipboard permission errors */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}


function StatusPill({ status }: { status: string }) {
  if (!status || status === 'queued' || status === 'processing' || status === 'running') return null;

  const config = {
    completed: {
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      label: 'completed',
      className: 'text-[#00ff88] bg-[#00ff88]/[0.06] border-[#00ff88]/20',
    },
    failed: {
      icon: <XCircle className="w-3.5 h-3.5" />,
      label: 'failed',
      className: 'text-red-400 bg-red-950/30 border-red-900/30',
    },
    timeout: {
      icon: <Clock className="w-3.5 h-3.5" />,
      label: 'timed out · 5s limit',
      className: 'text-amber-400 bg-amber-950/20 border-amber-900/20',
    },
  } as const;

  const c = config[status as keyof typeof config];
  if (!c) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-[11px] mt-3 ${c.className}`}>
      {c.icon}
      {c.label}
    </div>
  );
}


export default function OutputConsole({
  stdout,
  stderr,
  executionTimeMs,
  status,
  isLoading,
}: OutputConsoleProps) {
  const [copied, setCopied] = useState(false);

  // Concatenate both streams for copy — original only copied stdout
  const copyableOutput = [stdout, stderr].filter(Boolean).join('\n--- stderr ---\n');
  const hasOutput = Boolean(stdout || stderr);
  const isEmpty = !hasOutput && !isLoading && status === '';

  const handleCopy = async () => {
    const ok = await copyToClipboard(copyableOutput);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-full flex flex-col rounded-xl overflow-hidden border border-[#1a2a3a] bg-[#080c10]">

      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2a3a] bg-[#0d1520] shrink-0">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-3.5 h-3.5 text-[#00ff88]" />
          <span className="font-mono text-[12px] font-semibold text-[#f0f4f8]">stdout</span>

          {/* Execution time */}
          {executionTimeMs !== null && !isLoading && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-[#2a3f52]">
              <Clock className="w-3 h-3" />
              {formatExecTime(executionTimeMs)}
            </span>
          )}

          {/* Live status indicator while running */}
          {isLoading && (
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#2a3f52]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
              {status === 'queued' ? 'queued' : 'running'}
            </span>
          )}
        </div>

        {/* Copy button — only when there's something to copy */}
        {hasOutput && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md font-mono text-[10px] text-[#2a3f52] hover:text-[#8ba5be] hover:bg-[#1a2a3a] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#00ff88]" />
                <span className="text-[#00ff88]">copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                copy
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-[12px] leading-[1.8]">
        <AnimatePresence mode="wait">

          {/* Loading state */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full gap-4"
            >
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#00ff88]/50 animate-pulse"
                    style={{ animationDelay: `${i * 180}ms` }}
                  />
                ))}
              </div>
              <span className="font-mono text-[11px] text-[#2a3f52]">
                {statusLabel(status)}
              </span>
            </motion.div>
          )}

          {/* Empty state */}
          {isEmpty && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full gap-3"
            >
              <div className="w-12 h-12 rounded-xl border border-[#1a2a3a] flex items-center justify-center">
                <Terminal className="w-5 h-5 text-[#1a2a3a]" />
              </div>
              <div className="text-center">
                <p className="font-mono text-[11px] text-[#2a3f52]">// no output yet</p>
                <p className="font-mono text-[10px] text-[#1a2a3a] mt-1">press run to execute</p>
              </div>
            </motion.div>
          )}

          {/* Output */}
          {!isLoading && hasOutput && (
            <motion.div
              key="output"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* stdout */}
              {stdout && (
                <pre className="text-[#00ff88] whitespace-pre-wrap break-words leading-[1.8]">
                  {stdout}
                </pre>
              )}

              {/* stderr */}
              {stderr && (
                <div className={stdout ? 'mt-4' : ''}>
                  {/* Only show the stderr label if there's also stdout — otherwise context is clear */}
                  {stdout && (
                    <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-[#1a2a3a]">
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      <span className="font-mono text-[9px] text-red-400 uppercase tracking-[1px]">
                        stderr
                      </span>
                    </div>
                  )}
                  <pre className="text-red-400 whitespace-pre-wrap break-words leading-[1.8]">
                    {stderr}
                  </pre>
                </div>
              )}

              {/* Status pill */}
              <StatusPill status={status} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}