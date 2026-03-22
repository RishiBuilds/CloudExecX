'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Terminal, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { formatTime } from '@/lib/utils';

interface OutputConsoleProps {
  stdout: string;
  stderr: string;
  executionTimeMs: number | null;
  status: string;
  isLoading: boolean;
}

export default function OutputConsole({
  stdout,
  stderr,
  executionTimeMs,
  status,
  isLoading,
}: OutputConsoleProps) {
  const [copied, setCopied] = useState(false);

  const output = stdout || stderr || '';

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--console-bg)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-brand-400" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Output</span>
          {executionTimeMs !== null && (
            <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Clock className="w-3 h-3" />
              {formatTime(executionTimeMs)}
            </span>
          )}
        </div>
        {output && (
          <button
            onClick={copyOutput}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        )}
      </div>

      {/* Output Area */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full gap-3"
            >
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
              <span className="text-sm text-[var(--text-muted)]">
                {status === 'queued' ? 'Waiting in queue...' : 'Executing code...'}
              </span>
            </motion.div>
          ) : !output && status === '' ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full gap-2 text-[var(--text-muted)]"
            >
              <Terminal className="w-10 h-10 opacity-30" />
              <span className="text-sm">Run your code to see output here</span>
            </motion.div>
          ) : (
            <motion.div
              key="output"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              {/* stdout */}
              {stdout && (
                <pre className="text-emerald-400 whitespace-pre-wrap break-words leading-relaxed">
                  {stdout}
                </pre>
              )}

              {/* stderr */}
              {stderr && (
                <div className="mt-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs font-semibold text-red-400">STDERR</span>
                  </div>
                  <pre className="text-red-400 whitespace-pre-wrap break-words leading-relaxed">
                    {stderr}
                  </pre>
                </div>
              )}

              {/* Status badges */}
              {status === 'timeout' && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-orange-400">
                    Execution timed out (5 second limit)
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
