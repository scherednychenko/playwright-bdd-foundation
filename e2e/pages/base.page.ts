import { expect, type Page } from '@playwright/test';
import type { NavigationTarget } from '../data/navigation.js';

export class BasePage {
  constructor(readonly page: Page) {}

  async open(target: NavigationTarget): Promise<void> {
    await this.page.goto(target.path, { waitUntil: 'domcontentloaded' });
  }

  async expectReady(target: NavigationTarget): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${escapeRegExp(target.path)}(?:[?#].*)?$`));

    if (target.title) {
      await expect(this.page).toHaveTitle(target.title);
    }

    if (target.readyText) {
      await expect(this.page.getByText(target.readyText).first()).toBeVisible();
    }
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
