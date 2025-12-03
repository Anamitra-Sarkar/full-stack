# Chronicle

> Time-first Versioning & Reproducible Software Documentary Platform

[![CI](https://github.com/Anamitra-Sarkar/full-stack/actions/workflows/ci.yml/badge.svg)](https://github.com/Anamitra-Sarkar/full-stack/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

Chronicle is an enterprise-grade platform for capturing, visualizing, and reproducing software versions over time. It provides a complete documentary of your software's evolution, enabling teams to understand what changed, when, and why.

## Features

- 📸 **Snapshot Capture** - Capture point-in-time snapshots of your project
- 🕐 **Time-Travel** - Navigate through your project's history with a visual timeline
- 🔄 **Reproducibility** - Recreate any version of your software with full environment context
- 📊 **Dashboard** - Monitor and manage all your projects from a central interface
- 🔌 **SDK Integration** - Seamlessly integrate with your Node.js projects
- 🤖 **CLI Agent** - Powerful command-line tool for local operations

## Architecture

Chronicle is structured as a monorepo with the following packages:

```
packages/
├── backend/        # Express API server with SQLite
├── frontend/       # React dashboard application
├── agent/          # CLI tool for local capture and upload
└── adapter-node/   # Node.js SDK for programmatic integration
```

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/Anamitra-Sarkar/full-stack.git
cd full-stack

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start the development servers
pnpm dev
```

### Using the CLI Agent

```bash
# Install the agent globally
cd packages/agent
pnpm build
npm link

# Initialize Chronicle in your project
cd /your/project
chronicle init --project-id <your-project-id>

# Capture a snapshot
chronicle capture --version 1.0.0 --tags release,stable

# Check status
chronicle status
```

### Using the Node.js Adapter

```typescript
import { createChronicle } from '@chronicle/adapter-node';

const chronicle = createChronicle({
  projectId: 'your-project-id',
  apiUrl: 'http://localhost:3001',
});

// Capture a snapshot
const result = await chronicle.capture('1.0.0', {
  author: 'developer',
  message: 'Initial release',
});
```

## API Endpoints

### Health

```
GET /api/health
```

### Projects

```
GET    /api/projects          # List all projects
POST   /api/projects          # Create a project
GET    /api/projects/:id      # Get a project
DELETE /api/projects/:id      # Delete a project
GET    /api/projects/:id/snapshots  # Get project snapshots
```

### Snapshots

```
GET    /api/snapshots         # List snapshots (with pagination)
POST   /api/snapshots         # Create a snapshot
GET    /api/snapshots/:id     # Get a snapshot
DELETE /api/snapshots/:id     # Delete a snapshot
```

## Development

### Project Structure

```
chronicle/
├── packages/
│   ├── backend/           # API server
│   │   ├── src/
│   │   │   ├── routes/    # API route handlers
│   │   │   ├── models/    # Zod schemas and types
│   │   │   ├── db/        # Database operations
│   │   │   └── middleware/# Express middleware
│   │   └── package.json
│   ├── frontend/          # React dashboard
│   │   ├── src/
│   │   │   ├── components/# React components
│   │   │   ├── pages/     # Page components
│   │   │   ├── hooks/     # Custom hooks
│   │   │   └── api/       # API client
│   │   └── package.json
│   ├── agent/             # CLI tool
│   │   ├── src/
│   │   │   ├── cli.ts     # CLI entry point
│   │   │   ├── config.ts  # Configuration management
│   │   │   ├── capture.ts # Snapshot capture logic
│   │   │   └── upload.ts  # API upload functions
│   │   └── package.json
│   └── adapter-node/      # Node.js SDK
│       ├── src/
│       │   └── adapter.ts # Main adapter class
│       └── package.json
├── .github/workflows/     # CI/CD pipelines
├── package.json           # Root package.json
├── pnpm-workspace.yaml    # pnpm workspace config
└── tsconfig.base.json     # Shared TypeScript config
```

### Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Lint all packages
pnpm lint

# Start development servers
pnpm dev

# Clean build artifacts
pnpm clean
```

### Running Individual Packages

```bash
# Backend
cd packages/backend
pnpm dev

# Frontend
cd packages/frontend
pnpm dev

# Agent CLI
cd packages/agent
pnpm dev
```

## Configuration

### Chronicle Config File

Create a `chronicle.config.json` in your project root:

```json
{
  "projectId": "your-project-uuid",
  "apiUrl": "http://localhost:3001",
  "autoCapture": false,
  "captureGitInfo": true,
  "include": ["**/*"],
  "exclude": [
    "node_modules/**",
    ".git/**",
    "dist/**"
  ]
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend API port | `3001` |
| `CHRONICLE_DB_PATH` | SQLite database path | `:memory:` |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/tooling changes

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] PostgreSQL support for production
- [ ] User authentication and authorization
- [ ] Webhook integrations
- [ ] Artifact storage (S3, GCS)
- [ ] Diff visualization between snapshots
- [ ] Team collaboration features
- [ ] API rate limiting
- [ ] Metrics and observability
