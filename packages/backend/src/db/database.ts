import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import type {
  Project,
  CreateProjectInput,
  Snapshot,
  CreateSnapshotInput,
  ListSnapshotsQuery,
} from '../models/index.js';

const DB_PATH = process.env.CHRONICLE_DB_PATH || ':memory:';

let db: Database.Database | null = null;

/**
 * Initialize the database connection and create tables
 */
export function initDatabase(): Database.Database {
  if (db) return db;

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      repository TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Create snapshots table
  db.exec(`
    CREATE TABLE IF NOT EXISTS snapshots (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      version TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      metadata TEXT,
      artifacts TEXT,
      environment TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_snapshots_project_id ON snapshots(project_id);
    CREATE INDEX IF NOT EXISTS idx_snapshots_created_at ON snapshots(created_at);
    CREATE INDEX IF NOT EXISTS idx_snapshots_version ON snapshots(version);
  `);

  return db;
}

/**
 * Get the database instance
 */
export function getDatabase(): Database.Database {
  if (!db) {
    return initDatabase();
  }
  return db;
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// ============ Project Operations ============

/**
 * Create a new project
 */
export function createProject(input: CreateProjectInput): Project {
  const database = getDatabase();
  const now = new Date().toISOString();
  const id = uuidv4();

  const stmt = database.prepare(`
    INSERT INTO projects (id, name, description, repository, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, input.name, input.description ?? null, input.repository ?? null, now, now);

  return {
    id,
    name: input.name,
    description: input.description,
    repository: input.repository,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get a project by ID
 */
export function getProjectById(id: string): Project | null {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM projects WHERE id = ?');
  const row = stmt.get(id) as
    | {
        id: string;
        name: string;
        description: string | null;
        repository: string | null;
        created_at: string;
        updated_at: string;
      }
    | undefined;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    repository: row.repository ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * List all projects
 */
export function listProjects(): Project[] {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM projects ORDER BY created_at DESC');
  const rows = stmt.all() as Array<{
    id: string;
    name: string;
    description: string | null;
    repository: string | null;
    created_at: string;
    updated_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    repository: row.repository ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Delete a project by ID
 */
export function deleteProject(id: string): boolean {
  const database = getDatabase();
  const stmt = database.prepare('DELETE FROM projects WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// ============ Snapshot Operations ============

/**
 * Create a new snapshot
 */
export function createSnapshot(input: CreateSnapshotInput): Snapshot {
  const database = getDatabase();
  const now = new Date().toISOString();
  const id = uuidv4();
  const timestamp = input.timestamp ?? now;

  const stmt = database.prepare(`
    INSERT INTO snapshots (id, project_id, version, timestamp, metadata, artifacts, environment, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    input.projectId,
    input.version,
    timestamp,
    input.metadata ? JSON.stringify(input.metadata) : null,
    input.artifacts ? JSON.stringify(input.artifacts) : null,
    input.environment ? JSON.stringify(input.environment) : null,
    now,
    now
  );

  return {
    id,
    projectId: input.projectId,
    version: input.version,
    timestamp,
    metadata: input.metadata,
    artifacts: input.artifacts,
    environment: input.environment,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get a snapshot by ID
 */
export function getSnapshotById(id: string): Snapshot | null {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM snapshots WHERE id = ?');
  const row = stmt.get(id) as
    | {
        id: string;
        project_id: string;
        version: string;
        timestamp: string;
        metadata: string | null;
        artifacts: string | null;
        environment: string | null;
        created_at: string;
        updated_at: string;
      }
    | undefined;

  if (!row) return null;

  return {
    id: row.id,
    projectId: row.project_id,
    version: row.version,
    timestamp: row.timestamp,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    artifacts: row.artifacts ? JSON.parse(row.artifacts) : undefined,
    environment: row.environment ? JSON.parse(row.environment) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface ListSnapshotsResult {
  items: Snapshot[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * List snapshots with pagination and filtering
 */
export function listSnapshots(query: ListSnapshotsQuery): ListSnapshotsResult {
  const database = getDatabase();

  let whereClause = '';
  const params: unknown[] = [];

  if (query.projectId) {
    whereClause = 'WHERE project_id = ?';
    params.push(query.projectId);
  }

  // Get total count
  const countStmt = database.prepare(`SELECT COUNT(*) as count FROM snapshots ${whereClause}`);
  const countResult = countStmt.get(...params) as { count: number };
  const total = countResult.count;

  // Get paginated results
  const orderColumn = query.orderBy === 'version' ? 'version' : 'created_at';
  const orderDir = query.order === 'asc' ? 'ASC' : 'DESC';

  const stmt = database.prepare(`
    SELECT * FROM snapshots 
    ${whereClause}
    ORDER BY ${orderColumn} ${orderDir}
    LIMIT ? OFFSET ?
  `);

  const rows = stmt.all(...params, query.limit, query.offset) as Array<{
    id: string;
    project_id: string;
    version: string;
    timestamp: string;
    metadata: string | null;
    artifacts: string | null;
    environment: string | null;
    created_at: string;
    updated_at: string;
  }>;

  const items = rows.map((row) => ({
    id: row.id,
    projectId: row.project_id,
    version: row.version,
    timestamp: row.timestamp,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    artifacts: row.artifacts ? JSON.parse(row.artifacts) : undefined,
    environment: row.environment ? JSON.parse(row.environment) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return {
    items,
    total,
    limit: query.limit,
    offset: query.offset,
    hasMore: query.offset + items.length < total,
  };
}

/**
 * Delete a snapshot by ID
 */
export function deleteSnapshot(id: string): boolean {
  const database = getDatabase();
  const stmt = database.prepare('DELETE FROM snapshots WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

/**
 * Get snapshots for a specific project
 */
export function getProjectSnapshots(projectId: string): Snapshot[] {
  return listSnapshots({
    projectId,
    limit: 100,
    offset: 0,
    orderBy: 'createdAt',
    order: 'desc',
  }).items;
}
