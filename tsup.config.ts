import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  esbuildPlugins: [
    {
      name: 'css-module',
      setup(build) {
        build.onResolve(
          { filter: /\.scss$|\.css$/ },
          () => ({ path: '', external: true })
        );
      },
    },
  ],
  onSuccess: 'node scripts/build-styles.js',
});

