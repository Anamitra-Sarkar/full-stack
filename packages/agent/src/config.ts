import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

export interface ChronicleConfig {
  projectId?: string;
  apiUrl: string;
  autoCapture: boolean;
  captureGitInfo: boolean;
  include: string[];
  exclude: string[];
}

const DEFAULT_CONFIG: ChronicleConfig = {
  apiUrl: 'http://localhost:3001',
  autoCapture: false,
  captureGitInfo: true,
  include: ['**/*'],
  exclude: [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    'coverage/**',
    '*.log',
    '.chronicle/**',
  ],
};

const CONFIG_FILE_NAME = 'chronicle.config.json';

/**
 * Get the config file path
 */
export function getConfigPath(cwd: string = process.cwd()): string {
  return path.join(cwd, CONFIG_FILE_NAME);
}

/**
 * Load configuration from file or return defaults
 */
export function loadConfig(cwd: string = process.cwd()): ChronicleConfig {
  const configPath = getConfigPath(cwd);

  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      const userConfig = JSON.parse(content) as Partial<ChronicleConfig>;
      return { ...DEFAULT_CONFIG, ...userConfig };
    } catch {
      console.error(`Failed to parse ${CONFIG_FILE_NAME}, using defaults`);
    }
  }

  return DEFAULT_CONFIG;
}

/**
 * Save configuration to file
 */
export function saveConfig(config: ChronicleConfig, cwd: string = process.cwd()): void {
  const configPath = getConfigPath(cwd);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
}

/**
 * Initialize a new configuration file
 */
export function initConfig(cwd: string = process.cwd()): ChronicleConfig {
  const configPath = getConfigPath(cwd);

  if (fs.existsSync(configPath)) {
    throw new Error(`Configuration file already exists at ${configPath}`);
  }

  const config = { ...DEFAULT_CONFIG };
  saveConfig(config, cwd);
  return config;
}

/**
 * Get the Chronicle data directory
 */
export function getDataDir(): string {
  return path.join(os.homedir(), '.chronicle');
}

/**
 * Ensure the data directory exists
 */
export function ensureDataDir(): void {
  const dataDir = getDataDir();
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}
