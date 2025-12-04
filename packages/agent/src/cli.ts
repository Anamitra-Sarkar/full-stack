#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig, initConfig, saveConfig, getConfigPath } from './config.js';
import { captureSnapshot, getCurrentVersion } from './capture.js';
import { uploadSnapshot, checkApiHealth } from './upload.js';

const program = new Command();

program
  .name('chronicle')
  .description('Chronicle - Time-first Versioning & Reproducible Software Documentary Platform')
  .version('0.1.0');

// Init command
program
  .command('init')
  .description('Initialize Chronicle in the current directory')
  .option('-p, --project-id <id>', 'Project ID from Chronicle dashboard')
  .option('-u, --api-url <url>', 'Chronicle API URL')
  .action(async (options: { projectId?: string; apiUrl?: string }) => {
    const spinner = ora('Initializing Chronicle...').start();

    try {
      const config = initConfig();

      if (options.projectId) {
        config.projectId = options.projectId;
      }
      if (options.apiUrl) {
        config.apiUrl = options.apiUrl;
      }

      saveConfig(config);
      spinner.succeed('Chronicle initialized successfully!');
      console.warn(chalk.dim(`Configuration saved to ${getConfigPath()}`));

      if (!config.projectId) {
        console.warn(
          chalk.yellow('\n⚠ No project ID configured. Set it with:'),
          chalk.cyan('\n  chronicle config --project-id <your-project-id>')
        );
      }
    } catch (error) {
      spinner.fail('Failed to initialize Chronicle');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

// Capture command
program
  .command('capture')
  .description('Capture a snapshot of the current state')
  .option('-v, --version <version>', 'Version to tag this snapshot')
  .option('-t, --tags <tags>', 'Comma-separated tags')
  .option('--dry-run', 'Show what would be captured without uploading')
  .action(async (options: { version?: string; tags?: string; dryRun?: boolean }) => {
    const config = loadConfig();
    const spinner = ora('Capturing snapshot...').start();

    try {
      const tags = options.tags?.split(',').map((t) => t.trim());
      const capture = await captureSnapshot(config, {
        version: options.version,
        tags,
      });

      spinner.succeed(`Captured ${capture.artifacts.length} artifacts`);

      console.warn(chalk.dim(`\nVersion: ${capture.version}`));
      console.warn(chalk.dim(`Timestamp: ${capture.timestamp}`));

      if (capture.metadata.gitCommit) {
        console.warn(chalk.dim(`Git: ${capture.metadata.gitCommit.substring(0, 7)}`));
      }

      if (options.dryRun) {
        console.warn(chalk.yellow('\n[Dry run] Snapshot not uploaded'));
        console.warn('\nArtifacts:');
        capture.artifacts.slice(0, 10).forEach((a) => {
          console.warn(chalk.dim(`  ${a.path} (${a.type}, ${a.size} bytes)`));
        });
        if (capture.artifacts.length > 10) {
          console.warn(chalk.dim(`  ... and ${capture.artifacts.length - 10} more`));
        }
        return;
      }

      // Upload to API
      spinner.start('Uploading snapshot...');
      const result = await uploadSnapshot(config, capture);

      if (result.success) {
        spinner.succeed('Snapshot uploaded successfully!');
        console.warn(chalk.dim(`Snapshot ID: ${result.snapshotId}`));
      } else {
        spinner.fail('Failed to upload snapshot');
        console.error(chalk.red(result.error || 'Unknown error'));
        process.exit(1);
      }
    } catch (error) {
      spinner.fail('Capture failed');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

// Config command
program
  .command('config')
  .description('View or update configuration')
  .option('-p, --project-id <id>', 'Set project ID')
  .option('-u, --api-url <url>', 'Set API URL')
  .option('--show', 'Show current configuration')
  .action((options: { projectId?: string; apiUrl?: string; show?: boolean }) => {
    const config = loadConfig();

    if (options.show || (!options.projectId && !options.apiUrl)) {
      console.warn(chalk.bold('Current Configuration:\n'));
      console.warn(`  API URL:     ${config.apiUrl}`);
      console.warn(`  Project ID:  ${config.projectId || chalk.dim('(not set)')}`);
      console.warn(`  Auto Capture: ${config.autoCapture}`);
      console.warn(`  Git Info:    ${config.captureGitInfo}`);
      console.warn(chalk.dim(`\nConfig file: ${getConfigPath()}`));
      return;
    }

    if (options.projectId) {
      config.projectId = options.projectId;
    }
    if (options.apiUrl) {
      config.apiUrl = options.apiUrl;
    }

    saveConfig(config);
    console.warn(chalk.green('Configuration updated!'));
  });

// Status command
program
  .command('status')
  .description('Check Chronicle status and connection')
  .action(async () => {
    const config = loadConfig();
    const spinner = ora('Checking status...').start();

    const version = getCurrentVersion();
    spinner.info(`Current version: ${version}`);

    if (!config.projectId) {
      console.warn(chalk.yellow('⚠ Project ID not configured'));
    } else {
      console.warn(chalk.dim(`Project ID: ${config.projectId}`));
    }

    spinner.start('Checking API connection...');
    const healthy = await checkApiHealth(config);

    if (healthy) {
      spinner.succeed(`API is healthy at ${config.apiUrl}`);
    } else {
      spinner.fail(`Cannot reach API at ${config.apiUrl}`);
    }
  });

// Version command
program
  .command('version')
  .description('Show current version')
  .action(() => {
    const version = getCurrentVersion();
    console.warn(version);
  });

program.parse();
