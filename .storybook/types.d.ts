// Allow side-effect SCSS/CSS imports in Storybook config files.
// The same declarations live in dev/types.d.ts for the dev app,
// but .storybook/ is outside tsconfig "include" so it needs its own copy.
declare module '*.scss' {
  const styles: Record<string, string>;
  export default styles;
}
declare module '*.css' {
  const styles: Record<string, string>;
  export default styles;
}
