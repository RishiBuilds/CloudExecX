'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronLeft, ChevronRight, Filter, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { getSubmissions, type Submission, type PaginatedSubmissions } from '@/lib/api';
import SubmissionCard from '@/components/dashboard/SubmissionCard';
import { getLanguageLabel } from '@/lib/utils';

const LANGUAGES = ['all', 'python', 'javascript', 'cpp'];

export default function HistoryPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState<PaginatedSubmissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [languageFilter, setLanguageFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const result = await getSubmissions(
        token,
        page,
        10,
        languageFilter !== 'all' ? languageFilter : undefined
      );
      setData(result);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, page, languageFilter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-4 lg:p-6 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/10 to-brand-500/5 flex items-center justify-center">
            <History className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Submission History</h1>
            <p className="text-sm text-[var(--text-muted)]">
              {data?.total || 0} total submissions
            </p>
          </div>
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--text-muted)]" />
          <div className="flex rounded-lg border border-[var(--border-color)] overflow-hidden">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguageFilter(lang);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  languageFilter === lang
                    ? 'bg-brand-500/10 text-brand-400'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                {lang === 'all' ? 'All' : getLanguageLabel(lang)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
            <span className="text-sm text-[var(--text-muted)]">Loading submissions...</span>
          </div>
        ) : !data?.data.length ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <History className="w-12 h-12 text-[var(--text-muted)] opacity-30" />
            <p className="text-sm text-[var(--text-muted)]">No submissions yet</p>
            <p className="text-xs text-[var(--text-muted)]">
              Go to the Editor to write and run code
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${page}-${languageFilter}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {data.data.map((submission) => (
                <SubmissionCard
                  key={submission._id}
                  submission={submission}
                  onClick={() => setSelectedSubmission(submission)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-[var(--border-color)] mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm border border-[var(--border-color)] disabled:opacity-30 hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <span className="text-sm text-[var(--text-muted)]">
            Page {page} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm border border-[var(--border-color)] disabled:opacity-30 hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Submission Detail Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedSubmission(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[80vh] overflow-auto rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold mb-4">Submission Detail</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Code</label>
                  <pre className="mt-1 p-3 rounded-lg bg-[var(--bg-editor)] font-mono text-sm overflow-auto max-h-48 border border-[var(--border-color)]">
                    {selectedSubmission.code}
                  </pre>
                </div>
                {selectedSubmission.stdout && (
                  <div>
                    <label className="text-xs font-semibold text-emerald-400 uppercase">Output</label>
                    <pre className="mt-1 p-3 rounded-lg bg-[var(--console-bg)] text-emerald-400 font-mono text-sm overflow-auto max-h-32 border border-[var(--border-color)]">
                      {selectedSubmission.stdout}
                    </pre>
                  </div>
                )}
                {selectedSubmission.stderr && (
                  <div>
                    <label className="text-xs font-semibold text-red-400 uppercase">Error</label>
                    <pre className="mt-1 p-3 rounded-lg bg-[var(--console-bg)] text-red-400 font-mono text-sm overflow-auto max-h-32 border border-[var(--border-color)]">
                      {selectedSubmission.stderr}
                    </pre>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="mt-6 w-full py-2 rounded-lg border border-[var(--border-color)] text-sm font-medium hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
