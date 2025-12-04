import { z } from 'zod';

/**
 * Schema for creating a new snapshot
 */
export const CreateSnapshotSchema = z.object({
  projectId: z.string().uuid(),
  version: z.string().min(1),
  timestamp: z.string().datetime().optional(),
  metadata: z
    .object({
      gitCommit: z.string().optional(),
      gitBranch: z.string().optional(),
      author: z.string().optional(),
      message: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    .optional(),
  artifacts: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        hash: z.string(),
        size: z.number(),
        path: z.string().optional(),
      })
    )
    .optional(),
  environment: z
    .object({
      nodeVersion: z.string().optional(),
      platform: z.string().optional(),
      arch: z.string().optional(),
      dependencies: z.record(z.string()).optional(),
    })
    .optional(),
});

export type CreateSnapshotInput = z.infer<typeof CreateSnapshotSchema>;

/**
 * Schema for a snapshot (includes DB-generated fields)
 */
export const SnapshotSchema = CreateSnapshotSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Snapshot = z.infer<typeof SnapshotSchema>;

/**
 * Schema for creating a new project
 */
export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  repository: z.string().url().optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

/**
 * Schema for a project (includes DB-generated fields)
 */
export const ProjectSchema = CreateProjectSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Project = z.infer<typeof ProjectSchema>;

/**
 * Schema for query parameters when listing snapshots
 */
export const ListSnapshotsQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  orderBy: z.enum(['createdAt', 'version']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type ListSnapshotsQuery = z.infer<typeof ListSnapshotsQuerySchema>;

/**
 * API Response wrappers
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
  });
