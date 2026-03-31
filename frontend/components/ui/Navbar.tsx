'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// ─── Nav links (shown when signed in) ────────────────────────────────────────

const NAV_LINKS = [
  { href: '/dashboard',         label: 'Editor' },
  { href: '/dashboard/history', label: 'History' },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mobileOpen]);

  // Close on click-outside
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mobileOpen]);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-[#1a2a3a] bg-[#080c10]/95"
      style={{ backdropFilter: 'blur(12px)' }}
      ref={mobileMenuRef}
    >
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-[#00ff88] rounded-md flex items-center justify-center shrink-0 group-hover:opacity-90 transition-opacity">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
              <path d="M4 7l4-3 4 3-4 3-4-3z" fill="#080c10" />
              <path d="M8 10v6" stroke="#080c10" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M12 10l4 2v4l-4 2-4-2v-4l4-2z" stroke="#080c10" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-mono text-[15px] font-semibold text-[#f0f4f8] tracking-tight">
            Cloud<span className="text-[#00ff88]">Exec</span>X
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <div className="hidden md:flex items-center gap-1">
          <SignedIn>
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 rounded-lg font-mono text-[12px] font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-[#00ff88] bg-[#00ff88]/[0.08]'
                      : 'text-[#4a6177] hover:text-[#8ba5be] hover:bg-[#1a2a3a]/60'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </SignedIn>
        </div>

        {/* ── Desktop auth ── */}
        <div className="hidden md:flex items-center gap-3">
          <SignedOut>
            <Link
              href="/sign-in"
              className="font-mono text-[12px] text-[#4a6177] hover:text-[#8ba5be] transition-colors px-3 py-2 rounded-lg hover:bg-[#1a2a3a]/60"
            >
              sign in
            </Link>
            <Link
              href="/sign-up"
              className="font-[var(--font-syne)] text-[13px] font-bold text-[#080c10] bg-[#00ff88] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Start free
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-7 h-7 ring-1 ring-[#1a2a3a] hover:ring-[#00ff88]/30 transition-all',
                },
              }}
            />
          </SignedIn>
        </div>

        {/* ── Mobile menu button ── */}
        <button
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[#4a6177] hover:text-[#f0f4f8] hover:bg-[#1a2a3a] transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden overflow-hidden border-t border-[#1a2a3a] bg-[#0d1520]"
          >
            <div className="max-w-[1100px] mx-auto px-6 py-4 flex flex-col gap-1">

              <SignedIn>
                {NAV_LINKS.map(({ href, label }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg font-mono text-[13px] transition-colors ${
                        isActive
                          ? 'text-[#00ff88] bg-[#00ff88]/[0.08]'
                          : 'text-[#4a6177] hover:text-[#8ba5be] hover:bg-[#1a2a3a]'
                      }`}
                    >
                      {label}
                      {isActive && (
                        <span className="w-1 h-4 rounded-full bg-[#00ff88]" />
                      )}
                    </Link>
                  );
                })}

                {/* Divider + user */}
                <div className="mt-2 pt-2 border-t border-[#1a2a3a] flex items-center gap-3 px-3 py-2">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: { avatarBox: 'w-7 h-7' },
                    }}
                  />
                  <span className="font-mono text-[11px] text-[#2a3f52]">account</span>
                </div>
              </SignedIn>

              <SignedOut>
                <Link
                  href="/sign-in"
                  className="px-3 py-2.5 rounded-lg font-mono text-[13px] text-[#4a6177] hover:text-[#8ba5be] hover:bg-[#1a2a3a] transition-colors"
                >
                  sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="mt-1 px-3 py-2.5 rounded-lg font-[var(--font-syne)] text-[13px] font-bold text-[#080c10] bg-[#00ff88] text-center hover:opacity-90 transition-opacity"
                >
                  Start free
                </Link>
              </SignedOut>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}