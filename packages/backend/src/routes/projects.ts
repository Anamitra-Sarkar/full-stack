import { Router, Request, Response } from 'express';
import type { IRouter } from 'express';
import {
  createProject,
  getProjectById,
  listProjects,
  deleteProject,
  getProjectSnapshots,
} from '../db/index.js';
import { CreateProjectSchema } from '../models/index.js';
import { asyncHandler, ApiError } from '../middleware/index.js';

const router: IRouter = Router();

/**
 * GET /api/projects - List all projects
 */
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const projects = listProjects();
    res.json({
      success: true,
      data: projects,
    });
  })
);

/**
 * POST /api/projects - Create a new project
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const input = CreateProjectSchema.parse(req.body);
    const project = createProject(input);
    res.status(201).json({
      success: true,
      data: project,
    });
  })
);

/**
 * GET /api/projects/:id - Get a project by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const project = getProjectById(req.params.id as string);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }
    res.json({
      success: true,
      data: project,
    });
  })
);

/**
 * DELETE /api/projects/:id - Delete a project
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const deleted = deleteProject(req.params.id as string);
    if (!deleted) {
      throw ApiError.notFound('Project not found');
    }
    res.status(204).send();
  })
);

/**
 * GET /api/projects/:id/snapshots - Get all snapshots for a project
 */
router.get(
  '/:id/snapshots',
  asyncHandler(async (req: Request, res: Response) => {
    const project = getProjectById(req.params.id as string);
    if (!project) {
      throw ApiError.notFound('Project not found');
    }
    const snapshots = getProjectSnapshots(req.params.id as string);
    res.json({
      success: true,
      data: snapshots,
    });
  })
);

export default router;
