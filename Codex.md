# Codex — Agent Guide

Operating guide for AI coding agents (Codex CLI and friends) working in this
repository. Humans: start with [`README.md`](README.md); design rationale lives
in [`ARCHITECTURE.md`](ARCHITECTURE.md).

## What this repo is

A small **BDD + Playwright** E2E foundation. Gherkin features sit on top of page
objects, backed by a typed route catalog. It ships a bundled demo app so the
suite is self-contained: `pnpm run e2e:test` is green without any external
target.

## Layout (where things go)

```text
demo/                 # bundled demo app (static server + JSON API) — default test target
e2e/
  data/navigation.ts  # typed route catalog — the single source of truth for pages
  features/           # Gherkin (.feature): navigation, search, accessibility
  steps/              # step definitions — thin orchestration only
  pages/              # page objects — selectors + UI waits live HERE
  fixtures/           # Playwright/BDD fixtures (wire page objects into tests)
  playwright.config.ts
```

Generated specs land in `e2e/.features-gen/` (git-ignored — never edit by hand).

## Rules

1. **Feature files read like product behavior**, not selector scripts.
2. **Selectors and UI-specific waits live in page objects** — never in steps or
   features.
3. **Steps are small orchestration functions** — no assertions buried in helpers.
4. Prefer the **typed route catalog** (`e2e/data/navigation.ts`) over hardcoded
   paths; adding a page should be a data + examples-table change, not new code.
5. **API helpers are allowed** only for deterministic setup/cleanup — use the UI
   for the behavior actually being verified.
6. Tests should **create their own data** whenever possible.
7. **CI slices are controlled by tags + env flags** (`E2E_TAGS`), never by
   editing feature files.
8. **Cleanup is best-effort by default**, strict only when explicitly requested.

## Never commit

- Real client/customer domain details, names, internal URLs, or absolute paths
  containing a username. Keep examples generic.
- Secrets or `.env`. Auth `storageState` files (`e2e/.auth-state*.json`) and
  local agent config (`.claude/`) are git-ignored — keep it that way.

## Definition of done (run before finishing)

```bash
pnpm run typecheck      # must pass
pnpm run lint           # must pass
pnpm run format:check   # must pass (run `pnpm run format` to fix)
pnpm run e2e:test       # must be green (boots the demo app automatically)
```

## Adding a page (the intended workflow)

1. Add an entry to `e2e/data/navigation.ts` (`key`, `path`, optional `title`,
   `readyText`).
2. Add the `key` to the `Examples` table in the relevant `.feature` file.
3. Run `pnpm run e2e:test`. No new step or spec code should be required for a
   plain open-and-verify page.

## Scaling up

Grow the same skeleton without changing its principles: one `features/` folder
per domain, a page object per interactive screen, an authenticated fixture
backed by a saved `storageState`, and a `utils/`/`api/` layer for backend setup.
See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full picture.
