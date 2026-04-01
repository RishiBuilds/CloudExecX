'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, ChevronDown, Square } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import OutputConsole from '@/components/console/OutputConsole';
import QueueStatusPanel from '@/components/dashboard/QueueStatus';
import { executeCode, pollSubmissionStatus } from '@/lib/api';
import { getLanguageLabel } from '@/lib/utils';


const CodeEditor = dynamic(() => import('@/components/editor/CodeEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full rounded-xl border border-[#1a2a3a] bg-[#080c10] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#00ff88]/40 animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <span className="font-mono text-[11px] text-[#2a3f52]">loading editor...</span>
      </div>
    </div>
  ),
});


const BOILERPLATE: Record<string, string> = {
  python: `# Python 3.11\nprint("Hello, World!")\n`,
  javascript: `// Node.js 20\nconsole.log("Hello, World!");\n`,
  cpp: `// C++17\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n`,
};

const LANGUAGES = ['python', 'javascript', 'cpp'] as const;
type Language = (typeof LANGUAGES)[number];

const LANG_META: Record<Language, { label: string; hint: string }> = {
  python:     { label: 'Python',     hint: '3.11' },
  javascript: { label: 'JavaScript', hint: 'Node 20' },
  cpp:        { label: 'C++',        hint: 'C++17' },
};

const POLL_INTERVAL_MS = 500;
const POLL_INITIAL_DELAY_MS = 300;
const POLL_TIMEOUT_MS = 30_000;


export default function DashboardPage() {
  const { getToken } = useAuth();

  const [language, setLanguage]             = useState<Language>('python');
  const [code, setCode]                     = useState(BOILERPLATE.python);
  const [stdout, setStdout]                 = useState('');
  const [stderr, setStderr]                 = useState('');
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [status, setStatus]                 = useState('');
  const [isRunning, setIsRunning]           = useState(false);
  const [showLangMenu, setShowLangMenu]     = useState(false);

  // Refs for closure-safe state + cleanup
  const pollRef      = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef   = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef(false); // guards the safety timeout against stale closure
  const langMenuRef  = useRef<HTMLDivElement>(null);

  // Click-outside to close language dropdown
  useEffect(() => {
    if (!showLangMenu) return;
    const handler = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showLangMenu]);

  // Cleanup polls on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current)    clearInterval(pollRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);


  const clearOutput = () => {
    setStdout('');
    setStderr('');
    setExecutionTimeMs(null);
    setStatus('');
  };

  const stopPolling = () => {
    if (pollRef.current)    clearInterval(pollRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    pollRef.current    = null;
    timeoutRef.current = null;
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCode(BOILERPLATE[lang]);
    setShowLangMenu(false);
    clearOutput();
  };

  const handleReset = () => {
    setCode(BOILERPLATE[language]);
    clearOutput();
  };

  const handleRun = useCallback(async () => {
    if (isRunning || !code.trim()) return;

    setIsRunning(true);
    completedRef.current = false;
    clearOutput();
    setStatus('queued');

    try {
      const token = await getToken();
      if (!token) {
        setStderr('Authentication error. Please sign in again.');
        setStatus('failed');
        setIsRunning(false);
        return;
      }

      const response = await executeCode({ code, language }, token);

      const pollForResult = async () => {
        try {
          const result = await pollSubmissionStatus(response.submissionId, token);
          const terminal = ['completed', 'failed', 'timeout'].includes(result.status);

          if (terminal) {
            completedRef.current = true;
            setStdout(result.stdout || '');
            setStderr(result.stderr || '');
            setExecutionTimeMs(result.executionTimeMs ?? null);
            setStatus(result.status);
            setIsRunning(false);
            stopPolling();
          } else {
            setStatus(result.status);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      };

      // Initial fast probe, then regular interval
      setTimeout(pollForResult, POLL_INITIAL_DELAY_MS);
      pollRef.current = setInterval(pollForResult, POLL_INTERVAL_MS);

      // Safety timeout — uses ref so it doesn't read stale closure state
      timeoutRef.current = setTimeout(() => {
        if (!completedRef.current) {
          stopPolling();
          setIsRunning(false);
          setStderr('Request timed out. The server may be cold-starting (free tier). Please try again.');
          setStatus('timeout');
        }
      }, POLL_TIMEOUT_MS);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to execute code';
      setStderr(message);
      setStatus('failed');
      setIsRunning(false);
    }
  }, [code, language, isRunning, getToken]);


  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row p-4 gap-4 bg-[#080c10]">

      <div className="flex-[7] flex flex-col gap-3 min-h-0">

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">

            {/* Language selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setShowLangMenu((v) => !v)}
                className="flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-lg border border-[#1a2a3a] bg-[#0d1520] text-sm font-mono font-medium text-[#8ba5be] hover:border-[#00ff88]/30 hover:text-[#f0f4f8] transition-all duration-150"
              >
                <span className="text-[#00ff88] text-[11px] font-semibold">
                  {LANG_META[language].label}
                </span>
                <span className="font-mono text-[9px] text-[#2a3f52]">
                  {LANG_META[language].hint}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-[#2a3f52] transition-transform duration-150 ${
                    showLangMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="absolute top-full mt-1.5 left-0 z-20 w-44 bg-[#0d1520] border border-[#1a2a3a] rounded-xl shadow-2xl overflow-hidden"
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
                        lang === language
                          ? 'bg-[#00ff88]/10 text-[#00ff88]'
                          : 'text-[#4a6177] hover:bg-[#1a2a3a] hover:text-[#8ba5be]'
                      }`}
                    >
                      <span className="font-mono text-[12px] font-medium">
                        {LANG_META[lang].label}
                      </span>
                      <span className="font-mono text-[9px] text-[#2a3f52]">
                        {LANG_META[lang].hint}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-xs text-[#2a3f52] hover:text-[#4a6177] hover:bg-[#1a2a3a] disabled:opacity-30 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              reset
            </button>
          </div>

          {/* Run / Stop button */}
          <button
            onClick={handleRun}
            disabled={!isRunning && !code.trim()}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-sm font-semibold transition-all duration-150 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed ${
              isRunning
                ? 'bg-[#1a2a3a] text-[#4a6177] border border-[#1a2a3a] cursor-default'
                : 'bg-[#00ff88] text-[#080c10] hover:opacity-90 hover:shadow-[0_0_20px_rgba(0,255,136,0.2)]'
            }`}
          >
            {isRunning ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#2a3f52] border-t-[#4a6177] rounded-full animate-spin" />
                running...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-[#080c10]" />
                run
              </>
            )}
          </button>
        </motion.div>

        {/* Monaco editor */}
        <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-[#1a2a3a]">
          <CodeEditor
            language={language}
            value={code}
            onChange={setCode}
            readOnly={isRunning}
          />
        </div>
      </div>

      <div className="flex-[3] flex flex-col gap-3 min-h-0 lg:min-h-full">
        <div className="flex-1 min-h-0">
          <OutputConsole
            stdout={stdout}
            stderr={stderr}
            executionTimeMs={executionTimeMs}
            status={status}
            isLoading={isRunning}
          />
        </div>
        <QueueStatusPanel />
      </div>

    </div>
  );
}