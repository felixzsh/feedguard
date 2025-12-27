// Base platform interface
// This file defines the IPlatform interface that all platforms must implement
import type { Post } from './types.js';
import type { PlatformSelectors } from './types.js';

export interface IPlatform {
  readonly name: string;
  readonly baseUrl: string;
  readonly selectors: PlatformSelectors;
  validateLogin(page: any): Promise<boolean>;
  scrapePosts(page: any, handle: string, limit: number): Promise<Post[]>;
}
