'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Code2, History, Activity, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Editor', icon: <Code2 className="w-4 h-4" /> },
  { href: '/dashboard/history', label: 'History', icon: <History className="w-4 h-4" /> },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 gap-1">
        <div className="flex items-center gap-2 px-3 py-2 mb-4">
          <LayoutDashboard className="w-5 h-5 text-brand-400" />
          <span className="text-sm font-semibold">Dashboard</span>
        </div>
        {navItems.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              pathname === href
                ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
            )}
          >
            {icon}
            {label}
          </Link>
        ))}
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex">
        {navItems.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
              pathname === href
                ? 'text-brand-400'
                : 'text-[var(--text-muted)]'
            )}
          >
            {icon}
            {label}
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
