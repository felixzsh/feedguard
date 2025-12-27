import { platformRegistry } from '../../platforms/registry.js';
import { launchBrowser, closeBrowser, navigateTo } from '../../core/browser.js';
import { loadSession } from '../../core/persistence.js';
import { loadConfig } from '../../core/config.js';

export async function runCommand() {
  try {
    const config = loadConfig();
    const existingSession = await loadSession();

    const { browser, page } = await launchBrowser(existingSession);

    try {
      for (const source of config.sources) {
        console.log(`Processing ${source.platform}/${source.handle}`);

        await import(`../../platforms/${source.platform}.js`);

        const platform = platformRegistry.getPlatform(source.platform.toLowerCase());
        if (!platform) {
          console.error(`Unknown platform: ${source.platform}`);
          continue;
        }

        const url = `${platform.baseUrl}/${source.handle}`;
        await navigateTo(page, url);

        const posts = await platform.scrapePosts(page, source.handle, source.limit);

        // NOTE: this is only for debugging
        const post = posts.at(-1);
        if (post) {
          console.log(`Last post: ${post.content.text}`);
        }

        console.log(`Scraped ${posts.length} posts from ${source.handle}`);
      }
    } finally {
      await closeBrowser(browser);
    }

  } catch (error) {
    console.error('Run command failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
