import { readdirSync } from 'fs';
import { defineConfig } from 'tsup';

// PascalCase → kebab-case: ButtonGroup → button-group, DataGrid → data-grid
// No capturing group so the callback receives (match, offset, string) - offset
// is a number and the first-character check works correctly.
const toKebab = (name: string) =>
  name.replace(/[A-Z]/g, (c, i) => (i === 0 ? c.toLowerCase() : `-${c.toLowerCase()}`));

// One entry per component folder, output as dist/<kebab-name>/index.*
const componentEntries = Object.fromEntries(
  readdirSync('./src/components', { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => [`${toKebab(d.name)}/index`, `src/components/${d.name}/index.ts`]),
);

export default defineConfig({
  entry: {
    // Root barrel - keeps `import { Button } from '@pmealha/eidos-ui'` working
    index: 'src/index.ts',
    // Per-component entries - enables `import { Button } from '@pmealha/eidos-ui/button'`
    ...componentEntries,
  },
  format: ['cjs', 'esm'],
  dts: true,
  // splitting: true extracts shared code (hooks, utils) into chunk files so it
  // isn't duplicated across component bundles.  Only effective for ESM; CJS
  // entries are compiled independently (acceptable - CJS is legacy).
  splitting: true,
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
