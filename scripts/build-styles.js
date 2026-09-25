import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { compileString } from 'sass';

// `compressed` rather than Sass's default `expanded`: the published stylesheet
// is only ever read by browsers and bundlers, never by people, and the
// indentation and comments were ~13% of it (264 KB -> 229 KB raw, 31.6 KB ->
// 29.1 KB gzipped). Sass's own minifier, so no extra tool. Anyone debugging a
// rule should read the SCSS under `src/` anyway - that is where the comments
// explaining each decision live.
const compile = (entry) =>
  compileString(readFileSync(entry, 'utf8'), {
    loadPaths: ['./src/styles'],
    style: 'compressed',
  }).css;

// `tsup` normally creates `dist/` before this runs, so this only matters when
// the script is invoked on its own - which `typecheck` now does, because the
// `dev/` app imports `eidos-ui/fonts` and needs the declaration below to
// resolve. Without it the script died with ENOENT on a clean checkout.
if (!existsSync('./dist')) mkdirSync('./dist', { recursive: true });

// ---------------------------------------------------------------------------
// Main stylesheet - `eidos-ui/styles`
// ---------------------------------------------------------------------------

writeFileSync('./dist/index.css', compile('./src/styles/index.scss'));

// TypeScript declaration for the `eidos-ui/styles` side-effect import.
// Without this, consumers on TS 5.5+ get TS2882 because the exports map has
// no `types` condition for the CSS entry point.
writeFileSync('./dist/index.css.d.ts', '// eidos-ui styles\nexport {};\n');

// ---------------------------------------------------------------------------
// Bundled fonts - `eidos-ui/fonts` (opt-in)
// ---------------------------------------------------------------------------
//
// The `@fontsource-variable/*` packages are devDependencies, not dependencies:
// the `.woff2` files are copied into `dist/` here, so they ship inside the
// tarball and consumers never install the upstream packages. Keeping them out
// of `dependencies` also means nobody downloads font data they didn't ask for
// beyond what is already in the tarball.
//
// Only the upright `latin` and `latin-ext` subsets are copied - see the header
// of `src/styles/fonts.scss` for why.

const FONT_DIR = './dist/fonts';

/**
 * Filenames are kept exactly as upstream publishes them, so that the only
 * difference between the published layout and the one Storybook/`dev` consume
 * from `node_modules` is the directory - which `fonts.scss` takes as a
 * variable. Renaming here would force a second copy of the `@font-face` rules.
 */
const FONT_FILES = [
  'node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2',
  'node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-ext-wght-normal.woff2',
  'node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2',
  'node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-ext-wght-normal.woff2',
].map((from) => ({ from, to: from.split('/').pop() }));

// Both families are SIL Open Font License 1.1, which permits redistribution
// but requires the licence travel with the font data.
const FONT_LICENSES = [
  {
    from: 'node_modules/@fontsource-variable/plus-jakarta-sans/LICENSE',
    to: 'Plus-Jakarta-Sans-OFL.txt',
  },
  {
    from: 'node_modules/@fontsource-variable/jetbrains-mono/LICENSE',
    to: 'JetBrains-Mono-OFL.txt',
  },
];

mkdirSync(FONT_DIR, { recursive: true });

for (const { from, to } of [...FONT_FILES, ...FONT_LICENSES]) {
  if (!existsSync(from)) {
    console.error(
      `✖ Missing font source: ${from}\n` +
        '  Run `npm install` - @fontsource-variable/* are devDependencies used to build dist/fonts.',
    );
    process.exit(1);
  }
  copyFileSync(from, `${FONT_DIR}/${to}`);
}

const fontsCss = compile('./src/styles/fonts.scss');
writeFileSync('./dist/fonts.css', fontsCss);
writeFileSync('./dist/fonts.css.d.ts', '// eidos-ui bundled fonts\nexport {};\n');

// Guard against fonts.scss and FONT_FILES drifting apart. A stylesheet
// referencing a file that was never copied fails silently at runtime - the
// browser just falls back to the next family in the stack, which is the exact
// failure this entry point exists to prevent.
const referenced = [...fontsCss.matchAll(/url\(['"]?\.\/fonts\/([^'")]+)['"]?\)/g)].map(
  (match) => match[1],
);
const copied = new Set(FONT_FILES.map((file) => file.to));

const missing = referenced.filter((name) => !copied.has(name));
const unused = [...copied].filter((name) => !referenced.includes(name));

if (missing.length > 0) {
  console.error(`✖ fonts.scss references files that were not copied: ${missing.join(', ')}`);
  process.exit(1);
}
if (unused.length > 0) {
  console.error(`✖ Copied font files that fonts.scss never references: ${unused.join(', ')}`);
  process.exit(1);
}

console.log(`✓ SCSS compiled successfully (+ ${FONT_FILES.length} font files for eidos-ui/fonts)`);
