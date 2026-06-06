# Test Plan

A short, living test plan for this E2E suite. It documents _what_ we test and
_why_ — the design intent behind the scenarios, not just the code. In a real
product this is where risk, scope, and prioritization decisions are recorded so
the suite stays purposeful as it grows.

## Scope

**In scope (E2E layer):** user-facing behavior through the browser — navigation,
search interaction, graceful degradation when a dependency fails, and automated
accessibility checks.

**Out of scope here:** unit/component tests (live with the application code),
load/performance, penetration testing, and full manual accessibility audits.
The E2E suite is the top of the pyramid: a thin layer of high-value journeys,
not a catch-all.

## Test design strategy

- **Risk-based prioritization.** `@smoke` covers the journeys whose failure
  would block a release; everything else is layered on top via tags.
- **Behavior, not implementation.** Scenarios are written in Gherkin against
  observable behavior; selectors and waits are isolated in page objects.
- **Deterministic by construction.** Tests run against a bundled demo app, and
  failure modes (e.g. a down backend) are simulated with network interception
  rather than depending on flaky external state.
- **One assertion of intent per scenario.** Each scenario verifies a single
  user-meaningful outcome, so a failure points at one cause.
- **Equivalence partitioning.** Search is covered by a representative match, a
  no-match, and a backend-failure case rather than exhaustively.

## Coverage matrix

| Area          | Scenario                                      | Type       | Tags                      | Risk   |
| ------------- | --------------------------------------------- | ---------- | ------------------------- | ------ |
| Navigation    | Public page opens successfully (home/about)   | Positive   | `@smoke @navigation`      | High   |
| Search        | Searching returns matching results            | Positive   | `@smoke @search`          | High   |
| Search        | Unknown term shows a no-results message       | Negative   | `@smoke @search`          | Medium |
| Search        | Error message when the search API is down     | Resilience | `@smoke @search @network` | Medium |
| Accessibility | Public pages have no critical a11y violations | Non-func.  | `@smoke @a11y`            | High   |

## Tags

| Tag           | Meaning                                              |
| ------------- | ---------------------------------------------------- |
| `@smoke`      | Release-blocking checks; runs on every PR            |
| `@navigation` | Page-open coverage                                   |
| `@public`     | No authentication required                           |
| `@search`     | Search feature                                       |
| `@network`    | Uses network interception / simulated backend states |
| `@a11y`       | Automated accessibility (axe-core, WCAG 2.1 A/AA)    |

Slices are selected at run time with `E2E_TAGS` — e.g.
`E2E_TAGS='@search and not @network' pnpm run e2e:test` — never by editing
feature files.

## Environments

| Environment | Target                                     | How                                    |
| ----------- | ------------------------------------------ | -------------------------------------- |
| Local/CI    | Bundled demo app (`http://localhost:3000`) | Default — Playwright boots it          |
| Deployed    | A real application                         | Set `BASE_URL`; demo server is skipped |

## Browsers

Chromium runs by default for fast feedback. The full Chromium/Firefox/WebKit
matrix is opt-in via `E2E_ALL_BROWSERS=1` and runs in CI on `main`.

## Entry / exit criteria

- **Entry:** the build installs cleanly and the demo app (or target `BASE_URL`)
  is reachable.
- **Exit (per run):** typecheck, lint, format, and all `@smoke` scenarios pass.
- **Release gate:** the cross-browser matrix is green on `main`.

## Reporting & triage

- CI uploads Playwright HTML reports plus traces, screenshots, and video that
  are retained on failure — enough to triage a flake or regression from the
  artifact alone, without re-running locally.
- A scenario that fails intermittently is quarantined (re-tagged out of
  `@smoke`) and fixed, not retried into green.

## Future coverage (as the app grows)

1. Authenticated journeys via a setup project + saved `storageState`.
2. Domain features split per area under `e2e/features/<domain>`.
3. API-backed setup/teardown for deterministic data.
4. Visual regression on a small set of stable pages.
