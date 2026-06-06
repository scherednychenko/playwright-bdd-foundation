import AxeBuilder from '@axe-core/playwright';
import { createBdd } from 'playwright-bdd';
import { test, expect } from '../fixtures/base.fixture.js';

const { Then } = createBdd(test);

// Derived from axe's own return type, so we don't depend on resolving the
// transitive `axe-core` module path directly.
type Violation = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'][number];

// Treat critical/serious WCAG 2.1 A/AA findings as failures. Minor/moderate and
// best-practice rules are reported by axe but not gated here, to keep the check
// signal-rich without being noisy.
const BLOCKING_IMPACTS = new Set(['critical', 'serious']);

Then(
  'the {string} page has no critical accessibility violations',
  async ({ app }, _pageKey: string) => {
    const { violations } = await new AxeBuilder({ page: app.page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = violations.filter((v) => BLOCKING_IMPACTS.has(v.impact ?? ''));

    expect(blocking, describeViolations(blocking)).toEqual([]);
  },
);

function describeViolations(violations: Violation[]): string {
  if (violations.length === 0) return 'No accessibility violations';
  return violations
    .map((v) => `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`)
    .join('\n');
}
