/// <reference types="vite/client" />

// Stats for the "Welcome" guide page, supplied by the `eidos-stats` Vite
// plugin in `.storybook/stats-plugin.ts` (which also owns the type). Declared
// here rather than in `.storybook/types.d.ts` because the page that consumes
// it lives under `src/`, which is what tsconfig includes.
declare module 'virtual:eidos-stats' {
  const stats: import('../.storybook/stats-plugin.ts').EidosStats;
  export default stats;
}

// Ambient module declarations for asset imports handled by Vite's bundler.
// TypeScript 7+ enables noUncheckedSideEffectImports by default, which
// requires all side-effect imports to resolve to a known module.
declare module '*.scss' {}
declare module '*.css' {}
