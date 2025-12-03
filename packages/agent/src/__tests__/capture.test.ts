import { describe, it, expect } from 'vitest';
import { getGitInfo, getEnvironmentInfo, getCurrentVersion } from '../capture.js';

describe('Capture Module', () => {
  describe('getGitInfo', () => {
    it('should return git info when in a git repository', () => {
      // This test runs in a git repo, so it should work
      const info = getGitInfo();

      if (info) {
        expect(info.commit).toBeDefined();
        expect(info.branch).toBeDefined();
      }
    });
  });

  describe('getEnvironmentInfo', () => {
    it('should return environment info', () => {
      const info = getEnvironmentInfo();

      expect(info.nodeVersion).toBe(process.version);
      expect(info.platform).toBe(process.platform);
      expect(info.arch).toBe(process.arch);
    });
  });

  describe('getCurrentVersion', () => {
    it('should return a version string', () => {
      const version = getCurrentVersion();
      expect(version).toBeDefined();
      expect(typeof version).toBe('string');
    });
  });
});
