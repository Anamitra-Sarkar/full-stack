import { describe, it, expect } from 'vitest';
import {
  CreateProjectSchema,
  CreateSnapshotSchema,
  ListSnapshotsQuerySchema,
} from '../models/schemas.js';

describe('Schema Validation', () => {
  describe('CreateProjectSchema', () => {
    it('should validate a valid project', () => {
      const result = CreateProjectSchema.safeParse({
        name: 'Test Project',
        description: 'A test project',
        repository: 'https://github.com/test/repo',
      });

      expect(result.success).toBe(true);
    });

    it('should require name', () => {
      const result = CreateProjectSchema.safeParse({
        description: 'No name',
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid repository URL', () => {
      const result = CreateProjectSchema.safeParse({
        name: 'Test',
        repository: 'not-a-url',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('CreateSnapshotSchema', () => {
    it('should validate a valid snapshot', () => {
      const result = CreateSnapshotSchema.safeParse({
        projectId: '550e8400-e29b-41d4-a716-446655440000',
        version: '1.0.0',
        metadata: {
          gitCommit: 'abc123',
          author: 'Test User',
        },
      });

      expect(result.success).toBe(true);
    });

    it('should require projectId to be a UUID', () => {
      const result = CreateSnapshotSchema.safeParse({
        projectId: 'not-a-uuid',
        version: '1.0.0',
      });

      expect(result.success).toBe(false);
    });

    it('should require version', () => {
      const result = CreateSnapshotSchema.safeParse({
        projectId: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('ListSnapshotsQuerySchema', () => {
    it('should provide defaults', () => {
      const result = ListSnapshotsQuerySchema.parse({});

      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
      expect(result.orderBy).toBe('createdAt');
      expect(result.order).toBe('desc');
    });

    it('should validate limit bounds', () => {
      const result = ListSnapshotsQuerySchema.safeParse({
        limit: 200,
      });

      expect(result.success).toBe(false);
    });
  });
});
