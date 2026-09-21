/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  // No need for additionalData since we're using CSS custom properties (:root variables)
  // and SCSS mixins are imported directly in component files with @use
  test: {
    projects: [
      // ── unit ────────────────────────────────────────────────────────────
      // Pure logic that a story cannot reach: the theme ramp and its contrast
      // derivation, size coercion, class-name helpers. Kept separate from the
      // story project so a logic failure is not buried in 463 render results.
      //
      // It runs in the browser rather than Node, deliberately. Some of this
      // logic is only meaningful against a real DOM (`isFontAvailable`
      // measures text on a canvas), and running the rest in a second
      // environment would invite the class of bug where something passes in
      // Node and fails in a browser. The chromium instance is already being
      // started for the story project, so the marginal cost is small; adding
      // jsdom to avoid it would mean a new dependency *and* a third set of
      // rendering semantics.
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
            // A screenshot of a blank page tells you nothing about why a
            // contrast ratio was wrong, and it litters `src/` with
            // `__screenshots__` directories.
            screenshotFailures: false,
          },
        },
      },

      // ── storybook ───────────────────────────────────────────────────────
      // Every story as a render test, plus `play` interaction tests and the
      // axe accessibility check.
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: new URL('.storybook', import.meta.url).pathname,
            tags: {
              // `ThemeProvider.PinnedContrast` and
              // `ThemeEditor.ContrastDiagnostics` deliberately render a pale
              // yellow with white text - the illegible result *is* what those
              // two stories document. They account for exactly 6 of the
              // measured `color-contrast` nodes.
              //
              // `skip` rather than `exclude`: they stay visible in the test
              // results as skipped, instead of silently vanishing from the
              // count. The tag lives on the story so the reason sits next to
              // the thing it excuses, and `scripts/check-a11y-baseline.js`
              // reads the same tag - one fact, two readers.
              skip: ['a11y-contrast-demo'],
            },
          }),
        ],
        test: {
          name: 'storybook',
          // No `setupFiles` here on purpose. Storybook's own docs still show a
          // `.storybook/vitest.setup.ts` calling `setProjectAnnotations`, but
          // since Storybook 10.3 `@storybook/addon-vitest` applies the preview
          // annotations itself, and it *disables* that automatic provisioning
          // the moment it finds a setup file doing it manually. Adding the
          // documented file here broke 9 of 62 suites outright ("Vitest failed
          // to find the runner") and dropped the run from 463 tests to 375.
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
        },
      },
    ],
  },
});
