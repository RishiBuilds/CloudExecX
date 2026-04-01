// ============================================================
// CloudExecX — Backend API Entry Point
// ============================================================

import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from project root (parent of backend/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { clerkMiddleware } from '@clerk/express';
import { connectDatabase } from './utils/database';
import { executeRouter } from './api/execute';
import { submissionsRouter } from './api/submissions';
import { queueRouter } from './api/queue';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Clerk authentication middleware (populates req.auth)
app.use(clerkMiddleware());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/execute', executeRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/queue', queueRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'InternalServerError',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
    statusCode: 500,
  });
});

async function start() {
  try {
    await connectDatabase();
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 CloudExecX Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
