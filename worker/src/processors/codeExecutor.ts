// ============================================================
// CloudExecX — Code Execution Job Processor
// ============================================================
// BullMQ job handler that:
// 1. Picks a job from the queue
// 2. Updates submission status to "processing"
// 3. Executes code in a Docker container
// 4. Stores results in MongoDB
// 5. Updates submission status to "completed"/"failed"/"timeout"

import { Job } from 'bullmq';
import mongoose from 'mongoose';

// Import the Submission model dynamically to avoid circular deps
import { executeInDocker } from '../docker/dockerManager';

// Define the schema inline to avoid import issues across packages
const submissionSchema = new mongoose.Schema(
  {
    userId: String,
    code: String,
    language: String,
    status: { type: String, default: 'queued' },
    stdout: { type: String, default: '' },
    stderr: { type: String, default: '' },
    exitCode: { type: Number, default: null },
    executionTimeMs: { type: Number, default: null },
  },
  { timestamps: true }
);

// Reuse model if already registered (hot-reload safe)
const Submission =
  mongoose.models.Submission || mongoose.model('Submission', submissionSchema);

/** Job data structure */
interface ExecutionJobData {
  submissionId: string;
  userId: string;
  code: string;
  language: string;
  createdAt: string;
}

/**
 * Process a code execution job.
 * Called by BullMQ worker for each job in the queue.
 */
export async function processCodeExecution(job: Job<ExecutionJobData>): Promise<void> {
  const { submissionId, code, language } = job.data;

  console.log(`🔄 Processing submission: ${submissionId} [${language}]`);

  try {
    // ── Mark as Processing ────────────────────────────────
    await Submission.findByIdAndUpdate(submissionId, {
      status: 'processing',
    });

    // ── Execute in Docker Container ───────────────────────
    const result = await executeInDocker(language, code);

    // ── Determine Final Status ────────────────────────────
    let status: string;
    if (result.timedOut) {
      status = 'timeout';
    } else if (result.exitCode !== 0) {
      status = 'failed';
    } else {
      status = 'completed';
    }

    // ── Store Results ─────────────────────────────────────
    await Submission.findByIdAndUpdate(submissionId, {
      status,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      executionTimeMs: result.executionTimeMs,
    });

    console.log(`📊 Submission ${submissionId}: ${status} (${result.executionTimeMs}ms)`);
  } catch (error: any) {
    // ── Handle Unexpected Errors ──────────────────────────
    console.error(`💥 Submission ${submissionId} error:`, error.message);

    await Submission.findByIdAndUpdate(submissionId, {
      status: 'failed',
      stderr: `Internal execution error: ${error.message}`,
      exitCode: 1,
    }).catch((dbErr) => {
      console.error('Failed to update submission after error:', dbErr);
    });

    // Re-throw so BullMQ marks the job as failed
    throw error;
  }
}
