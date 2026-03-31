'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Code2, History } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Nav config ──────────────────────────────────────────────────────────────
// Add items here — sidebar and mobile nav both derive from this single source.

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Editor',
    icon: Code2,
    description: 'Write & execute code',
  },
  {
    href: '/dashboard/history',
    label: 'History',
    icon: History,
    description: 'Past executions',
  },
] as const;

// ─── Layout ──────────────────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#080c10]">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-52 shrink-0 border-r border-[#1a2a3a] bg-[#0d1520]">

        {/* Sidebar brand strip */}
        <div className="px-4 py-5 border-b border-[#1a2a3a]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#00ff88] rounded-md flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M4 7l4-3 4 3-4 3-4-3z" fill="#080c10" />
                <path d="M8 10v6" stroke="#080c10" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 10l4 2v4l-4 2-4-2v-4l4-2z" stroke="#080c10" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-mono text-[13px] font-semibold text-[#f0f4f8] tracking-tight">
              Cloud<span className="text-[#00ff88]">Exec</span>X
            </span>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-0.5 p-3 flex-1" aria-label="Dashboard navigation">
          <p className="font-mono text-[9px] text-[#2a3f52] uppercase tracking-[1.5px] px-3 py-2">
            workspace
          </p>
          {NAV_ITEMS.map(({ href, label, icon: Icon, description }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20'
                    : 'text-[#4a6177] hover:text-[#8ba5be] hover:bg-[#1a2a3a]/60 border border-transparent'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-[#00ff88]' : 'text-[#2a3f52] group-hover:text-[#4a6177]'
                  )}
                />
                <div className="flex flex-col min-w-0">
                  <span className="leading-none">{label}</span>
                  <span
                    className={cn(
                      'font-mono text-[9px] leading-none mt-0.5 truncate transition-colors',
                      isActive ? 'text-[#00ff88]/50' : 'text-[#2a3f52]'
                    )}
                  >
                    {description}
                  </span>
                </div>

                {/* Active indicator bar */}
                {isActive && (
                  <span className="ml-auto w-1 h-4 rounded-full bg-[#00ff88] shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer — system status */}
        <div className="p-4 border-t border-[#1a2a3a]">
          <div className="flex items-center gap-2 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse shrink-0" />
            <span className="font-mono text-[9px] text-[#2a3f52] leading-tight">
              sandbox online
            </span>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      {/* pb-16 on mobile gives space above the fixed bottom nav */}
      <div className="flex-1 overflow-hidden pb-16 lg:pb-0">
        {children}
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav
        aria-label="Dashboard navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-[#1a2a3a] bg-[#0d1520]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex-1 flex flex-col items-center gap-1.5 pt-3 pb-2 text-[10px] font-mono font-medium transition-colors relative',
                isActive ? 'text-[#00ff88]' : 'text-[#2a3f52]'
              )}
            >
              {/* Active top bar */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#00ff88]" />
              )}
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}