// ============================================================
// CloudExecX — Execute API Route
// ============================================================
// POST /api/execute
// Validates code input, creates a submission record, and
// enqueues a job for the worker to process.

import { Router, Request, Response } from 'express';
import { requireAuthentication, getUserId } from '../middleware/auth';
import { Submission } from '../models/Submission';
import { getQueue } from '../utils/queue';

const SUPPORTED_LANGUAGES = ['python', 'javascript', 'cpp'];
const MAX_CODE_LENGTH = 50_000;

export const executeRouter = Router();

executeRouter.post('/', requireAuthentication, async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { code, language } = req.body;

    // ── Input Validation ────────────────────────────────
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Code is required and must be a string',
        statusCode: 400,
      });
    }

    if (!language || !SUPPORTED_LANGUAGES.includes(language)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: `Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`,
        statusCode: 400,
      });
    }

    if (code.length > MAX_CODE_LENGTH) {
      return res.status(400).json({
        error: 'ValidationError',
        message: `Code exceeds maximum length of ${MAX_CODE_LENGTH} characters`,
        statusCode: 400,
      });
    }

    // Sanitize: remove null bytes
    const sanitizedCode = code.replace(/\0/g, '');

    // ── Create Submission Record ────────────────────────
    const submission = await Submission.create({
      userId,
      code: sanitizedCode,
      language,
      status: 'queued',
    });

    // ── Enqueue Job ─────────────────────────────────────
    const queue = getQueue();
    await queue.add(
      'execute-code',
      {
        submissionId: submission._id.toString(),
        userId,
        code: sanitizedCode,
        language,
        createdAt: new Date().toISOString(),
      },
      {
        jobId: submission._id.toString(),
      }
    );

    console.log(`📥 Job enqueued: ${submission._id} [${language}]`);

    return res.status(201).json({
      submissionId: submission._id.toString(),
      status: 'queued',
      message: 'Code submitted for execution',
    });
  } catch (error) {
    console.error('Execute error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to submit code for execution',
      statusCode: 500,
    });
  }
});
