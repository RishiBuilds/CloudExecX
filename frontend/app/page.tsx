'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Terminal, Shield, Zap, Layers, Code2, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: <Code2 className="w-6 h-6" />,
    title: 'Multi-Language Support',
    description: 'Write and execute Python, JavaScript, and C++ with a VS Code-like editor experience.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Secure Sandboxing',
    description: 'Every execution runs in an isolated Docker container with no network access and strict resource limits.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Lightning Fast',
    description: 'Queue-based processing with configurable workers ensures rapid code execution and auto-scaling.',
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: '100% Free Tier',
    description: 'Built entirely on free-tier services — Vercel, Render, Upstash Redis, MongoDB Atlas, and Clerk.',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-brand-400/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-8"
          >
            <Terminal className="w-4 h-4" />
            Free & Open Source
          </motion.div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6">
            Execute Code
            <br />
            <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-accent-400 bg-clip-text text-transparent">
              In The Cloud
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[var(--text-secondary)] mb-10">
            Write Python, JavaScript, or C++ in a VS Code-like editor and run it
            in secure, isolated Docker containers. Zero setup required.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="group px-8 py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 transition-all shadow-lg hover:shadow-[var(--shadow-glow-lg)] flex items-center gap-2"
            >
              Start Coding
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/sign-in"
              className="px-8 py-3.5 rounded-xl text-base font-semibold border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Code Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-2xl bg-[var(--bg-editor)]">
            {/* Fake Editor Title Bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--border-color)]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs text-[var(--text-muted)] ml-2 font-mono">main.py</span>
            </div>
            {/* Fake Code */}
            <div className="p-6 font-mono text-sm leading-relaxed">
              <div><span className="text-brand-400">def</span> <span className="text-accent-400">fibonacci</span>(n):</div>
              <div className="pl-6"><span className="text-brand-400">if</span> n &lt;= <span className="text-yellow-400">1</span>:</div>
              <div className="pl-12"><span className="text-brand-400">return</span> n</div>
              <div className="pl-6"><span className="text-brand-400">return</span> <span className="text-accent-400">fibonacci</span>(n - <span className="text-yellow-400">1</span>) + <span className="text-accent-400">fibonacci</span>(n - <span className="text-yellow-400">2</span>)</div>
              <div className="mt-2"><span className="text-accent-400">print</span>(<span className="text-accent-400">fibonacci</span>(<span className="text-yellow-400">10</span>))</div>
            </div>
            {/* Fake Output */}
            <div className="border-t border-[var(--border-color)] bg-[var(--console-bg)] p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-emerald-400">OUTPUT</span>
                <span className="text-xs text-[var(--text-muted)]">• 23ms</span>
              </div>
              <pre className="text-sm text-emerald-400 font-mono">55</pre>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] hover:border-brand-500/30 hover:shadow-[var(--shadow-glow)] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/10 to-brand-500/5 flex items-center justify-center text-brand-400 mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-muted)]">
            © 2025 CloudExecX. Built with ❤️ on free-tier services.
          </p>
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
            <span>Next.js</span>
            <span>•</span>
            <span>Docker</span>
            <span>•</span>
            <span>Redis</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
