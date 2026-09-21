#!/usr/bin/env node
/**
 * Accessibility ratchet.
 *
 * Runs axe-core against every story and compares the result, per rule, to
 * `scripts/a11y-baseline.json`. It fails if any rule exceeds its recorded
 * count, and tells you to re-record when a count drops.
 *
 * Why a ratchet rather than `a11y.test = 'error'`:
 *
 * The audit that produced the baseline found 655 failing nodes across 11
 * rules. Setting the addon to `'error'` with that outstanding means a
 * permanently red suite, and a suite that is always red is one nobody reads -
 * so a genuinely new violation would land unnoticed among the known ones.
 * A ratchet fails on *new* violations immediately while the backlog is worked
 * down, which is the property that actually matters during remediation.
 *
 * Why it runs axe directly instead of reading the addon's output:
 *
 * The addon reports per story into the Vitest run; aggregating that back into
 * per-rule totals means parsing test output. Driving axe here gives exact
 * node counts, the same numbers in CI and locally, and lets the tag set be
 * stated in one place next to the thing that enforces it.
 *
 * Usage:
 *   node scripts/check-a11y-baseline.js              # check against baseline
 *   node scripts/check-a11y-baseline.js --update     # re-record the baseline
 *   node scripts/check-a11y-baseline.js --report     # per-component detail
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const require_ = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = join(ROOT, 'scripts', 'a11y-baseline.json');
const STATIC_INDEX = join(ROOT, 'storybook-static', 'index.json');

/** Must match `parameters.a11y.options.runOnly` in `.storybook/preview.ts`. */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * Stories that opt out, by tag. Mirrors `tags.skip` in `vite.config.ts`.
 *
 * Only for stories where the failure is the documented subject - currently
 * the two theme demos that render white on pale yellow on purpose. Not a
 * general-purpose mute.
 */
const EXCLUDED_TAG = 'a11y-contrast-demo';

const args = new Set(process.argv.slice(2));
const UPDATE = args.has('--update');
const REPORT = args.has('--report');

const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function die(message) {
  console.error(`\n${c.red('✖')} ${message}\n`);
  process.exit(1);
}

if (!existsSync(STATIC_INDEX)) {
  die(
    'storybook-static/index.json not found.\n\n' +
      '  This reads the built Storybook to enumerate stories. Build it first:\n\n' +
      '    npm run build-storybook',
  );
}

const { chromium } = require_('playwright');
const axeSource = readFileSync(require_.resolve('axe-core'), 'utf8');

const entries = Object.values(JSON.parse(readFileSync(STATIC_INDEX, 'utf8')).entries);
const stories = entries.filter((e) => e.type === 'story' && !(e.tags || []).includes(EXCLUDED_TAG));
const skipped = entries.filter(
  (e) => e.type === 'story' && (e.tags || []).includes(EXCLUDED_TAG),
).length;

// Serve the built Storybook rather than requiring a dev server to be running,
// so this behaves identically in CI and on a laptop.
const { createServer } = await import('node:http');
const { readFile, stat } = await import('node:fs/promises');
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.map': 'application/json',
};
const staticRoot = join(ROOT, 'storybook-static');
const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent((req.url || '/').split('?')[0]);
    let file = join(staticRoot, path === '/' ? 'index.html' : path);
    const s = await stat(file).catch(() => null);
    if (s && s.isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    const ext = file.slice(file.lastIndexOf('.'));
    res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((resolve) => server.listen(0, resolve));
const port = server.address().port;

/* eslint-disable no-undef -- the addInitScript callback runs in the page */
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  // Entrance transitions are the other half of the non-determinism: axe skips
  // elements it considers invisible, so a control still fading in is not
  // checked, and the count depends on how far the animation got.
  reducedMotion: 'reduce',
});

