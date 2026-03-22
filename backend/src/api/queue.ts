// ============================================================
// CloudExecX — Queue Status API Route
// ============================================================
// GET /api/queue/status — returns queue health and job counts

import { Router, Request, Response } from 'express';
import { requireAuthentication } from '../middleware/auth';
import { getQueue } from '../utils/queue';

export const queueRouter = Router();

/**
 * GET /api/queue/status
 * Returns the current state of the execution queue.
 * Useful for the dashboard monitoring panel.
 */
queueRouter.get('/status', requireAuthentication, async (_req: Request, res: Response) => {
  try {
    const queue = getQueue();

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return res.json({
      waiting,
      active,
      completed,
      failed,
      delayed,
      workerCount: parseInt(process.env.WORKER_CONCURRENCY || '2'),
    });
  } catch (error) {
    console.error('Queue status error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to fetch queue status',
      statusCode: 500,
    });
  }
});
