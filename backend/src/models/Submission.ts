// ============================================================
// CloudExecX — Submission MongoDB Model
// ============================================================

import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  userId: string;
  code: string;
  language: 'python' | 'javascript' | 'cpp';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'timeout';
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTimeMs: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    userId: {
      type: String,
      required: true,
      index: true, // Index for per-user queries
    },
    code: {
      type: String,
      required: true,
      maxlength: 50000, // Match EXECUTION_LIMITS.MAX_CODE_LENGTH
    },
    language: {
      type: String,
      required: true,
      enum: ['python', 'javascript', 'cpp'],
    },
    status: {
      type: String,
      required: true,
      default: 'queued',
      enum: ['queued', 'processing', 'completed', 'failed', 'timeout'],
    },
    stdout: {
      type: String,
      default: '',
    },
    stderr: {
      type: String,
      default: '',
    },
    exitCode: {
      type: Number,
      default: null,
    },
    executionTimeMs: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true, // Auto-manage createdAt and updatedAt
  }
);

// Compound index for efficient per-user pagination queries
submissionSchema.index({ userId: 1, createdAt: -1 });

// TTL index: auto-delete submissions older than 30 days
// This keeps MongoDB Atlas free tier usage under 512MB
submissionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);