// Belt and braces - `prefers-reduced-motion` is honoured by this library for
// *decorative* motion only (spinners and progress bars keep moving by
// design), so it alone does not freeze everything. Forcing the durations to
// zero from first paint puts every element in its final state before the
// first measurement. This mirrors what visual-regression tooling does, and is
// what made the counts reproducible.
await page.addInitScript(() => {
  const style = document.createElement('style');
  style.textContent = `*, *::before, *::after {
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    animation-iteration-count: 1 !important;
  }`;
  const attach = () => document.head?.appendChild(style);
  if (document.head) attach();
  else document.addEventListener('DOMContentLoaded', attach);
});
/* eslint-enable no-undef */

const byRule = new Map();
const loadErrors = [];
let audited = 0;

process.stdout.write(c.dim(`  auditing ${stories.length} stories`));
for (const story of stories) {
  try {
    await page.goto(`http://localhost:${port}/iframe.html?id=${story.id}&viewMode=story`, {
      waitUntil: 'load',
      timeout: 30000,
    });
    // Wait for the story to actually be mounted before measuring.
    //
    // This needs to be an explicit signal, not a delay. Measuring too early
    // produced counts that wandered between runs - `label` at 167, 206 and
    // 219 across three passes, with `nested-interactive` moving in lockstep,
    // because one unrendered grid row costs one unlabelled checkbox and one
    // clickable row. A ratchet built on numbers that wander is worse than no
    // ratchet: it fails for reasons nobody can act on.
    //
    // An earlier attempt watched `document.querySelectorAll('*').length` for
    // stability instead, and made things *worse* - an empty root is perfectly
    // stable, so it returned before the story had mounted at all.
    /* eslint-disable no-undef -- runs in the page, not in Node */
    await page.waitForFunction(
      () => {
        const root = document.querySelector('#storybook-root');
        return !!root && root.children.length > 0;
      },
      { timeout: 15000, polling: 50 },
    );
    /* eslint-enable no-undef */
    // Then a short settle for layout-driven rendering (the grids size their
    // rows from a ResizeObserver, which runs after first paint).
    await page.waitForTimeout(250);
    await page.evaluate(axeSource);
    // This callback is serialized and executed in the page, not in Node, so
    // `window` and `document` are the browser's - eslint lints this file as
    // a Node script and cannot tell the difference.
    /* eslint-disable no-undef */
    const violations = await page.evaluate(async (tags) => {
      // `addon-a11y` runs its own axe pass when the story renders. axe
      // refuses concurrent runs ("Axe is already running"), so wait for the
      // addon's pass to finish rather than racing it - which is what made
      // 58 of 461 stories fail when this first ran against a built
      // Storybook. The dev server's slower timing hid the collision.
      const run = async () => {
        for (let attempt = 0; attempt < 40; attempt++) {
          try {
            return await window.axe.run(document, {
              runOnly: { type: 'tag', values: tags },
              resultTypes: ['violations'],
            });
          } catch (error) {
            if (!/already running/i.test(String(error && error.message))) throw error;
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        }
        throw new Error('axe stayed busy for 2s - the addon\u2019s run never settled');
      };
      const result = await run();
      return result.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length }));
    }, TAGS);
    /* eslint-enable no-undef */
    audited++;
    for (const v of violations) {
      if (!byRule.has(v.id)) byRule.set(v.id, { nodes: 0, stories: new Set(), impact: v.impact });
      const rule = byRule.get(v.id);
      rule.nodes += v.n;
      rule.stories.add(story.title);
    }
  } catch (error) {
    // Report *why*, not just how many. An incomplete audit silently recorded
    // as a baseline would be worse than no baseline at all.
    loadErrors.push({ id: story.id, message: String(error.message).split('\n')[0].slice(0, 120) });
  }
  if (audited % 50 === 0) process.stdout.write(c.dim('.'));
}
process.stdout.write('\n');

await browser.close();
server.close();

if (loadErrors.length) {
  const shown = loadErrors.slice(0, 8);
  die(
    `${loadErrors.length} of ${stories.length} stories failed to load - the audit is incomplete.\n\n` +
      shown.map((e) => `    ${c.dim(e.id)}\n      ${e.message}`).join('\n') +
      (loadErrors.length > shown.length
        ? `\n    ${c.dim(`… and ${loadErrors.length - shown.length} more`)}`
        : ''),
  );
}

