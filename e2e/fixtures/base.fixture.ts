import { test as base } from 'playwright-bdd';
import { BasePage } from '../pages/base.page.js';
import { SearchPage } from '../pages/search.page.js';

interface Fixtures {
  app: BasePage;
  search: SearchPage;
}

export const test = base.extend<Fixtures>({
  app: async ({ page }, use) => {
    await use(new BasePage(page));
  },
  search: async ({ page }, use) => {
    await use(new SearchPage(page));
  },
});

export { expect } from '@playwright/test';
