'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, ChevronDown } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import OutputConsole from '@/components/console/OutputConsole';
import QueueStatusPanel from '@/components/dashboard/QueueStatus';
import { executeCode, pollSubmissionStatus } from '@/lib/api';
import { getLanguageLabel } from '@/lib/utils';

// Dynamic import Monaco to avoid SSR issues
const CodeEditor = dynamic(() => import('@/components/editor/CodeEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-editor)] flex items-center justify-center">
      <div className="animate-pulse text-sm text-[var(--text-muted)]">Loading editor...</div>
    </div>
  ),
});

// Language boilerplate
const BOILERPLATE: Record<string, string> = {
  python: `# Python 3.11\nprint("Hello, World!")\n`,
  javascript: `// Node.js 20\nconsole.log("Hello, World!");\n`,
  cpp: `// C++17\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n`,
};

const LANGUAGES = ['python', 'javascript', 'cpp'];

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(BOILERPLATE.python);
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [status, setStatus] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(BOILERPLATE[lang] || '');
    setShowLangMenu(false);
    // Clear previous output
    setStdout('');
    setStderr('');
    setExecutionTimeMs(null);
    setStatus('');
  };

  const handleReset = () => {
    setCode(BOILERPLATE[language] || '');
    setStdout('');
    setStderr('');
    setExecutionTimeMs(null);
    setStatus('');
  };

  const handleRun = useCallback(async () => {
    if (isRunning || !code.trim()) return;

    setIsRunning(true);
    setStdout('');
    setStderr('');
    setExecutionTimeMs(null);
    setStatus('queued');

    try {
      const token = await getToken();
      if (!token) {
        setStderr('Authentication error. Please sign in again.');
        setStatus('failed');
        setIsRunning(false);
        return;
      }

      // Submit code for execution
      const response = await executeCode({ code, language }, token);
      setStatus('queued');

      // Poll for results
      const pollForResult = async () => {
        try {
          const result = await pollSubmissionStatus(response.submissionId, token);

          if (result.status === 'completed' || result.status === 'failed' || result.status === 'timeout') {
            setStdout(result.stdout || '');
            setStderr(result.stderr || '');
            setExecutionTimeMs(result.executionTimeMs);
            setStatus(result.status);
            setIsRunning(false);
            if (pollRef.current) clearInterval(pollRef.current);
          } else {
            setStatus(result.status);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      };

      // Poll every 500ms
      pollRef.current = setInterval(pollForResult, 500);
      // Also poll immediately
      setTimeout(pollForResult, 300);

      // Safety timeout: stop polling after 30 seconds
      setTimeout(() => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          setIsRunning(false);
          if (!stdout && !stderr) {
            setStderr('Request timed out. The server may be waking up (free tier). Please try again.');
            setStatus('timeout');
          }
        }
      }, 30000);
    } catch (error: any) {
      setStderr(error.message || 'Failed to execute code');
      setStatus('failed');
      setIsRunning(false);
    }
  }, [code, language, isRunning, getToken, stdout, stderr]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row p-4 gap-4">
      {/* Left: Editor Panel (70%) */}
      <div className="flex-[7] flex flex-col gap-3 min-h-0">
        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-sm font-medium hover:border-brand-500/50 transition-colors"
              >
                {getLanguageLabel(language)}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showLangMenu && (
                <div className="absolute top-full mt-1 left-0 z-20 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg shadow-xl overflow-hidden">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--bg-tertiary)] transition-colors ${
                        lang === language ? 'text-brand-400 font-semibold' : ''
                      }`}
                    >
                      {getLanguageLabel(lang)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={isRunning || !code.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-emerald-500/25"
          >
            {isRunning ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </motion.div>

        {/* Editor */}
        <div className="flex-1 min-h-0">
          <CodeEditor
            language={language}
            value={code}
            onChange={setCode}
            readOnly={isRunning}
          />
        </div>
      </div>

      {/* Right: Output + Queue (30%) */}
      <div className="flex-[3] flex flex-col gap-3 min-h-0 lg:min-h-full">
        {/* Output Console */}
        <div className="flex-1 min-h-0">
          <OutputConsole
            stdout={stdout}
            stderr={stderr}
            executionTimeMs={executionTimeMs}
            status={status}
            isLoading={isRunning}
          />
        </div>

        {/* Queue Status */}
        <QueueStatusPanel />
      </div>
    </div>
  );
}
