// ============================================================
// CloudExecX — API Client
// ============================================================
// Typed fetch wrappers for all backend endpoints.
// Automatically injects Clerk auth token.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/** Helper: make an authenticated request */
async function fetchAPI<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}


export interface ExecuteRequest {
  code: string;
  language: string;
}

export interface ExecuteResponse {
  submissionId: string;
  status: string;
  message: string;
}

export async function executeCode(
  data: ExecuteRequest,
  token: string
): Promise<ExecuteResponse> {
  return fetchAPI<ExecuteResponse>('/api/execute', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token);
}


export interface Submission {
  _id: string;
  userId: string;
  code: string;
  language: string;
  status: string;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTimeMs: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedSubmissions {
  data: Submission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getSubmissions(
  token: string,
  page = 1,
  limit = 10,
  language?: string
): Promise<PaginatedSubmissions> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (language) params.set('language', language);
  return fetchAPI<PaginatedSubmissions>(`/api/submissions?${params}`, {}, token);
}

export async function getSubmission(
  id: string,
  token: string
): Promise<Submission> {
  return fetchAPI<Submission>(`/api/submissions/${id}`, {}, token);
}

export async function pollSubmissionStatus(
  id: string,
  token: string
): Promise<Submission> {
  return fetchAPI<Submission>(`/api/submissions/${id}/status`, {}, token);
}


export interface QueueStatus {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  workerCount: number;
}

export async function getQueueStatus(token: string): Promise<QueueStatus> {
  return fetchAPI<QueueStatus>('/api/queue/status', {}, token);
}
