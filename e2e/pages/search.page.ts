import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Page object for the demo /search page. Selectors and waits live here so step
 * definitions stay readable and UI-markup changes are localized to one file.
 */
export class SearchPage {
  readonly searchbox: Locator;
  readonly submit: Locator;
  readonly results: Locator;

  constructor(readonly page: Page) {
    this.searchbox = page.getByRole('searchbox', { name: 'Search' });
    this.submit = page.getByRole('button', { name: 'Search' });
    this.results = page.getByRole('listitem');
  }

  async open(): Promise<void> {
    await this.page.goto('/search', { waitUntil: 'domcontentloaded' });
  }

  async search(term: string): Promise<void> {
    await this.searchbox.fill(term);
    await this.submit.click();
  }

  async expectResult(text: string): Promise<void> {
    await expect(this.results.filter({ hasText: text })).toBeVisible();
  }

  async expectNoResults(): Promise<void> {
    await expect(this.page.getByText('No results found')).toBeVisible();
  }

  async expectError(): Promise<void> {
    await expect(this.page.getByRole('alert')).toHaveText('Something went wrong');
  }

  /**
   * Force the search API to fail, so we can verify the page degrades gracefully
   * without depending on real backend behavior. Must be called before search().
   */
  async stubApiFailure(): Promise<void> {
    await this.page.route('**/api/search**', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'service unavailable' }),
      }),
    );
  }
}
