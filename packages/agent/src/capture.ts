import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { glob } from 'glob';
import type { ChronicleConfig } from './config.js';

export interface Artifact {
  name: string;
  type: string;
  hash: string;
  size: number;
  path: string;
}

export interface GitInfo {
  commit?: string;
  branch?: string;
  author?: string;
  message?: string;
}

export interface EnvironmentInfo {
  nodeVersion: string;
  platform: string;
  arch: string;
  dependencies?: Record<string, string>;
}

export interface CaptureResult {
  version: string;
  timestamp: string;
  artifacts: Artifact[];
  metadata: {
    gitCommit?: string;
    gitBranch?: string;
    author?: string;
    message?: string;
    tags?: string[];
  };
  environment: EnvironmentInfo;
}

/**
 * Get the file type based on extension
 */
function getFileType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const typeMap: Record<string, string> = {
    '.js': 'javascript',
    '.ts': 'typescript',
    '.jsx': 'javascript',
    '.tsx': 'typescript',
    '.json': 'json',
    '.md': 'markdown',
    '.css': 'css',
    '.html': 'html',
    '.yml': 'yaml',
    '.yaml': 'yaml',
    '.sh': 'shell',
    '.py': 'python',
    '.go': 'go',
    '.rs': 'rust',
  };
  return typeMap[ext] || 'unknown';
}

/**
 * Calculate SHA-256 hash of file content
 */
function hashFile(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Get Git information for the current directory
 */
export function getGitInfo(cwd: string = process.cwd()): GitInfo | null {
  try {
    const commit = execSync('git rev-parse HEAD', { cwd, encoding: 'utf-8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd, encoding: 'utf-8' }).trim();
    const author = execSync('git log -1 --format="%an"', { cwd, encoding: 'utf-8' }).trim();
    const message = execSync('git log -1 --format="%s"', { cwd, encoding: 'utf-8' }).trim();

    return { commit, branch, author, message };
  } catch {
    return null;
  }
}

/**
 * Get environment information
 */
export function getEnvironmentInfo(cwd: string = process.cwd()): EnvironmentInfo {
  const info: EnvironmentInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };

  // Try to read package.json for dependencies
  const packageJsonPath = path.join(cwd, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as {
        dependencies?: Record<string, string>;
      };
      if (pkg.dependencies) {
        info.dependencies = pkg.dependencies;
      }
    } catch {
      // Ignore errors
    }
  }

  return info;
}

/**
 * Get the current version from package.json or git
 */
export function getCurrentVersion(cwd: string = process.cwd()): string {
  // Try package.json first
  const packageJsonPath = path.join(cwd, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as { version?: string };
      if (pkg.version) {
        return pkg.version;
      }
    } catch {
      // Fall through
    }
  }

  // Try git tag
  try {
    const tag = execSync('git describe --tags --abbrev=0 2>/dev/null', {
      cwd,
      encoding: 'utf-8',
    }).trim();
    if (tag) {
      return tag;
    }
  } catch {
    // Fall through
  }

  // Default to timestamp-based version
  return `0.0.0-${Date.now()}`;
}

/**
 * Capture a snapshot of the project
 */
export async function captureSnapshot(
  config: ChronicleConfig,
  options: { version?: string; tags?: string[] } = {},
  cwd: string = process.cwd()
): Promise<CaptureResult> {
  const timestamp = new Date().toISOString();
  const version = options.version || getCurrentVersion(cwd);

  // Find files to include
  const files = await glob(config.include, {
    cwd,
    ignore: config.exclude,
    nodir: true,
  });

  // Process artifacts
  const artifacts: Artifact[] = files.map((file) => {
    const fullPath = path.join(cwd, file);
    const stats = fs.statSync(fullPath);

    return {
      name: path.basename(file),
      type: getFileType(file),
      hash: hashFile(fullPath),
      size: stats.size,
      path: file,
    };
  });

  // Get metadata
  const gitInfo = config.captureGitInfo ? getGitInfo(cwd) : null;
  const environment = getEnvironmentInfo(cwd);

  return {
    version,
    timestamp,
    artifacts,
    metadata: {
      gitCommit: gitInfo?.commit,
      gitBranch: gitInfo?.branch,
      author: gitInfo?.author,
      message: gitInfo?.message,
      tags: options.tags,
    },
    environment,
  };
}
