// Re-export from platform.ts for backward compatibility
export type { IPlatform as Platform } from './platform.js';

export interface PlatformSelectors {
  version: string;
  loggedInIndicators: string[];
}

/**
 * Unified Post type for all platforms
 * Filters and formatters work on this interface, not platform-specific types
 */
export interface Post {
  id: string;
  platform: string;
  author: string;
  content: {
    text: string;
    images?: string[];
    links?: string[];
  };
  metadata?: {
    timestamp?: string;
    url?: string;
  };
}
