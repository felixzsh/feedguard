import { platformRegistry } from '../../platforms/registry.js';
import { launchBrowser, navigateTo, getPageContent, extractSessionData, closeBrowser } from '../../core/browser.js';
import { loadSession, saveSession, savePageContent } from '../../core/persistence.js';
import { waitForUserConfirmation } from '../../utils/prompt.js';

export async function authCommand(platformName: string) {
  try {

    // lazy load platform
    await import(`../../platforms/${platformName}.js`);

    const platform = platformRegistry.getPlatform(platformName.toLowerCase());
    if (!platform) {
      console.error(`Unknown platform: ${platformName}`);
      console.log(`Available platforms: ${platformRegistry.getPlatformNames().join(', ')}`);
      process.exit(1);
    }

    const config = platform.getConfig();

    const existingSession = await loadSession();
    console.log(existingSession ? 'Loaded existing session' : 'No existing session found');

    console.log(`Opening browser to ${config.loginUrl}...`);
    const { browser, page } = await launchBrowser(existingSession);

    try {
      await navigateTo(page, config.loginUrl);

      console.log(`
=======================================================================
Please log in to ${config.name} manually in the browser window.
Complete any 2FA, captchas, or security checks.
When you reach the ${config.name} homepage, return to this terminal.
=======================================================================
`);

      await waitForUserConfirmation('Press any key to continue after successful login...');

      const pageContent = await getPageContent(page);
      await savePageContent(config.name, pageContent);
      // TODO: implement validation per platform
      console.log('Login assumed successful');

      const newSessionData = await extractSessionData(page.context());

      const combinedSession = newSessionData; // Simple overwrite for now

      await saveSession(combinedSession);
      console.log(`Session saved to .feedguard-data/session.json`);

    } finally {
      await closeBrowser(browser);
      console.log('Browser closed');
    }

  } catch (error) {
    console.error('Authentication failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
