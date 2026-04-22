import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

export interface EnvConfig {
  displayName: string;
  baseUrl: string;
  apiUrl: string;
  loginPath: string;
  username: string;
  password: string;
}

const environment = (process.env.ENVIRONMENT ?? 'preprod').toLowerCase();

const configPath = path.join(__dirname, 'env', environment, 'config.json');

if (!fs.existsSync(configPath)) {
  throw new Error(
    `No config found for ENVIRONMENT="${environment}".\n` +
    `Expected file: ${configPath}\n` +
    `Add a config.json at: src/config/env/${environment}/config.json`,
  );
}

const envConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as EnvConfig;

export const config = {
  environment,
  ...envConfig,
  logging: {
    level: process.env.LOG_LEVEL ?? 'INFO',
  },
};
