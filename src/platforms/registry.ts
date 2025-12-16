// platforms/registry.ts
import type { Platform } from './base/types.js';

export class PlatformRegistry {
  private platforms: Map<string, Platform> = new Map();

  register(name: string, platform: Platform): void {
    this.platforms.set(name, platform);
  }

  getPlatform(name: string): Platform | null {
    return this.platforms.get(name) || null;
  }

  getPlatformNames(): string[] {
    return Array.from(this.platforms.keys());
  }
}

export const platformRegistry = new PlatformRegistry();
