import { join } from 'path';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

export interface SessionData {
  cookies: Array<{ name: string; value: string; domain: string }>;
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  timestamp: string;
}

export function getSessionDir(): string {
  return join(process.cwd(), '.feedguard-data');
}

export function getSessionPath(): string {
  return join(getSessionDir(), 'session.json');
}


export async function loadSession(): Promise<SessionData | null> {
  const sessionPath = getSessionPath();

  if (!existsSync(sessionPath)) {
    return null;
  }

  try {
    const content = await readFile(sessionPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('Failed to load session file, starting fresh');
    return null;
  }
}

export async function saveSession(sessionData: SessionData): Promise<void> {
  const sessionDir = getSessionDir();
  const sessionPath = getSessionPath();

  await mkdir(sessionDir, { recursive: true });

  const dataToSave = {
    ...sessionData,
    timestamp: new Date().toISOString()
  };

  await writeFile(sessionPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
}

export function getDebugDir(platform?: string): string {
  const debugDir = join(getSessionDir(), 'debug');
  if (platform) {
    return join(debugDir, platform);
  }
  return debugDir;
}
export async function savePageContent(platform: string, html: string): Promise<void> {
  const debugDir = getDebugDir(platform);
  await mkdir(debugDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}.html`;
  const filepath = join(debugDir, filename);

  await writeFile(filepath, html, 'utf-8');
  console.log(`Page content saved for analysis: ${filepath}`);
}
