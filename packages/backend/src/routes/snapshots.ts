import { Router, Request, Response } from 'express';
import type { IRouter } from 'express';
import {
  createSnapshot,
  getSnapshotById,
  listSnapshots,
  deleteSnapshot,
  getProjectById,
} from '../db/index.js';
import { CreateSnapshotSchema, ListSnapshotsQuerySchema } from '../models/index.js';
import { asyncHandler, ApiError } from '../middleware/index.js';

const router: IRouter = Router();

/**
 * GET /api/snapshots - List snapshots with pagination
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const query = ListSnapshotsQuerySchema.parse(req.query);
    const result = listSnapshots(query);
    res.json({
      success: true,
      data: result,
    });
  })
);

/**
 * POST /api/snapshots - Create a new snapshot
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const input = CreateSnapshotSchema.parse(req.body);

    // Verify project exists
    const project = getProjectById(input.projectId);
    if (!project) {
      throw ApiError.badRequest('Project not found');
    }

    const snapshot = createSnapshot(input);
    res.status(201).json({
      success: true,
      data: snapshot,
    });
  })
);

/**
 * GET /api/snapshots/:id - Get a snapshot by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const snapshot = getSnapshotById(req.params.id as string);
    if (!snapshot) {
      throw ApiError.notFound('Snapshot not found');
    }
    res.json({
      success: true,
      data: snapshot,
    });
  })
);

/**
 * DELETE /api/snapshots/:id - Delete a snapshot
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const deleted = deleteSnapshot(req.params.id as string);
    if (!deleted) {
      throw ApiError.notFound('Snapshot not found');
    }
    res.status(204).send();
  })
);

export default router;
