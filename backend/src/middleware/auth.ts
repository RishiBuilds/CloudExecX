// ============================================================
// CloudExecX — Clerk Authentication Middleware
// ============================================================
// Protects routes by verifying the Clerk JWT.
// Uses @clerk/express to extract userId from the session.

import { Request, Response, NextFunction } from 'express';
import { requireAuth, getAuth } from '@clerk/express';

/**
 * Middleware that requires a valid Clerk session.
 * Attaches userId to req.auth for downstream handlers.
 * Returns 401 if no valid session is found.
 */
export const requireAuthentication = requireAuth();

/**
 * Extract the authenticated user's ID from the request.
 * Must be used AFTER requireAuthentication middleware.
 */
export function getUserId(req: Request): string {
  const auth = getAuth(req);
  if (!auth?.userId) {
    throw new Error('User not authenticated');
  }
  return auth.userId;
}
