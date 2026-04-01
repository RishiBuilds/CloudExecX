'use client';

import { motion } from 'framer-motion';
import { Code2, Clock, CheckCircle2, XCircle, Timer, AlertTriangle } from 'lucide-react';
import type { Submission } from '@/lib/api';

// ─── Helpers (self-contained, no external util dependency) ───────────────────

function formatExecTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getLanguageLabel(lang: string): string {
  const map: Record<string, string> = {
    python:     'Python',
    javascript: 'JavaScript',
    cpp:        'C++',
  };
  return map[lang] ?? lang;
}

// ─── Status config — single source of truth ───────────────────────────────────

const STATUS_CONFIG = {
  completed: {
    icon:      <CheckCircle2 className="w-3 h-3" />,
    label:     'completed',
    textColor: 'text-[#00ff88]',
    bg:        'bg-[#00ff88]/[0.06]',
    border:    'border-[#00ff88]/15',
  },
  failed: {
    icon:      <XCircle className="w-3 h-3" />,
    label:     'failed',
    textColor: 'text-red-400',
    bg:        'bg-red-950/20',
    border:    'border-red-900/20',
  },
  timeout: {
    icon:      <Timer className="w-3 h-3" />,
    label:     'timeout',
    textColor: 'text-amber-400',
    bg:        'bg-amber-950/20',
    border:    'border-amber-900/20',
  },
  queued: {
    icon:      <Clock className="w-3 h-3" />,
    label:     'queued',
    textColor: 'text-[#4a6177]',
    bg:        'bg-[#1a2a3a]/40',
    border:    'border-[#1a2a3a]',
  },
  processing: {
    icon: (
      <span className="w-3 h-3 border border-[#4a6177]/40 border-t-[#4a6177] rounded-full animate-spin inline-block" />
    ),
    label:     'running',
    textColor: 'text-[#4a6177]',
    bg:        'bg-[#1a2a3a]/40',
    border:    'border-[#1a2a3a]',
  },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

// ─── Component ────────────────────────────────────────────────────────────────

interface SubmissionCardProps {
  submission: Submission;
  onClick?: () => void;
}

export default function SubmissionCard({ submission, onClick }: SubmissionCardProps) {
  const statusKey  = (submission.status in STATUS_CONFIG ? submission.status : 'queued') as StatusKey;
  const statusConf = STATUS_CONFIG[statusKey];
  const execTime   = submission.executionTimeMs != null
    ? formatExecTime(submission.executionTimeMs)
    : null;

  // Trim code preview purely via CSS — no JS slice
  const hasStdout = Boolean(submission.stdout?.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="group relative flex items-stretch gap-0 rounded-xl border border-[#1a2a3a] bg-[#0d1520] cursor-pointer overflow-hidden transition-colors duration-150 hover:border-[#2a3f52] hover:bg-[#111d29]"
    >
      {/* Left accent bar — reveals on hover */}
      <div className="w-0.5 shrink-0 bg-transparent group-hover:bg-[#00ff88]/40 transition-colors duration-150" />

      {/* Card body */}
      <div className="flex-1 p-4 min-w-0">

        {/* Row 1: language + status badge + metadata */}
        <div className="flex items-center gap-2 flex-wrap mb-2.5">

          {/* Language pill */}
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[#f0f4f8]">
            <Code2 className="w-3 h-3 text-[#00ff88]" />
            {getLanguageLabel(submission.language)}
          </span>

          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-medium border ${statusConf.textColor} ${statusConf.bg} ${statusConf.border}`}
          >
            {statusConf.icon}
            {statusConf.label}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Time metadata — right-aligned */}
          <div className="flex items-center gap-3 font-mono text-[10px] text-[#2a3f52]">
            {execTime && (
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {execTime}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(submission.createdAt)}
            </span>
          </div>
        </div>

        {/* Row 2: code preview — CSS-only truncation, no JS slice */}
        <pre
          className="font-mono text-[11px] text-[#2a3f52] leading-[1.7] overflow-hidden mb-0"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {submission.code}
        </pre>

        {/* Row 3: stdout peek — only when completed and has output */}
        {hasStdout && submission.status === 'completed' && (
          <div className="mt-2.5 pt-2.5 border-t border-[#1a2a3a] flex items-baseline gap-2 min-w-0">
            <span className="font-mono text-[9px] text-[#00ff88]/50 uppercase tracking-[1px] shrink-0">
              out
            </span>
            <pre
              className="font-mono text-[11px] text-[#00ff88] min-w-0 overflow-hidden"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {submission.stdout}
            </pre>
          </div>
        )}

        {/* Stderr peek — only for failed status */}
        {submission.stderr && submission.status === 'failed' && (
          <div className="mt-2.5 pt-2.5 border-t border-[#1a2a3a] flex items-baseline gap-2 min-w-0">
            <AlertTriangle className="w-3 h-3 text-red-400/50 shrink-0 mt-0.5" />
            <pre
              className="font-mono text-[11px] text-red-400 min-w-0 overflow-hidden"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {submission.stderr}
            </pre>
          </div>
        )}

      </div>
    </motion.div>
  );
}