#!/usr/bin/env node
/**
 * Bundles a minimal consumer of the built package and fails if Lucide's whole
 * icon set comes along with it.
 *
 * Until 4.0, `renderIcon` resolved string icon names against Lucide's `icons`
 * map. A lookup by a runtime string cannot be tree-shaken, so referencing that
 * map put all ~1,800 icons into every consumer's bundle, however few they
 * used - measured on a real site at 1,083 KB of JS (306 KB gzipped) against
 * the 423 KB it had before adopting the library. Nothing in lint, tsc, tests
 * or the build noticed, because the library itself works either way; only a
 * consumer's bundler shows it.
 *
 * So this is the consumer's bundler, in miniature:
 *
 * - `import { Button } from 'eidos-ui'` must stay small and pull in only the
 *   icons the library actually renders.
 * - `import 'eidos-ui/lucide-icons'` must still pull in the whole set - both
 *   because that opt-in is its whole job, and because it proves the counting
 *   below can see a regression at all. A guard that could never fail would
 *   pass just as quietly as a working one.
 *
 * React is external, as a peer dependency every consumer already has; Lucide
 * is bundled, as a consumer's bundler would bundle it. Reads `dist/`, so it
 * must run after `npm run build`.
 */
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { build } from 'esbuild';

const DIST = resolve('dist');

/**
 * Budgets, with headroom over the measured values in the comment beside each.
 * Raise one only with a reason - the point is that growth is a decision.
 */
const BUDGET = {
  // Measured 4.0.0: 1 (Button's own spinner).
  minimalIcons: 10,
  // Measured 4.0.0: 10.2 KB minified. The same import on 3.8.1: 604.5 KB.
  minimalBytes: 40 * 1024,
  // The opt-in entry must carry (nearly) the whole set, or the count is blind.
  optInMinIcons: 1000,
};

if (!existsSync(join(DIST, 'index.js'))) {
  console.error('✖ dist/index.js not found - run `npm run build` first.');
  process.exit(1);
}

const LUCIDE_ICON_MODULE = /lucide-react[\\/]dist[\\/]esm[\\/]icons[\\/]/;

const measure = async (source) => {
  const dir = mkdtempSync(join(tmpdir(), 'eidos-bundle-'));
  try {
    const entry = join(dir, 'entry.js');
    writeFileSync(entry, source);
    const result = await build({
      entryPoints: [entry],
      bundle: true,
      minify: true,
      write: false,
      metafile: true,
      format: 'esm',
      platform: 'browser',
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      logLevel: 'silent',
      // Resolve `lucide-react` from this repo, as a consumer's install would.
      nodePaths: [resolve('node_modules')],
    });
    // Counted from the *output's* inputs with a non-zero `bytesInOutput`, not
    // from `metafile.inputs`. The latter lists every module esbuild resolved,
    // and any `import { X } from 'lucide-react'` resolves the barrel, which
    // re-exports all ~1,800 icons - so it reports the whole set even when
    // tree-shaking dropped every one. The first version of this check made
    // exactly that mistake and failed a correct build.
    const inputs = Object.values(result.metafile.outputs).flatMap((output) =>
      Object.entries(output.inputs)
        .filter(([, info]) => info.bytesInOutput > 0)
        .map(([path]) => path),
    );
    return {
      bytes: result.outputFiles.reduce((total, file) => total + file.contents.byteLength, 0),
      icons: inputs.filter((input) => LUCIDE_ICON_MODULE.test(input)).length,
      hasIconsMap: inputs.some((input) =>
        /lucide-react[\\/]dist[\\/]esm[\\/]icons[\\/]index\.mjs$/.test(input),
      ),
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const problems = [];

const minimal = await measure(
  `import { Button } from ${JSON.stringify(join(DIST, 'index.js'))};\nconsole.log(Button);\n`,
);
if (minimal.hasIconsMap || minimal.icons > BUDGET.minimalIcons) {
  problems.push(
    `\`import { Button } from 'eidos-ui'\` bundles ${minimal.icons} Lucide icons ` +
      `(budget ${BUDGET.minimalIcons})${minimal.hasIconsMap ? ", including Lucide's full `icons` map" : ''}. ` +
      'Something in the library references the whole icon set again - see the header of this script.',
  );
}
if (minimal.bytes > BUDGET.minimalBytes) {
  problems.push(
    `\`import { Button } from 'eidos-ui'\` is ${kb(minimal.bytes)} minified (budget ${kb(BUDGET.minimalBytes)}).`,
  );
}

const optIn = await measure(`import ${JSON.stringify(join(DIST, 'lucide-icons', 'index.js'))};\n`);
if (optIn.icons < BUDGET.optInMinIcons) {
  problems.push(
    `\`import 'eidos-ui/lucide-icons'\` bundles only ${optIn.icons} icons (expected ${BUDGET.optInMinIcons}+). ` +
      'Either the opt-in entry is broken, or this check can no longer see icon modules - and would miss a regression.',
  );
}

if (problems.length) {
  console.error(`\n✖ Bundle check failed\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error('');
  process.exit(1);
}

console.log(
  `✓ Button alone: ${kb(minimal.bytes)}, ${minimal.icons} icon(s). ` +
    `lucide-icons opt-in: ${optIn.icons} icons.`,
);
