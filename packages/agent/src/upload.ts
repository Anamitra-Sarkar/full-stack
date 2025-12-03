import type { CaptureResult } from './capture.js';
import type { ChronicleConfig } from './config.js';

export interface UploadResult {
  success: boolean;
  snapshotId?: string;
  error?: string;
}

/**
 * Upload a captured snapshot to the Chronicle API
 */
export async function uploadSnapshot(
  config: ChronicleConfig,
  capture: CaptureResult
): Promise<UploadResult> {
  if (!config.projectId) {
    return {
      success: false,
      error: 'Project ID not configured. Run "chronicle init" or set projectId in config.',
    };
  }

  try {
    const response = await fetch(`${config.apiUrl}/api/snapshots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: config.projectId,
        version: capture.version,
        timestamp: capture.timestamp,
        metadata: capture.metadata,
        artifacts: capture.artifacts,
        environment: capture.environment,
      }),
    });

    const data = (await response.json()) as {
      success: boolean;
      data?: { id: string };
      error?: { message: string };
    };

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error?.message || 'Failed to upload snapshot',
      };
    }

    return {
      success: true,
      snapshotId: data.data?.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Check API health
 */
export async function checkApiHealth(config: ChronicleConfig): Promise<boolean> {
  try {
    const response = await fetch(`${config.apiUrl}/api/health`);
    const data = (await response.json()) as { success: boolean };
    return response.ok && data.success;
  } catch {
    return false;
  }
}
