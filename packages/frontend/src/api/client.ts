const API_BASE = '/api';

export interface Project {
  id: string;
  name: string;
  description?: string;
  repository?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Snapshot {
  id: string;
  projectId: string;
  version: string;
  timestamp?: string;
  metadata?: {
    gitCommit?: string;
    gitBranch?: string;
    author?: string;
    message?: string;
    tags?: string[];
  };
  artifacts?: Array<{
    name: string;
    type: string;
    hash: string;
    size: number;
    path?: string;
  }>;
  environment?: {
    nodeVersion?: string;
    platform?: string;
    arch?: string;
    dependencies?: Record<string, string>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error?.message || 'An error occurred');
  }

  return data.data as T;
}

// Projects API
export async function fetchProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE}/projects`);
  return handleResponse<Project[]>(response);
}

export async function fetchProject(id: string): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects/${id}`);
  return handleResponse<Project>(response);
}

export async function createProject(
  data: Pick<Project, 'name' | 'description' | 'repository'>
): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Project>(response);
}

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error?.message || 'Failed to delete project');
  }
}

// Snapshots API
export async function fetchSnapshots(
  projectId?: string,
  limit = 50,
  offset = 0
): Promise<PaginatedResponse<Snapshot>> {
  const params = new URLSearchParams();
  if (projectId) params.set('projectId', projectId);
  params.set('limit', limit.toString());
  params.set('offset', offset.toString());

  const response = await fetch(`${API_BASE}/snapshots?${params}`);
  return handleResponse<PaginatedResponse<Snapshot>>(response);
}

export async function fetchSnapshot(id: string): Promise<Snapshot> {
  const response = await fetch(`${API_BASE}/snapshots/${id}`);
  return handleResponse<Snapshot>(response);
}

export async function fetchProjectSnapshots(projectId: string): Promise<Snapshot[]> {
  const response = await fetch(`${API_BASE}/projects/${projectId}/snapshots`);
  return handleResponse<Snapshot[]>(response);
}

// Health API
export async function fetchHealth(): Promise<{
  status: string;
  timestamp: string;
  version: string;
}> {
  const response = await fetch(`${API_BASE}/health`);
  return handleResponse<{ status: string; timestamp: string; version: string }>(response);
}
