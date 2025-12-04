import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  initDatabase,
  closeDatabase,
  createProject,
  getProjectById,
  listProjects,
  deleteProject,
  createSnapshot,
  getSnapshotById,
  listSnapshots,
  deleteSnapshot,
} from '../db/database.js';

describe('Database Operations', () => {
  beforeEach(() => {
    // Use in-memory database for tests
    process.env.CHRONICLE_DB_PATH = ':memory:';
    initDatabase();
  });

  afterEach(() => {
    closeDatabase();
  });

  describe('Projects', () => {
    it('should create a project', () => {
      const project = createProject({
        name: 'Test Project',
        description: 'A test project',
      });

      expect(project.id).toBeDefined();
      expect(project.name).toBe('Test Project');
      expect(project.description).toBe('A test project');
      expect(project.createdAt).toBeDefined();
    });

    it('should get a project by ID', () => {
      const created = createProject({ name: 'Test' });
      const retrieved = getProjectById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Test');
    });

    it('should return null for non-existent project', () => {
      const result = getProjectById('non-existent-id');
      expect(result).toBeNull();
    });

    it('should list all projects', () => {
      createProject({ name: 'Project 1' });
      createProject({ name: 'Project 2' });

      const projects = listProjects();
      expect(projects).toHaveLength(2);
    });

    it('should delete a project', () => {
      const project = createProject({ name: 'To Delete' });
      const deleted = deleteProject(project.id);

      expect(deleted).toBe(true);
      expect(getProjectById(project.id)).toBeNull();
    });

    it('should return false when deleting non-existent project', () => {
      const deleted = deleteProject('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('Snapshots', () => {
    it('should create a snapshot', () => {
      const project = createProject({ name: 'Test Project' });
      const snapshot = createSnapshot({
        projectId: project.id,
        version: '1.0.0',
        metadata: { author: 'Test User' },
      });

      expect(snapshot.id).toBeDefined();
      expect(snapshot.projectId).toBe(project.id);
      expect(snapshot.version).toBe('1.0.0');
      expect(snapshot.metadata?.author).toBe('Test User');
    });

    it('should get a snapshot by ID', () => {
      const project = createProject({ name: 'Test' });
      const created = createSnapshot({
        projectId: project.id,
        version: '1.0.0',
      });
      const retrieved = getSnapshotById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should list snapshots with pagination', () => {
      const project = createProject({ name: 'Test' });

      for (let i = 0; i < 5; i++) {
        createSnapshot({
          projectId: project.id,
          version: `1.0.${i}`,
        });
      }

      const result = listSnapshots({ limit: 3, offset: 0, orderBy: 'createdAt', order: 'desc' });
      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(5);
      expect(result.hasMore).toBe(true);
    });

    it('should filter snapshots by project ID', () => {
      const project1 = createProject({ name: 'Project 1' });
      const project2 = createProject({ name: 'Project 2' });

      createSnapshot({ projectId: project1.id, version: '1.0.0' });
      createSnapshot({ projectId: project1.id, version: '1.0.1' });
      createSnapshot({ projectId: project2.id, version: '2.0.0' });

      const result = listSnapshots({
        projectId: project1.id,
        limit: 50,
        offset: 0,
        orderBy: 'createdAt',
        order: 'desc',
      });
      expect(result.items).toHaveLength(2);
    });

    it('should delete a snapshot', () => {
      const project = createProject({ name: 'Test' });
      const snapshot = createSnapshot({
        projectId: project.id,
        version: '1.0.0',
      });

      const deleted = deleteSnapshot(snapshot.id);
      expect(deleted).toBe(true);
      expect(getSnapshotById(snapshot.id)).toBeNull();
    });
  });
});
