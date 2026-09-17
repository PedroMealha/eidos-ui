import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

/**
 * Config for the local example app in `dev/` only (`npm run dev`).
 *
 * This is deliberately separate from `vite.config.ts`: that file carries the
 * Vitest/Storybook test projects, which resolve the `.storybook` directory and
 * the story globs relative to the repo root. Setting `root: 'dev'` there would
 * silently break `npm run test`.
 */
const repoRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: 'dev',
  plugins: [react()],
  resolve: {
    /**
     * The example app consumes the library through its published entry points
     * rather than deep relative paths. This keeps the example copy-pasteable
     * for real consumers and means a missing export in `src/index.ts` breaks
     * the dev server immediately instead of after publishing.
     */
    alias: [
      {
        find: /^eidos-ui\/styles$/,
        replacement: `${repoRoot}src/styles/index.scss`,
      },
      {
        /**
         * `src/styles/fonts.scss` defaults its font paths to `./fonts`, which
         * only exists in the built package. This shim supplies the
         * `node_modules` directories instead, exactly as `.storybook` does.
         */
        find: /^eidos-ui\/fonts$/,
        replacement: `${repoRoot}.storybook/preview-fonts.scss`,
      },
      {
        find: /^eidos-ui$/,
        replacement: `${repoRoot}src/index.ts`,
      },
    ],
  },
  server: {
    // `src/` lives outside the Vite root, so it must be explicitly allowed.
    fs: { allow: [repoRoot] },
  },
});
