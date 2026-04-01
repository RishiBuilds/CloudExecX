'use client';

import { ElementType } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Zap, Layers, Code2 } from 'lucide-react';


const FEATURES: Array<{
  icon: ElementType;
  title: string;
  detail: string;
  sub: string;
  badge?: string;
}> = [
  {
    icon: Code2,
    title: 'Multi-language',
    detail: 'Python · JS · C++',
    sub: 'More coming soon',
  },
  {
    icon: Shield,
    title: 'Docker sandboxed',
    detail: 'No network access',
    sub: 'Strict resource limits',
  },
  {
    icon: Zap,
    title: 'Queue-based',
    detail: 'BullMQ + Upstash',
    sub: 'Auto-scaling workers',
  },
  {
    icon: Layers,
    title: '100% free tier',
    detail: 'Vercel · Render',
    sub: 'Atlas · Clerk',
    badge: '$0/mo',
  },
];

const STATS: Array<{
  value: string;
  label: string;
  accent?: boolean;
}> = [
  { value: '3',       label: 'languages' },
  { value: '<500ms',  label: 'avg exec time' },
  { value: '$0',      label: 'forever', accent: true },
];


const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};


export default function HomePage() {
  return (
    <div className="relative bg-[#080c10] text-[#f0f4f8] overflow-hidden">

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,255,136,0.06)_0%,transparent_70%)]" />

      <section className="relative z-10 max-w-[1100px] mx-auto px-6 lg:px-10 pt-20 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left copy */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Eyebrow */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#1a2a3a] rounded-full bg-[#0d1520] mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="font-mono text-[10px] text-[#4a6177] uppercase tracking-[0.8px]">
              sandbox online
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            className="font-[var(--font-syne)] text-[52px] sm:text-[60px] lg:text-[64px] font-extrabold leading-[1.04] tracking-[-2.5px] mb-5"
          >
            Run code.<br />
            <span className="text-[#00ff88]">No setup.</span><br />
            Ever.
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeUp}
            className="font-mono text-[13px] text-[#4a6177] leading-[1.85] mb-9 max-w-[380px]"
          >
            Write Python, JS, or C++ in a Monaco editor.<br />
            Execute in isolated Docker containers.<br />
            See output in &lt;500ms.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-2 px-6 py-3.5 bg-[#00ff88] text-[#080c10] rounded-[10px] font-[var(--font-syne)] text-sm font-bold tracking-[0.2px] hover:opacity-90 transition-opacity"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <polygon points="3,2 13,8 3,14" fill="#080c10" />
              </svg>
              Start coding free
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-6 py-3.5 font-mono text-[12px] text-[#2a3f52] border border-[#1a2a3a] rounded-[10px] hover:text-[#4a6177] hover:border-[#2a3f52] transition-colors"
            >
              $ sign in
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-8 mt-10 pt-8 border-t border-[#1a2a3a]"
          >
            {STATS.map(({ value, label, accent }) => (
              <div key={label}>
                <div
                  className={`font-[var(--font-syne)] text-[22px] font-extrabold tracking-[-1px] ${
                    accent ? 'text-[#00ff88]' : 'text-[#f0f4f8]'
                  }`}
                >
                  {value}
                </div>
                <div className="font-mono text-[10px] text-[#2a3f52] mt-0.5 uppercase tracking-[0.8px]">
                  {label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Code preview */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-[#0d1520] border border-[#1a2a3a] rounded-2xl overflow-hidden"
        >
          {/* Editor title bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#080c10] border-b border-[#1a2a3a]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            </div>
            <span className="font-mono text-[11px] text-[#2a3f52]">fibonacci.py</span>
            <span className="font-mono text-[9px] text-[#2a3f52] px-2 py-1 bg-[#0d1520] border border-[#1a2a3a] rounded">
              Python 3.11
            </span>
          </div>

          {/* Syntax-highlighted code */}
          <div className="font-mono text-[12px] leading-[1.9] p-5 text-[#8ba5be]">
            <div>
              <span className="text-[#4a6177] select-none mr-4">1</span>
              <span className="text-[#7dd3fc]">def </span>
              <span className="text-[#00ff88]">fibonacci</span>
              <span className="text-[#f0f4f8]">(n: int) -&gt; int:</span>
            </div>
            <div>
              <span className="text-[#4a6177] select-none mr-4">2</span>
              <span className="pl-6 inline-block">
                <span className="text-[#7dd3fc]">if </span>
                <span className="text-[#f0f4f8]">n &lt;= 1:</span>
              </span>
            </div>
            <div>
              <span className="text-[#4a6177] select-none mr-4">3</span>
              <span className="pl-12 inline-block">
                <span className="text-[#7dd3fc]">return </span>
                <span className="text-[#f0f4f8]">n</span>
              </span>
            </div>
            <div>
              <span className="text-[#4a6177] select-none mr-4">4</span>
              <span className="pl-6 inline-block">
                <span className="text-[#7dd3fc]">return </span>
                <span className="text-[#00ff88]">fibonacci</span>
                <span className="text-[#f0f4f8]">(n-1) + </span>
                <span className="text-[#00ff88]">fibonacci</span>
                <span className="text-[#f0f4f8]">(n-2)</span>
              </span>
            </div>
            <div className="mt-2">
              <span className="text-[#4a6177] select-none mr-4">6</span>
              <span className="text-[#00ff88]">print</span>
              <span className="text-[#f0f4f8]">(</span>
              <span className="text-[#00ff88]">fibonacci</span>
              <span className="text-[#f0f4f8]">(10))</span>
            </div>
          </div>

          {/* Output console */}
          <div className="border-t border-[#1a2a3a] px-5 py-4 bg-[#080c10]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1" width="14" height="14" rx="2" stroke="#00ff88" strokeWidth="1.5" />
                  <path d="M4 8h8M4 5l3 3-3 3" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="font-mono text-[9px] text-[#00ff88] uppercase tracking-[1px]">stdout</span>
              </div>
              <span className="font-mono text-[9px] text-[#2a3f52]">23ms · exit 0</span>
            </div>
            <pre className="font-mono text-[13px] text-[#00ff88] m-0">55</pre>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 max-w-[1100px] mx-auto px-6 lg:px-10 pb-24">
        <div className="border-t border-[#1a2a3a] pt-14">
          <p className="font-mono text-[10px] text-[#2a3f52] uppercase tracking-[2px] mb-10">
            // why cloudexecx
          </p>

          {/* 4-column feature grid — joined borders like a table */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#1a2a3a] rounded-2xl overflow-hidden"
            style={{ gap: '1px', background: '#1a2a3a' }}
          >
            {FEATURES.map(({ icon: Icon, title, detail, sub, badge }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="relative bg-[#0d1520] p-7 group hover:bg-[#111d29] transition-colors duration-200"
              >
                {badge && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-[#00ff88]/[0.08] border border-[#00ff88]/20 rounded-full">
                    <span className="font-mono text-[9px] text-[#00ff88]">{badge}</span>
                  </div>
                )}
                <div className="w-9 h-9 border border-[#1a2a3a] rounded-lg flex items-center justify-center mb-4 group-hover:border-[#00ff88]/20 transition-colors">
                  <Icon className="w-4 h-4 text-[#00ff88]" />
                </div>
                <div className="font-[var(--font-syne)] text-[14px] font-bold text-[#f0f4f8] mb-2 tracking-[-0.3px]">
                  {title}
                </div>
                <div className="font-mono text-[11px] text-[#2a3f52] leading-[1.7]">
                  {detail}<br />{sub}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[#1a2a3a] px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-mono text-[11px] text-[#2a3f52]">© 2026 CloudExecX</span>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
          <span className="font-mono text-[10px] text-[#2a3f52]">all systems operational</span>
        </div>
        <div className="font-mono text-[11px] text-[#2a3f52] flex items-center gap-3">
          <span>Next.js</span>
          <span className="text-[#1a2a3a]">·</span>
          <span>Docker</span>
          <span className="text-[#1a2a3a]">·</span>
          <span>Redis</span>
        </div>
      </footer>

    </div>
  );
}