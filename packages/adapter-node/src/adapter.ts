import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

export interface ChronicleNodeConfig {
  projectId?: string;
  apiUrl: string;
  autoCapture: boolean;
  captureOnBuild: boolean;
  captureOnTest: boolean;
  include: string[];
  exclude: string[];
}

const DEFAULT_CONFIG: ChronicleNodeConfig = {
  apiUrl: 'http://localhost:3001',
  autoCapture: false,
  captureOnBuild: true,
  captureOnTest: false,
  include: ['src/**/*', 'package.json', 'tsconfig.json'],
  exclude: ['node_modules/**', '**/*.test.*', '**/*.spec.*'],
};

/**
 * Chronicle adapter for Node.js projects
 */
export class ChronicleNode {
  private config: ChronicleNodeConfig;
  private cwd: string;

  constructor(config: Partial<ChronicleNodeConfig> = {}, cwd: string = process.cwd()) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cwd = cwd;
  }

  /**
   * Get the current project version from package.json
   */
  getVersion(): string | null {
    const packageJsonPath = path.join(this.cwd, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as { version?: string };
        return pkg.version || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Get project dependencies
   */
  getDependencies(): Record<string, string> {
    const packageJsonPath = path.join(this.cwd, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as {
          dependencies?: Record<string, string>;
        };
        return pkg.dependencies || {};
      } catch {
        return {};
      }
    }
    return {};
  }

  /**
   * Calculate hash of a file
   */
  hashFile(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get environment information
   */
  getEnvironment(): {
    nodeVersion: string;
    platform: string;
    arch: string;
    dependencies: Record<string, string>;
  } {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      dependencies: this.getDependencies(),
    };
  }

  /**
   * Create a snapshot payload for the API
   */
  async createSnapshotPayload(
    version?: string,
    metadata?: Record<string, unknown>
  ): Promise<{
    projectId: string | undefined;
    version: string;
    timestamp: string;
    environment: {
      nodeVersion: string;
      platform: string;
      arch: string;
      dependencies: Record<string, string>;
    };
    metadata?: Record<string, unknown>;
  }> {
    return {
      projectId: this.config.projectId,
      version: version || this.getVersion() || '0.0.0',
      timestamp: new Date().toISOString(),
      environment: this.getEnvironment(),
      metadata,
    };
  }

  /**
   * Upload a snapshot to the Chronicle API
   */
  async capture(
    version?: string,
    metadata?: Record<string, unknown>
  ): Promise<{ success: boolean; snapshotId?: string; error?: string }> {
    if (!this.config.projectId) {
      return { success: false, error: 'Project ID not configured' };
    }

    try {
      const payload = await this.createSnapshotPayload(version, metadata);

      const response = await fetch(`${this.config.apiUrl}/api/snapshots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        success: boolean;
        data?: { id: string };
        error?: { message: string };
      };

      if (!response.ok || !data.success) {
        return { success: false, error: data.error?.message || 'Upload failed' };
      }

      return { success: true, snapshotId: data.data?.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}

/**
 * Create a Chronicle adapter instance
 */
export function createChronicle(
  config: Partial<ChronicleNodeConfig> = {},
  cwd?: string
): ChronicleNode {
  return new ChronicleNode(config, cwd);
}
