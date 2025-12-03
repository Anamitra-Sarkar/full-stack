import { Router, Request, Response } from 'express';
import type { IRouter } from 'express';

const router: IRouter = Router();

/**
 * GET /api/health - Health check endpoint
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
    },
  });
});

export default router;
