import { chromium } from 'playwright';
import type { Browser, BrowserContext, Page } from 'playwright';
import type { SessionData } from './persistence.js';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';

export interface BrowserSession {
  browser: Browser;
  context: BrowserContext;
  page: Page;
}

function getBrowserProfilePath(): string {
  return join(process.cwd(), '.feedguard-data', 'browser-profile');
}

export async function launchBrowser(sessionData: SessionData | null): Promise<BrowserSession> {
  const profilePath = getBrowserProfilePath();

  // Create browser profile directory if it doesn't exist
  if (!existsSync(profilePath)) {
    mkdirSync(profilePath, { recursive: true });
  }

  try {
    const context = await chromium.launchPersistentContext(profilePath, {
      headless: false,
      channel: 'chrome', // NOTE: some platforms automation only work in Chrome
      viewport: { width: 1280, height: 720 },
      args: [
        '--disable-blink-features=AutomationControlled',
      ]
    });

    const browser = context as any as Browser;
    const pages = context.pages();
    const page = pages.length > 0 ? pages[0]! : await context.newPage();

    if (sessionData) {
      await restoreSession(context, sessionData);
    }

    return { browser, context, page };
  } catch (error) {
    console.log(`Failed to launch with system Chrome: ${error instanceof Error ? error.message : error}`);
    console.log('Falling back to Playwright\'s bundled Chromium (may be detected by social media)...');

    // Fallback: Use Playwright's bundled Chromium
    const context = await chromium.launchPersistentContext(profilePath, {
      headless: false,
      viewport: { width: 1280, height: 720 },
      args: [
        '--disable-blink-features=AutomationControlled',
      ]
    });

    const browser = context as any as Browser;
    const pages = context.pages();
    const page = pages.length > 0 ? pages[0]! : await context.newPage();

    if (sessionData) {
      await restoreSession(context, sessionData);
    }

    return { browser, context, page };
  }
}

export async function restoreSession(context: BrowserContext, sessionData: SessionData): Promise<void> {
  if (sessionData.cookies && sessionData.cookies.length > 0) {
    await context.addCookies(sessionData.cookies);
  }

  if (sessionData.localStorage) {
    const page = await context.newPage();
    await page.goto('about:blank');
    await page.evaluate((localStorageData) => {
      for (const [key, value] of Object.entries(localStorageData)) {
        localStorage.setItem(key, value);
      }
    }, sessionData.localStorage);
    await page.close();
  }
}

export async function navigateTo(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
}

export async function getPageContent(page: Page): Promise<string> {
  return await page.content();
}

export async function extractSessionData(context: BrowserContext): Promise<SessionData> {
  const cookies = await context.cookies();

  const page = await context.newPage();
  await page.goto('about:blank');

  const localStorage = await page.evaluate((): Record<string, string> => {
    const data: Record<string, string> = {};
    try {
      // @ts-ignore - window is available in browser context
      const storage = window.localStorage;
      const length = storage.length;
      for (let i = 0; i < length; i++) {
        const key = storage.key(i);
        if (key) {
          const value = storage.getItem(key);
          if (value !== null) {
            data[key] = value;
          }
        }
      }
    } catch (error) {
      // localStorage might not be accessible
    }
    return data;
  });

  const sessionStorage = await page.evaluate((): Record<string, string> => {
    const data: Record<string, string> = {};
    try {
      // @ts-ignore - window is available in browser context
      const storage = window.sessionStorage;
      const length = storage.length;
      for (let i = 0; i < length; i++) {
        const key = storage.key(i);
        if (key) {
          const value = storage.getItem(key);
          if (value !== null) {
            data[key] = value;
          }
        }
      }
    } catch (error) {
      // sessionStorage might not be accessible
    }
    return data;
  });

  await page.close();

  return {
    cookies,
    localStorage,
    sessionStorage,
    timestamp: new Date().toISOString()
  };
}

export async function closeBrowser(browser: Browser): Promise<void> {
  await browser.close();
}
