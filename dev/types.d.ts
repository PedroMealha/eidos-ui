// Allow side-effect SCSS/CSS imports in the dev app
declare module '*.scss' {
  const styles: Record<string, string>;
  export default styles;
}
declare module '*.css' {
  const styles: Record<string, string>;
  export default styles;
}