const current = Object.fromEntries(
  [...byRule.entries()].sort((a, b) => b[1].nodes - a[1].nodes).map(([id, r]) => [id, r.nodes]),
);
const totalNodes = Object.values(current).reduce((a, b) => a + b, 0);

if (UPDATE) {
  const contents = JSON.stringify({
    $comment:
      'Recorded by `node scripts/check-a11y-baseline.js --update`. Counts may only go down. ' +
      'See the header of that script for why this is a ratchet rather than a hard gate.',
    tags: TAGS,
    recordedAt: new Date().toISOString().slice(0, 10),
    storiesAudited: audited,
    totalNodes,
    rules: current,
  });

  // Formatted with the repo's own prettier config rather than
  // `JSON.stringify(…, null, 2)`, because `prettier:check` covers this file
  // and the two disagree - prettier collapses the short `tags` array onto one
  // line. Deferring to prettier means the file cannot fail `verify` no matter
  // what fields get added here later.
  const prettier = await import('prettier');
  const options = (await prettier.resolveConfig(BASELINE)) ?? {};
  writeFileSync(BASELINE, await prettier.format(contents, { ...options, parser: 'json' }));
  console.log(
    `\n${c.green('✓')} baseline recorded: ${c.bold(totalNodes)} nodes across ` +
      `${Object.keys(current).length} rules, ${audited} stories` +
      (skipped ? c.dim(` (${skipped} excluded)`) : '') +
      `\n  ${c.dim(BASELINE.replace(ROOT + '/', ''))}\n`,
  );
  process.exit(0);
}

if (!existsSync(BASELINE)) {
  die(
    'No baseline recorded yet. Create one with:\n\n    node scripts/check-a11y-baseline.js --update',
  );
}

const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));
const expected = baseline.rules || {};
const regressions = [];
const improvements = [];

for (const [id, nodes] of Object.entries(current)) {
  const was = expected[id] ?? 0;
  if (nodes > was) regressions.push({ id, was, now: nodes });
  else if (nodes < was) improvements.push({ id, was, now: nodes });
}
for (const [id, was] of Object.entries(expected)) {
  if (!(id in current) && was > 0) improvements.push({ id, was, now: 0 });
}

if (REPORT) {
  console.log(`\n${c.bold('axe — WCAG 2.2 AA')}  ${c.dim(TAGS.join(' '))}\n`);
  for (const [id, r] of [...byRule.entries()].sort((a, b) => b[1].nodes - a[1].nodes)) {
    console.log(
      `${String(r.nodes).padStart(5)}  ${(r.impact || '?').padEnd(9)} ${id.padEnd(30)} ` +
        c.dim([...r.stories].sort().join(' · ')),
    );
  }
  console.log('');
}

if (regressions.length) {
  console.error(`\n${c.red('✖')} ${c.bold('New accessibility violations')}\n`);
  for (const r of regressions) {
    console.error(`    ${c.red(r.id.padEnd(30))} ${r.was} → ${c.red(r.now)}  (+${r.now - r.was})`);
  }
  console.error(
    `\n  Fix them, or if the increase is genuinely expected, re-record:\n` +
      `    node scripts/check-a11y-baseline.js --update\n`,
  );
  process.exit(1);
}

if (improvements.length) {
  console.log(`\n${c.green('✓')} ${c.bold('Accessibility improved')}\n`);
  for (const r of improvements) {
    console.log(`    ${c.green(r.id.padEnd(30))} ${r.was} → ${c.green(r.now)}  (${r.now - r.was})`);
  }
  console.log(
    `\n  ${c.yellow('Re-record the baseline so it can never go back up:')}\n` +
      `    node scripts/check-a11y-baseline.js --update\n`,
  );
  process.exit(1);
}

console.log(
  `\n${c.green('✓')} axe: ${totalNodes} nodes across ${Object.keys(current).length} rules — ` +
    `unchanged from baseline (${audited} stories` +
    (skipped ? `, ${skipped} excluded` : '') +
    `)\n`,
);
