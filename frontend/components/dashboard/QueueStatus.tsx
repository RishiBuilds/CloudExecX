'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { getQueueStatus, type QueueStatus } from '@/lib/api';

export default function QueueStatusPanel() {
  const { getToken } = useAuth();
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await getQueueStatus(token);
        setStatus(data);
        setError(null);
      } catch (err: any) {
        setError('Unable to fetch queue status');
      }
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 5000);

    return () => clearInterval(interval);
  }, [getToken]);

  if (error) {
    return (
      <div className="rounded-xl border border-[var(--border-color)] p-4 bg-[var(--card-bg)]">
        <p className="text-sm text-[var(--text-muted)]">{error}</p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="rounded-xl border border-[var(--border-color)] p-4 bg-[var(--card-bg)] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
      </div>
    );
  }

  const stats = [
    { label: 'Active', value: status.active, icon: <Activity className="w-4 h-4" />, color: 'text-blue-400' },
    { label: 'Waiting', value: status.waiting, icon: <Clock className="w-4 h-4" />, color: 'text-yellow-400' },
    { label: 'Completed', value: status.completed, icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-400' },
    { label: 'Failed', value: status.failed, icon: <XCircle className="w-4 h-4" />, color: 'text-red-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[var(--border-color)] p-4 bg-[var(--card-bg)]"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-400" />
          Queue Monitor
        </h3>
        <span className="text-xs text-[var(--text-muted)]">
          {status.workerCount} worker{status.workerCount !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon, color }) => (
          <div
            key={label}
            className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-tertiary)]"
          >
            <span className={color}>{icon}</span>
            <div>
              <p className="text-lg font-bold leading-none">{value}</p>
              <p className="text-xs text-[var(--text-muted)]">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
