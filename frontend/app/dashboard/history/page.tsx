'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Clock,
  Terminal,
  CheckCircle2,
  XCircle,
  Code2,
} from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { getSubmissions, type Submission, type PaginatedSubmissions } from '@/lib/api';
import SubmissionCard from '@/components/dashboard/SubmissionCard';
import { getLanguageLabel } from '@/lib/utils';


const LANGUAGES = ['all', 'python', 'javascript', 'cpp'] as const;
type LangFilter = (typeof LANGUAGES)[number];

const LANG_LABELS: Record<string, string> = {
  all: 'All',
  python: 'Python',
  javascript: 'JS',
  cpp: 'C++',
};


function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}


function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-64 gap-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#0d1520] border border-[#1a2a3a] flex items-center justify-center">
        <Terminal className="w-7 h-7 text-[#2a3f52]" />
      </div>
      <div className="text-center">
        <p className="font-mono text-sm text-[#4a6177]">
          {filtered ? '// no matches for this filter' : '// no executions yet'}
        </p>
        <p className="font-mono text-xs text-[#2a3f52] mt-1">
          {filtered ? 'try a different language' : 'head to the editor and run some code'}
        </p>
      </div>
    </motion.div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-64 gap-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-red-950/20 border border-red-900/30 flex items-center justify-center">
        <XCircle className="w-7 h-7 text-red-500/60" />
      </div>
      <div className="text-center">
        <p className="font-mono text-sm text-[#4a6177]">// failed to fetch submissions</p>
        <button
          onClick={onRetry}
          className="mt-3 font-mono text-xs text-[#00ff88] hover:opacity-70 transition-opacity"
        >
          $ retry
        </button>
      </div>
    </motion.div>
  );
}

function DetailModal({
  submission,
  onClose,
}: {
  submission: Submission;
  onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const succeeded = !submission.stderr;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,12,16,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-[#1a2a3a] bg-[#0d1520] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2a3a] shrink-0">
          <div className="flex items-center gap-3">
            {succeeded ? (
              <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
            <span className="font-mono text-sm text-[#f0f4f8] font-medium">
              {getLanguageLabel(submission.language)}
            </span>
            <span className="font-mono text-xs text-[#2a3f52]">
              · {formatRelativeTime(submission.createdAt)}
            </span>
            {submission.executionTimeMs !== null && (
              <span className="flex items-center gap-1 font-mono text-xs text-[#2a3f52]">
                <Clock className="w-3 h-3" />
                {submission.executionTimeMs}ms
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[#2a3f52] hover:text-[#f0f4f8] hover:bg-[#1a2a3a] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-auto flex-1 p-5 space-y-4">
          {/* Code block */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Code2 className="w-3.5 h-3.5 text-[#2a3f52]" />
              <span className="font-mono text-[10px] text-[#2a3f52] uppercase tracking-widest">
                source
              </span>
            </div>
            <pre className="p-4 rounded-xl bg-[#080c10] border border-[#1a2a3a] font-mono text-[13px] text-[#8ba5be] overflow-auto max-h-52 leading-relaxed">
              {submission.code}
            </pre>
          </div>

          {/* stdout */}
          {submission.stdout && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Terminal className="w-3.5 h-3.5 text-[#00ff88]/60" />
                <span className="font-mono text-[10px] text-[#00ff88]/60 uppercase tracking-widest">
                  stdout
                </span>
              </div>
              <pre className="p-4 rounded-xl bg-[#080c10] border border-[#00ff88]/10 font-mono text-[13px] text-[#00ff88] overflow-auto max-h-36 leading-relaxed">
                {submission.stdout}
              </pre>
            </div>
          )}

          {/* stderr */}
          {submission.stderr && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <XCircle className="w-3.5 h-3.5 text-red-400/60" />
                <span className="font-mono text-[10px] text-red-400/60 uppercase tracking-widest">
                  stderr
                </span>
              </div>
              <pre className="p-4 rounded-xl bg-[#080c10] border border-red-900/20 font-mono text-[13px] text-red-400 overflow-auto max-h-36 leading-relaxed">
                {submission.stderr}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 border-t border-[#1a2a3a] flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#2a3f52]">
            id: {submission._id}
          </span>
          <button
            onClick={onClose}
            className="font-mono text-xs text-[#4a6177] hover:text-[#f0f4f8] transition-colors"
          >
            esc to close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}


export default function HistoryPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState<PaginatedSubmissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [page, setPage] = useState(1);
  const [langFilter, setLangFilter] = useState<LangFilter>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const token = await getToken();
      if (!token) return;
      const result = await getSubmissions(
        token,
        page,
        10,
        langFilter !== 'all' ? langFilter : undefined
      );
      setData(result);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, page, langFilter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  function handleLangFilter(lang: LangFilter) {
    setLangFilter(lang);
    setPage(1);
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#080c10] overflow-hidden">

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="shrink-0 px-6 py-5 border-b border-[#1a2a3a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0d1520] border border-[#1a2a3a] flex items-center justify-center">
            <History className="w-4 h-4 text-[#00ff88]" />
          </div>
          <div>
            <h1 className="font-[var(--font-syne)] text-[17px] font-bold text-[#f0f4f8] leading-none mb-0.5">
              Execution History
            </h1>
            <p className="font-mono text-[11px] text-[#2a3f52]">
              {data?.total ?? 0} runs logged
            </p>
          </div>
        </div>

        {/* Language filter pills */}
        <div className="flex items-center gap-1 p-1 bg-[#0d1520] border border-[#1a2a3a] rounded-xl">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLangFilter(lang)}
              className={`relative px-3 py-1.5 rounded-lg font-mono text-[11px] font-medium transition-colors duration-150 ${
                langFilter === lang
                  ? 'text-[#080c10]'
                  : 'text-[#4a6177] hover:text-[#8ba5be]'
              }`}
            >
              {langFilter === lang && (
                <motion.span
                  layoutId="lang-pill"
                  className="absolute inset-0 bg-[#00ff88] rounded-lg"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">{LANG_LABELS[lang]}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <div className="flex-1 overflow-auto px-6 py-5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="w-6 h-6 text-[#00ff88] animate-spin" />
            <span className="font-mono text-[11px] text-[#2a3f52]">
              fetching runs...
            </span>
          </div>
        ) : hasError ? (
          <ErrorState onRetry={fetchSubmissions} />
        ) : !data?.data.length ? (
          <EmptyState filtered={langFilter !== 'all'} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${page}-${langFilter}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-2"
            >
              {data.data.map((submission, i) => (
                <motion.div
                  key={submission._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <SubmissionCard
                    submission={submission}
                    onClick={() => setSelectedSubmission(submission)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-[#1a2a3a]">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs text-[#4a6177] border border-[#1a2a3a] disabled:opacity-25 hover:border-[#00ff88]/40 hover:text-[#f0f4f8] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            prev
          </button>

          {/* Page dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: Math.min(data.totalPages, 7) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-6 h-6 rounded-md font-mono text-[10px] transition-colors ${
                    p === page
                      ? 'bg-[#00ff88] text-[#080c10] font-semibold'
                      : 'text-[#2a3f52] hover:text-[#4a6177]'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs text-[#4a6177] border border-[#1a2a3a] disabled:opacity-25 hover:border-[#00ff88]/40 hover:text-[#f0f4f8] transition-colors"
          >
            next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <AnimatePresence>
        {selectedSubmission && (
          <DetailModal
            submission={selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}