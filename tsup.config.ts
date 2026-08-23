import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'lucide-react'],
  esbuildPlugins: [
    {
      // Resolve all .scss/.css imports to a virtual empty module so they are
      // completely removed from the JS output.  Styles are distributed as a
      // single pre-compiled dist/index.css that consumers import separately.
      name: 'ignore-scss',
      setup(build) {
        build.onResolve({ filter: /\.scss$|\.css$/ }, args => ({
          path: args.path,
          namespace: 'scss-ignore',
        }));
        build.onLoad({ filter: /.*/, namespace: 'scss-ignore' }, () => ({
          contents: '',
          loader: 'js',
        }));
      },
    },
  ],

});

