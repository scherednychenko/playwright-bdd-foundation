import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures/base.fixture.js';

const { Given, When, Then } = createBdd(test);

Given('the search API is unavailable', async ({ search }) => {
  await search.stubApiFailure();
});

When('I open the search page', async ({ search }) => {
  await search.open();
});

When('I search for {string}', async ({ search }, term: string) => {
  await search.search(term);
});

Then('I should see {string} in the results', async ({ search }, text: string) => {
  await search.expectResult(text);
});

Then('I should see a no-results message', async ({ search }) => {
  await search.expectNoResults();
});

Then('I should see an error message', async ({ search }) => {
  await search.expectError();
});
