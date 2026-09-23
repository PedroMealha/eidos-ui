import type { StorybookConfig } from '@storybook/react-vite';
// Explicit `.ts` extension: Storybook warns on extensionless imports in
// `main.ts`, which it loads outside the Vite pipeline that would resolve them.
import { eidosStatsPlugin } from './stats-plugin.ts';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
    // Runs axe-core against every story and reports in the "Accessibility"
    // panel. It is a regression net, not a conformance check - axe covers
    // roughly a third of the WCAG success criteria and cannot certify AA,
    // which is why no page in this Storybook claims a conformance level.
    // It exists because this library has twice shipped exactly the class of
    // defect axe does catch: every focus ring in the library removed by a
    // single `outline: none` in a reset, and systemically illegible text on
    // themeable fills. Both were invisible to lint, tsc and the build.
    '@storybook/addon-a11y',
  ],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  // Assets served only by Storybook (manager branding, favicon). Kept under
  // `.storybook/` rather than a root `public/`, which Vite's library build
  // would copy into `dist` and ship with the npm package.
  staticDirs: ['./public'],

  // Supplies `virtual:eidos-stats` to the Welcome page, so every number it
  // shows is derived from the source tree instead of typed out and left to rot.
  viteFinal: (config) => {
    config.plugins = [...(config.plugins ?? []), eidosStatsPlugin()];
    return config;
  },
};

export default config;
