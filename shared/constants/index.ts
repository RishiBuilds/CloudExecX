// ============================================================
// CloudExecX — Shared Constants
// ============================================================

import type { Language } from '../types';

/** Supported languages and their Docker image tags */
export const LANGUAGE_CONFIG: Record<Language, {
  image: string;
  extension: string;
  compileCmd?: string;
  runCmd: string;
  boilerplate: string;
}> = {
  python: {
    image: 'cloudexecx-python',
    extension: '.py',
    runCmd: 'python3 /tmp/code.py',
    boilerplate: '# Python 3.11\nprint("Hello, World!")\n',
  },
  javascript: {
    image: 'cloudexecx-javascript',
    extension: '.js',
    runCmd: 'node /tmp/code.js',
    boilerplate: '// Node.js 20\nconsole.log("Hello, World!");\n',
  },
  cpp: {
    image: 'cloudexecx-cpp',
    extension: '.cpp',
    compileCmd: 'g++ -o /tmp/code /tmp/code.cpp -std=c++17',
    runCmd: '/tmp/code',
    boilerplate: [
      '// C++17',
      '#include <iostream>',
      '',
      'int main() {',
      '    std::cout << "Hello, World!" << std::endl;',
      '    return 0;',
      '}',
      '',
    ].join('\n'),
  },
};

/** Security limits for Docker containers */
export const EXECUTION_LIMITS = {
  /** Maximum execution time in milliseconds */
  TIMEOUT_MS: 5000,
  /** Memory limit for containers */
  MEMORY_LIMIT: '128m',
  /** CPU limit (0.5 = 50% of one core) */
  CPU_LIMIT: 0.5,
  /** Maximum code length in characters */
  MAX_CODE_LENGTH: 50_000,
  /** Network mode — disabled for security */
  NETWORK_MODE: 'none' as const,
} as const;

/** Queue configuration */
export const QUEUE_CONFIG = {
  /** Queue name in Redis */
  QUEUE_NAME: 'code-execution',
  /** Maximum attempts before marking as failed */
  MAX_ATTEMPTS: 1,
  /** Job timeout (slightly longer than execution timeout to allow cleanup) */
  JOB_TIMEOUT_MS: 15_000,
} as const;

/** Pagination defaults */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
} as const;

/** Supported languages list */
export const SUPPORTED_LANGUAGES: Language[] = ['python', 'javascript', 'cpp'];

/** API route paths */
export const API_ROUTES = {
  EXECUTE: '/api/execute',
  SUBMISSIONS: '/api/submissions',
  QUEUE_STATUS: '/api/queue/status',
} as const;
