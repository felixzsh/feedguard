import type { Platform } from './base/types.js';
import { platformRegistry } from './registry.js';
import { navigateTo } from '../core/browser.js';
import type { Post } from './base/types.js';
import type { Page } from 'playwright';

export const FACEBOOK_SELECTORS = {
  version: "1.1.0",

  postContainer: '[role="article"]',
  singlePost: {
    text: '[data-ad-preview="message"]',
    images: [
      '[role="article"] img:not([alt*="profile"]):not([alt*="emoji"])',
      '.scaledImageFitWidth',
      '[data-ft*="top_level_post_id"] img'
    ],
  },

  postUrl: 'a[href*="/posts/"]',

  loadingStates: [
    '[role="progressbar"]',
    'text="Loading..."',
    'text="Cargando..."',
    '[aria-label="Loading"]'
  ],

  loggedInIndicators: [
    '[data-pagelet="LeftRail"]',
    '[role="navigation"] [data-visualcompletion="ignore-dynamic"]',
    'div[data-pagelet="FeedUnit_0"]',
    '[aria-label="Facebook"]'
  ]
};

export class FacebookPlatform implements Platform {
  readonly name = 'facebook';
  readonly baseUrl = 'https://facebook.com';
  readonly selectors = FACEBOOK_SELECTORS;

  async validateLogin(page: Page): Promise<boolean> {
    return validateFacebookLogin(page);
  }

  async scrapeSinglePost(page: Page, postUrl: string, handle: string): Promise<Post> {
    await navigateTo(page, postUrl);
    await page.waitForTimeout(3000);

    const textElement = page.locator(this.selectors.singlePost.text).last();
    const text = await textElement.textContent() || '';

    return {
      id: `${handle}_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`,
      platform: this.name,
      author: handle,
      content: {
        text,
        images: [],
        links: []
      },
      metadata: {
        url: postUrl
      }
    };
  }

  async scrapePosts(page: Page, handle: string, limit: number): Promise<Post[]> {
    await page.waitForTimeout(3000);

    const firstPost = page.locator(this.selectors.postContainer).first();
    const count = await firstPost.count();

    if (count === 0) return [];

    const postUrl = await firstPost.locator(this.selectors.postUrl).first().getAttribute('href');
    const fullUrl = postUrl?.startsWith('http') ? postUrl : `${this.baseUrl}${postUrl}`;

    if (!fullUrl) return [];

    const post = await this.scrapeSinglePost(page, fullUrl, handle);

    if (!post.content.text) return [];

    return [post];
  }
}
// Placeholder for future authentication logic
export async function validateFacebookLogin(page: Page): Promise<boolean> {
  return true;
}

//this will autoregister on imports
platformRegistry.register('facebook', new FacebookPlatform());
