// ============================================================
// CloudExecX — Worker Entry Point
// ============================================================
// Starts BullMQ worker(s) that consume code execution jobs
// from the Redis queue and process them using Docker containers.

import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from project root (parent of worker/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import { processCodeExecution } from './processors/codeExecutor';

const QUEUE_NAME = 'code-execution';

/**
 * Parse a Redis URL into BullMQ-compatible connection options.
 * This avoids importing ioredis separately (which causes type conflicts
 * with BullMQ's bundled ioredis version).
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

async function startWorker() {
  // ── Connect to MongoDB ──────────────────────────────────
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI is required');
  
  await mongoose.connect(mongoUri, {
    maxPoolSize: 5,
    minPoolSize: 1,
  });
  console.log('📦 Worker connected to MongoDB');

  // ── Connect to Redis ────────────────────────────────────
  const redisUrl = process.env.UPSTASH_REDIS_URL;
  if (!redisUrl) throw new Error('UPSTASH_REDIS_URL is required');

  const connectionOptions = parseRedisUrl(redisUrl);

  // ── Worker Concurrency ──────────────────────────────────
  // Configurable via environment variable for scaling simulation.
  // Increase WORKER_CONCURRENCY to simulate adding more "instances".
  const concurrency = parseInt(process.env.WORKER_CONCURRENCY || '2');

  // ── Start BullMQ Worker ─────────────────────────────────
  const worker = new Worker(
    QUEUE_NAME,
    processCodeExecution,
    {
      connection: connectionOptions,
      concurrency,
      // Lock duration should exceed our max execution time (5s)
      // plus buffer for Docker startup and cleanup
      lockDuration: 30000,
    }
  );

  // ── Worker Event Handlers ───────────────────────────────
  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed [${job.data.language}]`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('Worker error:', err);
  });

  worker.on('active', (job) => {
    console.log(`⚙️  Processing job ${job.id} [${job.data.language}]`);
  });

  console.log(`🔧 Worker started with concurrency: ${concurrency}`);
  console.log('👂 Listening for jobs...');

  // ── Graceful Shutdown ───────────────────────────────────
  const shutdown = async () => {
    console.log('\n🛑 Shutting down worker...');
    await worker.close();
    await mongoose.disconnect();
    console.log('👋 Worker shut down gracefully');
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startWorker().catch((err) => {
  console.error('❌ Worker startup failed:', err);
  process.exit(1);
});
