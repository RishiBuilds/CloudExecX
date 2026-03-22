// ============================================================
// CloudExecX — Shared Utilities
// ============================================================

import { SUPPORTED_LANGUAGES, EXECUTION_LIMITS } from '../constants';
import type { Language } from '../types';

/**
 * Validate that a language string is a supported Language type.
 */
export function isValidLanguage(lang: string): lang is Language {
  return SUPPORTED_LANGUAGES.includes(lang as Language);
}

/**
 * Sanitize code input — removes null bytes and limits length.
 * Does NOT strip valid code characters; sanitization is about
 * preventing injection into the container command, not modifying user code.
 */
export function sanitizeCode(code: string): string {
  // Remove null bytes which could cause issues in file writes
  return code.replace(/\0/g, '').slice(0, EXECUTION_LIMITS.MAX_CODE_LENGTH);
}

/**
 * Format execution time for display.
 * @param ms - Execution time in milliseconds
 */
export function formatExecutionTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Generate a unique job ID.
 */
export function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Truncate output strings to prevent MongoDB bloat.
 * Free tier has 512MB — we must be conservative.
 */
export function truncateOutput(output: string, maxLength = 10_000): string {
  if (output.length <= maxLength) return output;
  return output.slice(0, maxLength) + '\n... [output truncated]';
}

/**
 * Calculate pagination metadata.
 */
export function calculatePagination(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
