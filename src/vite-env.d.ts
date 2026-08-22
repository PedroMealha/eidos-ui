/// <reference types="vite/client" />

// Ambient module declarations for asset imports handled by Vite's bundler.
// TypeScript 7+ enables noUncheckedSideEffectImports by default, which
// requires all side-effect imports to resolve to a known module.
declare module '*.scss' {}
declare module '*.css' {}
