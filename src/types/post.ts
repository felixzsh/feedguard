/**
 * Unified Post type for all platforms
 * Filters and formatters work on this interface, not platform-specific types
 */

export interface Post {
  id: string;
  platform: string;
  author: {
    handle: string;
    name?: string;
  };
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
