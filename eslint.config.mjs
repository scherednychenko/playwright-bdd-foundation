import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.features-gen/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['e2e/**/*.ts'],
    rules: {
      // Allow intentionally-unused args/vars when prefixed with an underscore.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Playwright-specific lint rules for the step definitions and page objects.
    ...playwright.configs['flat/recommended'],
    files: ['e2e/steps/**/*.ts', 'e2e/pages/**/*.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // In a BDD suite, assertions live in steps and page objects rather than
      // inside `test()` blocks, so this rule does not apply.
      'playwright/no-standalone-expect': 'off',
    },
  },
  {
    files: ['demo/**/*.mjs'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
  prettier,
);
