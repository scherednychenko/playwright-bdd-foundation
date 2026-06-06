import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures/base.fixture.js';
import { getNavigationTarget } from '../data/navigation.js';

const { When, Then } = createBdd(test);

When('I open the {string} page', async ({ app }, pageKey: string) => {
  await app.open(getNavigationTarget(pageKey));
});

Then('the {string} page should be ready', async ({ app }, pageKey: string) => {
  await app.expectReady(getNavigationTarget(pageKey));
});
