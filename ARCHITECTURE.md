# Architecture & Design Notes

This project puts a thin BDD layer on top of Playwright so product flows stay
readable while implementation details live in page objects, fixtures, and (when
useful) API helpers. The goal is not abstraction for its own sake — it is to
make coverage easy to scan, easy to regenerate, and stable enough for CI.

> This repository is a deliberately small **foundation**. It ships a single
> public-navigation feature against a bundled demo app. The notes below also
> describe how the same shape scales up to a full product suite, drawn from
> using this pattern on larger (private) projects.

## What's Here

- **Playwright** drives the browser automation.
- **`playwright-bdd`** turns Gherkin feature files into Playwright specs under
  `e2e/.features-gen` (generated, git-ignored).
- **Feature files** (`e2e/features`) describe user-facing workflows in Gherkin.
- **Step definitions** (`e2e/steps`) map Gherkin steps to small orchestration
  functions.
- **Page objects** (`e2e/pages`) own selectors and UI-specific waiting.
- **Fixtures** (`e2e/fixtures`) wire page objects (and, later, auth state) into
  the test context.
- **A typed route catalog** (`e2e/data/navigation.ts`) is the single source of
  truth for which pages exist and how to assert they loaded.
- **A bundled demo app** (`demo/`) is a zero-dependency static server so the
  suite is green immediately after `pnpm install`, with no external target.

## Core Principles

1. Feature files should read like product behavior, not selector scripts.
2. Page objects own selectors and UI-specific waiting.
3. Steps are small orchestration functions — no assertions buried in helpers.
4. API helpers are allowed when they make setup deterministic or avoid slow UI
   ceremony.
5. Tests create their own data whenever possible.
6. CI slices are controlled by tags and explicit environment flags, never by
   editing feature files.
7. Cleanup is best-effort by default and strict only when explicitly requested.

## Folder Shape (this repo)

```text
demo/
  public/            # static home + about pages
  server.mjs         # zero-dependency static server (Playwright webServer boots it)
e2e/
  data/              # typed route catalog
  features/          # Gherkin feature files
  fixtures/          # Playwright/BDD fixtures
  pages/             # page objects
  steps/             # step definitions
  playwright.config.ts
  tsconfig.json
```

## How It Scales

A full product suite grows the same skeleton without changing its principles:

- `features/` gains one folder per domain (e.g. `auth/`, `billing/`, `users/`).
- `pages/` gains a page object per screen that needs interaction beyond
  "open and verify".
- `fixtures/` gains an authenticated context backed by a saved Playwright
  `storageState`.
- A `utils/` (or `api/`) layer is added for backend setup/cleanup that is faster
  or more reliable than driving the UI.

### BDD Layer

Feature files use tags to control where scenarios run:

- `@smoke` for fast confidence checks (CI and pull requests).
- `@regression` for fuller, non-smoke coverage.
- Domain tags (e.g. `@navigation`, `@public`) for slicing by area.
- Prerequisite tags to mark scenarios that need specific setup.

`defineBddConfig` can be called more than once to generate **separate projects**
(setup, smoke, regression, …) so CI runs a targeted subset without touching the
feature files. `E2E_TAGS` selects the slice at run time.

### Fixtures & Auth

Authenticated browser state is kept in `storageState` files created by a
one-time **setup project** that logs in and saves the session. Keeping setup
state separate from any pre-existing smoke accounts prevents a full local run
from clobbering credentials between modes. Multiple profiles (e.g. per region or
per role) live in their own state files.

> Auth-state files are git-ignored (see `.gitignore`). This foundation focuses on
> public navigation; add the setup project when the first authenticated flow
> appears.

### Page Objects

Page objects are deliberately boring. They expose intent-revealing actions —
`open()`, `expectReady()`, and, in larger suites, things like
`openFirstResult()` or `selectTab()`. Selectors stay inside the page object so
step definitions read cleanly and UI markup changes are localized to one place.

### API Helpers

Some flows are faster and more reliable when setup happens through the backend.
The rule of thumb: **use the UI for the behavior being verified, and use the API
for deterministic setup or cleanup** (creating entities, moving them through
states, tearing them down).

### CI Strategy

Tags + environment flags map cleanly onto CI jobs: a fast `@smoke` slice on every
pull request, broader regression on demand or on a schedule. Generated specs stay
deterministic because gating is explicit, never implicit.

### Cleanup Strategy

Entities created during a run are recorded to a cleanup manifest. Cleanup is
opt-in and best-effort by default, and can be made strict (fail the run on
cleanup error) via an environment flag when a clean state is required.

## Reusing This Skeleton

For a mostly UI/frontend project with many pages, start exactly as small as this
repo:

1. Add Playwright and `playwright-bdd`.
2. Create a `navigation` feature that opens each important route.
3. Put route definitions in one typed catalog.
4. Add a generic page object that checks URL, document readiness, and a stable
   page marker.
5. Add tags like `@smoke`, `@navigation`, and `@public`.
6. Add authentication later, as a separate setup project + `storageState` file.
7. Only introduce domain-specific page objects once a page needs interaction
   beyond "open and verify".
