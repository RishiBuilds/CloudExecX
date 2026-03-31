'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { getQueueStatus, type QueueStatus } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 5000;

// ─── Stat config ──────────────────────────────────────────────────────────────

const STATS = [
  {
    key: 'active'    as const,
    label: 'active',
    icon: Activity,
    // Green — these are live executions, positive signal
    color: 'text-[#00ff88]',
    bg:    'bg-[#00ff88]/[0.06]',
    border:'border-[#00ff88]/10',
  },
  {
    key: 'waiting'   as const,
    label: 'waiting',
    icon: Clock,
    // Amber — queued but not running yet, neutral/caution
    color: 'text-amber-400',
    bg:    'bg-amber-950/20',
    border:'border-amber-900/20',
  },
  {
    key: 'completed' as const,
    label: 'done',
    icon: CheckCircle2,
    // Muted — historical, not actionable
    color: 'text-[#4a6177]',
    bg:    'bg-[#0d1520]',
    border:'border-[#1a2a3a]',
  },
  {
    key: 'failed'    as const,
    label: 'failed',
    icon: XCircle,
    // Red — errors always get red
    color: 'text-red-400',
    bg:    'bg-red-950/20',
    border:'border-red-900/20',
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function QueueStatusPanel() {
  const { getToken } = useAuth();
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [hasError, setHasError]       = useState(false);
  const [isRetrying, setIsRetrying]   = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await getQueueStatus(token);
      setQueueStatus(data);
      setHasError(false);
    } catch (err: unknown) {
      console.error('Queue status fetch failed:', err);
      setHasError(true);
    }
  }, [getToken]);

  // Poll on mount; restart if getToken identity changes (Clerk token refresh)
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleRetry = async () => {
    setIsRetrying(true);
    await fetchStatus();
    setIsRetrying(false);
  };

  // ── Error state ──────────────────────────────────────────────────────────────
  if (hasError && !queueStatus) {
    return (
      <div className="rounded-xl border border-[#1a2a3a] p-4 bg-[#0d1520] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span className="font-mono text-[11px] text-[#2a3f52]">// queue unreachable</span>
        </div>
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="flex items-center gap-1.5 font-mono text-[10px] text-[#4a6177] hover:text-[#f0f4f8] transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
          retry
        </button>
      </div>
    );
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (!queueStatus) {
    return (
      <div className="rounded-xl border border-[#1a2a3a] p-4 bg-[#0d1520] flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#00ff88]/30 animate-pulse"
            style={{ animationDelay: `${i * 180}ms` }}
          />
        ))}
        <span className="font-mono text-[10px] text-[#2a3f52] ml-1">connecting...</span>
      </div>
    );
  }

  // ── Loaded ───────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-[#1a2a3a] bg-[#0d1520] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2a3a]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
          <span className="font-mono text-[11px] text-[#4a6177]">queue</span>
        </div>
        <span className="font-mono text-[10px] text-[#2a3f52]">
          {queueStatus.workerCount > 0
            ? `${queueStatus.workerCount} worker${queueStatus.workerCount !== 1 ? 's' : ''} online`
            : 'no workers · cold'}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 divide-x divide-[#1a2a3a]">
        <AnimatePresence>
          {STATS.map(({ key, label, icon: Icon, color, bg, border }) => {
            const value = queueStatus[key] ?? 0;
            return (
              <motion.div
                key={key}
                className={`flex flex-col items-center justify-center gap-1 py-3 px-2 ${bg}`}
              >
                <Icon className={`w-3 h-3 ${color}`} />
                <span className={`font-mono text-[15px] font-semibold leading-none ${
                  value > 0 ? color : 'text-[#2a3f52]'
                }`}>
                  {value}
                </span>
                <span className="font-mono text-[9px] text-[#2a3f52] uppercase tracking-[0.8px]">
                  {label}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}