import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with conflict resolution */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format time from milliseconds */
export function formatTime(ms: number | null): string {
  if (ms === null) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/** Format relative time (e.g., "2 minutes ago") */
export function formatRelativeTime(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

/** Get language display name */
export function getLanguageLabel(lang: string): string {
  const labels: Record<string, string> = {
    python: 'Python',
    javascript: 'JavaScript',
    cpp: 'C++',
  };
  return labels[lang] || lang;
}

/** Get language icon color */
export function getLanguageColor(lang: string): string {
  const colors: Record<string, string> = {
    python: '#3572A5',
    javascript: '#F7DF1E',
    cpp: '#00599C',
  };
  return colors[lang] || '#888';
}

/** Get status badge color class */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    queued: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    timeout: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };
  return colors[status] || 'bg-gray-500/10 text-gray-400';
}
