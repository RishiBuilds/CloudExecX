// ============================================================
// CloudExecX — BullMQ Queue Utility
// ============================================================

import { Queue } from 'bullmq';

let queueInstance: Queue | null = null;

/**
 * Parse a Redis URL into BullMQ-compatible connection options.
 * This avoids importing ioredis separately (which causes type conflicts
 * with BullMQ's bundled ioredis version) and enforces TLS for Upstash.
 */
function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 6379,
    password: parsed.password || undefined,
    username: parsed.username !== 'default' ? parsed.username : undefined,
    tls: parsed.hostname.includes('upstash.io') || parsed.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
    maxRetriesPerRequest: null as null,
    enableReadyCheck: false,
  };
}

/**
 * Get or create the BullMQ code execution queue.
 */
export function getQueue(): Queue {
  if (queueInstance) return queueInstance;

  const url = process.env.UPSTASH_REDIS_URL;
  if (!url) {
    throw new Error('UPSTASH_REDIS_URL environment variable is not set');
  }

  queueInstance = new Queue('code-execution', {
    connection: parseRedisUrl(url),
    defaultJobOptions: {
      attempts: 1,
      removeOnComplete: {
        age: 3600, // Keep completed jobs for 1 hour
        count: 100,
      },
      removeOnFail: {
        age: 86400, // Keep failed jobs for 24 hours
      },
    },
  });

  return queueInstance;
}
