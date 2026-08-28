// Allow side-effect SCSS/CSS imports in the dev app
declare module '*.scss' {
  const styles: Record<string, string>;
  export default styles;
}
declare module '*.css' {
  const styles: Record<string, string>;
  export default styles;
}

/**
 * The stylesheet subpath resolves to a `.scss` file through the Vite alias, so
 * there is no type to import - it is a side-effect import only. Declared here
 * so the example app typechecks without a built `dist/`.
 */
declare module '@pmealha/eidos-ui/styles';
