import { describe, it, expect } from 'vitest';
import { ChronicleNode, createChronicle } from '../adapter.js';

describe('ChronicleNode Adapter', () => {
  describe('createChronicle', () => {
    it('should create a ChronicleNode instance', () => {
      const chronicle = createChronicle();
      expect(chronicle).toBeInstanceOf(ChronicleNode);
    });

    it('should accept custom configuration', () => {
      const chronicle = createChronicle({
        projectId: 'test-id',
        apiUrl: 'http://custom:8080',
      });

      expect(chronicle).toBeInstanceOf(ChronicleNode);
    });
  });

  describe('ChronicleNode', () => {
    it('should get environment info', () => {
      const chronicle = new ChronicleNode();
      const env = chronicle.getEnvironment();

      expect(env.nodeVersion).toBe(process.version);
      expect(env.platform).toBe(process.platform);
      expect(env.arch).toBe(process.arch);
    });

    it('should create a snapshot payload', async () => {
      const chronicle = new ChronicleNode({ projectId: 'test-project' });
      const payload = await chronicle.createSnapshotPayload('1.0.0', { test: true });

      expect(payload.projectId).toBe('test-project');
      expect(payload.version).toBe('1.0.0');
      expect(payload.timestamp).toBeDefined();
      expect(payload.metadata).toEqual({ test: true });
    });

    it('should return error when capturing without project ID', async () => {
      const chronicle = new ChronicleNode();
      const result = await chronicle.capture('1.0.0');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Project ID not configured');
    });
  });
});
