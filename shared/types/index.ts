// ============================================================
// CloudExecX — Shared Type Definitions
// ============================================================

/** Supported programming languages for code execution */
export type Language = 'python' | 'javascript' | 'cpp';

/** Execution status lifecycle */
export type ExecutionStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'timeout';

/** Job payload sent from API → Queue → Worker */
export interface QueueJob {
  submissionId: string;
  userId: string;
  code: string;
  language: Language;
  createdAt: string;
}

/** Result returned by the Docker execution engine */
export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  timedOut: boolean;
}

/** Full submission record stored in MongoDB */
export interface Submission {
  _id: string;
  userId: string;
  code: string;
  language: Language;
  status: ExecutionStatus;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTimeMs: number | null;
  createdAt: string;
  updatedAt: string;
}

/** API request to execute code */
export interface ExecuteRequest {
  code: string;
  language: Language;
}

/** API response after job enqueue */
export interface ExecuteResponse {
  submissionId: string;
  status: ExecutionStatus;
  message: string;
}

/** Queue status info for monitoring */
export interface QueueStatusInfo {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  workerCount: number;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** API error response */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
