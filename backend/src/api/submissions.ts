// ============================================================
// CloudExecX — Submissions API Routes
// ============================================================
// GET /api/submissions       — list user's submissions (paginated)
// GET /api/submissions/:id   — single submission detail
// GET /api/submissions/:id/status — poll execution status

import { Router, Request, Response } from 'express';
import { requireAuthentication, getUserId } from '../middleware/auth';
import { Submission } from '../models/Submission';

export const submissionsRouter = Router();

// All submission routes require authentication
submissionsRouter.use(requireAuthentication);

/**
 * GET /api/submissions
 * List authenticated user's submissions with pagination.
 */
submissionsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const language = req.query.language as string;

    // Build filter
    const filter: Record<string, any> = { userId };
    if (language && ['python', 'javascript', 'cpp'].includes(language)) {
      filter.language = language;
    }

    const [submissions, total] = await Promise.all([
      Submission.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Submission.countDocuments(filter),
    ]);

    return res.json({
      data: submissions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('List submissions error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to fetch submissions',
      statusCode: 500,
    });
  }
});

/**
 * GET /api/submissions/:id
 * Get a single submission's full details.
 */
submissionsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const submission = await Submission.findOne({
      _id: req.params.id,
      userId, // Ensure user can only access their own submissions
    }).lean();

    if (!submission) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Submission not found',
        statusCode: 404,
      });
    }

    return res.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to fetch submission',
      statusCode: 500,
    });
  }
});

/**
 * GET /api/submissions/:id/status
 * Poll the execution status of a submission.
 * Used by frontend for polling-based real-time updates.
 */
submissionsRouter.get('/:id/status', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const submission = await Submission.findOne(
      { _id: req.params.id, userId },
      { status: 1, stdout: 1, stderr: 1, exitCode: 1, executionTimeMs: 1 }
    ).lean();

    if (!submission) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Submission not found',
        statusCode: 404,
      });
    }

    return res.json(submission);
  } catch (error) {
    console.error('Poll status error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to fetch submission status',
      statusCode: 500,
    });
  }
});
