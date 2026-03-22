'use client';

import { motion } from 'framer-motion';
import { Code2, Clock, CheckCircle, XCircle, Timer } from 'lucide-react';
import { formatTime, formatRelativeTime, getLanguageLabel, getStatusColor } from '@/lib/utils';
import type { Submission } from '@/lib/api';

interface SubmissionCardProps {
  submission: Submission;
  onClick?: () => void;
}

export default function SubmissionCard({ submission, onClick }: SubmissionCardProps) {
  const statusIcons: Record<string, React.ReactNode> = {
    completed: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    failed: <XCircle className="w-4 h-4 text-red-400" />,
    timeout: <Timer className="w-4 h-4 text-orange-400" />,
    queued: <Clock className="w-4 h-4 text-yellow-400" />,
    processing: <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] hover:border-brand-500/30 cursor-pointer transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Language & Status */}
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              <Code2 className="w-3.5 h-3.5 text-brand-400" />
              {getLanguageLabel(submission.language)}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusColor(submission.status)}`}>
              {statusIcons[submission.status]}
              {submission.status}
            </span>
          </div>

          {/* Code Preview */}
          <pre className="text-xs text-[var(--text-muted)] font-mono line-clamp-2 mb-2 leading-relaxed">
            {submission.code.slice(0, 150)}
            {submission.code.length > 150 ? '...' : ''}
          </pre>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(submission.createdAt)}
            </span>
            {submission.executionTimeMs !== null && (
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {formatTime(submission.executionTimeMs)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Output Preview */}
      {submission.stdout && (
        <div className="mt-3 p-2 rounded-lg bg-[var(--console-bg)] border border-[var(--border-color)]">
          <pre className="text-xs text-emerald-400 font-mono line-clamp-2">
            {submission.stdout.slice(0, 200)}
          </pre>
        </div>
      )}
    </motion.div>
  );
}
