// Re-export from platform.ts for backward compatibility
export type { IPlatform as Platform } from './platform.js';

export interface PlatformConfig {
  name: string;
  loginUrl: string;
  selectors: PlatformSelectors;
}

export interface PlatformSelectors {
  version: string;
  loggedInIndicators: string[];
}