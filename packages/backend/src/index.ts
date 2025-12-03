import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { projectsRouter, snapshotsRouter, healthRouter } from './routes/index.js';
import { errorHandler, requestLogger } from './middleware/index.js';
import { initDatabase } from './db/index.js';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Initialize database
initDatabase();

// API routes
app.use('/api/health', healthRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/snapshots', snapshotsRouter);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.warn(`Chronicle API server running on port ${PORT}`);
  console.warn(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;
