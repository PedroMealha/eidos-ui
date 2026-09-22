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
 * Why it waits for `storyFinished` rather than for a fixed delay:
 *
 * It used to sleep 250ms per story after `#storybook-root` had children, and
 * that single line was 64% of this step's 186s. It was also the wrong shape of
 * wait in both directions - far too long for a static story, and too short for
 * one whose `play` function takes 2.4s, which was therefore measured
 * mid-interaction. `storyFinished` is emitted after render, after `play` and
 * after every `afterEach` hook, so it is an exact signal for "this story is
 * what it is going to be". It also means `addon-a11y`'s own axe pass has
 * already completed, which is what the "Axe is already running" collision
 * below was about.
 *
 * Why that signal is what makes the worker pool safe:
 *
 * The pool is why this takes ~40s rather than 186s, but parallelism cannot be
 * combined with a *timed* settle. Measured, at 6 workers with a DOM-stability
 * settle, the `--all-rules` probe returned 1498, then 1176, then 1360 nodes
 * for `region`: under CPU contention a story has not finished rendering when
 * axe measures it, and axe silently reports the smaller tree. A
 * `requestIdleCallback` settle failed the same way. With `storyFinished` the
 * counts are identical at 1, 6 and 8 workers, so `A11Y_WORKERS` can differ per
 * machine without moving the baseline - and a slow CI box no longer risks the
 * opposite problem, a fixed delay that is too short there.
 *
 * Shortening that wait re-opens all of it, and it fails *downwards*: the
 * ratchet reports improvements that never happened. Re-validate any change to
 * the waiting with `--all-rules`, never with the default tag set - the
 * recorded baseline is a single rule (`color-contrast`) that is insensitive to
 * partial rendering, and it reported a clean 7 on every corrupted run above.
 *
 * Usage:
 *   node scripts/check-a11y-baseline.js              # check against baseline
 *   node scripts/check-a11y-baseline.js --update     # re-record the baseline
 *   node scripts/check-a11y-baseline.js --report     # per-component detail
 *   node scripts/check-a11y-baseline.js --all-rules  # every axe rule, no comparison
 *
 *   A11Y_WORKERS=1 node scripts/check-a11y-baseline.js   # override the pool size
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { availableParallelism } from 'node:os';
import { c } from './ansi.js';

const require_ = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = join(ROOT, 'scripts', 'a11y-baseline.json');
/** Publishes the same figures in prose; `--update` keeps it in step. */
const A11Y_DOC = join(ROOT, 'ACCESSIBILITY.md');
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
/**
 * Drops the tag filter, so every axe rule is evaluated - best-practice rules
 * included. Diagnostic only: it never compares to, or records, the baseline.
 *
 * It exists because the baseline is one insensitive rule, which makes it
 * useless for checking that a change to *this harness* still sees the same
 * page. The tagged set is 7 nodes; this is ~2900 across 7 rules, and `region`
 * alone counts every element outside a landmark - i.e. it is a direct measure
 * of how much of the story had rendered when axe ran.
 */
const ALL_RULES = args.has('--all-rules');

/**
 * Determinism does not depend on this number - the settle is signal-based, not
 * timed - so it is free to vary per machine. Measured on 10 cores: 1 worker
 * 159s, 4 workers ~50s, 6 workers 41s, 8 workers 42s. The cap is where the
 * curve flattens; halving the core count leaves room for the browser's own
 * threads, which are what the work actually is.
 */
const WORKERS = (() => {
  const override = Number(process.env.A11Y_WORKERS);
  if (Number.isInteger(override) && override > 0) return override;
  return Math.min(6, Math.max(2, Math.floor(availableParallelism() / 2)));
})();

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

if (ALL_RULES && UPDATE) {
  die(
    '--all-rules cannot be recorded as a baseline.\n\n' +
      '  It evaluates rules outside the pinned WCAG tag set, so the counts are not\n' +
      '  comparable with what this gate enforces. It is a diagnostic for the harness.',
  );
}

const { chromium } = require_('playwright');
// The minified build, not `axe-core`'s main entry: it is injected into every
// page, and 580KB parses measurably faster than 1.3MB (35ms -> 28ms per story).
// Nothing here ever steps through axe's own source.
const axeSource = readFileSync(require_.resolve('axe-core/axe.min.js'), 'utf8');

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

/* eslint-disable no-undef -- these callbacks are serialized and run in the
   page, not in Node, so `window` and `document` are the browser's. eslint
   lints this file as a Node script and cannot tell the difference. */

/**
 * Runs before anything else on every navigation, and does two things.
 *
 * Freezing motion: `prefers-reduced-motion` is honoured by this library for
 * *decorative* motion only (spinners and progress bars keep moving by design),
 * so `reducedMotion: 'reduce'` alone does not freeze everything. Entrance
 * transitions matter because axe skips elements it considers invisible, so a
 * control still fading in is not checked and the count depends on how far the
 * animation got. Forcing durations to zero from first paint puts every element
 * in its final state before the first measurement.
 *
 * Recording the lifecycle: Storybook's preview emits `storyFinished` once
 * render, `play` and every `afterEach` hook have completed. The channel does
 * not exist yet at this point, so it is polled for - cheaply, and only until
 * found.
 */
const prepareStory = () => {
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

  window.__eidosStoryDone = 0;
  const poll = setInterval(() => {
    const channel = window.__STORYBOOK_ADDONS_CHANNEL__;
    if (!channel) return;
    clearInterval(poll);
    // An errored story still has to be measured rather than waited on
    // forever - it will simply contribute Storybook's error pane instead.
    for (const event of ['storyFinished', 'storyErrored', 'storyThrewException'])
      channel.on(event, () => {
        window.__eidosStoryDone++;
      });
  }, 5);
  setTimeout(() => clearInterval(poll), 20000);
};

/**
 * A short settle *after* `storyFinished`, for layout-driven rendering that
 * happens outside React's commit - the grids size their rows from a
 * ResizeObserver, which runs after first paint.
 *
 * It watches a layout signature, not just the node count: a ResizeObserver
 * pass can change the geometry axe measures without adding an element. It
 * resolves rather than throws when it runs out of frames, because a story that
 * genuinely never stops mutating must still be audited, not fail the run.
 */
const settleLayout = () =>
  new Promise((resolve) => {
    const signature = () =>
      `${document.querySelectorAll('*').length}:${document.body.scrollHeight}:${document.body.scrollWidth}`;
    let previous = '';
    let stable = 0;
    let frames = 0;
    const tick = () => {
      const current = signature();
      if (current === previous) stable++;
      else {
        stable = 0;
        previous = current;
      }
      frames++;
      if (stable >= 3 || frames > 60) return resolve(frames);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

const runAxe = async (tags) => {
  const options = { resultTypes: ['violations'] };
  if (tags) options.runOnly = { type: 'tag', values: tags };
  // `addon-a11y` runs its own axe pass when the story renders, and axe refuses
  // concurrent runs ("Axe is already running") - which is what made 58 of 461
  // stories fail when this first ran against a built Storybook. Waiting for
  // `storyFinished` means that pass has completed before this one starts, so
  // this loop should now never retry; it is kept because a retry firing is the
  // signal that the assumption broke, and losing the audit outright would be a
  // worse way to find out.
  //
  // How much it is load-bearing was measured by deliberately breaking the
  // signal: with stories measured mid-`play` the collisions came straight back
  // and the run did not finish 480 stories in 16 minutes, against 45s.
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const result = await window.axe.run(document, options);
      return result.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length }));
    } catch (error) {
      if (!/already running/i.test(String(error && error.message))) throw error;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  throw new Error('axe stayed busy for 2s - the addon\u2019s run never settled');
};

const storyDone = () => window.__eidosStoryDone > 0;

const storyMounted = () => {
  const root = document.querySelector('#storybook-root');
  return !!root && root.children.length > 0;
};
/* eslint-enable no-undef */

const browser = await chromium.launch();
const byRule = new Map();
const loadErrors = [];
const queue = stories.slice();
let audited = 0;
let fellBack = 0;
let signalSeen = false;

/**
 * One browser context per worker, each pulling from the shared queue. Contexts
 * rather than pages so nothing - storage, focus, a leaked portal - can travel
 * between two stories being measured at once.
 */
const auditWorker = async () => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'reduce',
  });
  await context.addInitScript(prepareStory);
  const page = await context.newPage();

  for (;;) {
    const story = queue.shift();
    if (!story) break;

    try {
      await page.goto(`http://localhost:${port}/iframe.html?id=${story.id}&viewMode=story`, {
        waitUntil: 'load',
        timeout: 30000,
      });

      try {
        await page.waitForFunction(storyDone, {
          // Generous for one slow story - the slowest here is a 2.4s `play`
          // function - but bounded in aggregate: once the signal has proved
          // absent in this build, paying 20s for each of 480 stories would
          // present as a 30-minute hang, where a fast, loud degradation is
          // what is wanted.
          timeout: signalSeen || fellBack === 0 ? 20000 : 1000,
          polling: 20,
        });
        signalSeen = true;
      } catch {
        // The signal is a Storybook internal, so it gets a fallback rather
        // than blind trust: degrade to what this script did before it existed
        // (mounted, then a fixed settle). Counted and reported, because
        // falling back silently is how a whole class of stories ends up being
        // measured differently from the rest.
        fellBack++;
        await page.waitForFunction(storyMounted, { timeout: 15000, polling: 50 });
        await page.waitForTimeout(250);
      }

      await page.evaluate(settleLayout);
      await page.evaluate(axeSource);
      const violations = await page.evaluate(runAxe, ALL_RULES ? null : TAGS);

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
      loadErrors.push({
        id: story.id,
        message: String(error.message).split('\n')[0].slice(0, 120),
      });
    }

    if ((audited + loadErrors.length) % 50 === 0) process.stdout.write(c.dim('.'));
  }

  await context.close();
};

process.stdout.write(
  c.dim(
    `  auditing ${stories.length} stories across ${WORKERS} worker${WORKERS === 1 ? '' : 's'}` +
      (ALL_RULES ? ', all rules' : ''),
  ),
);
await Promise.all(Array.from({ length: WORKERS }, () => auditWorker()));
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

if (fellBack) {
  console.log(
    c.yellow(
      `  ${fellBack} of ${stories.length} stories never emitted \`storyFinished\` and were ` +
        `measured after a fixed 250ms instead.\n` +
        `  The counts below are not comparable with the baseline if this number is not 0.\n`,
    ),
  );
}

const current = Object.fromEntries(
  [...byRule.entries()].sort((a, b) => b[1].nodes - a[1].nodes).map(([id, r]) => [id, r.nodes]),
);
const totalNodes = Object.values(current).reduce((a, b) => a + b, 0);

if (ALL_RULES) {
  // Deliberately no comparison and no exit code: this measures the harness,
  // not the library. Two runs of it must agree with each other - including at
  // different `A11Y_WORKERS` - and that is the whole purpose.
  console.log(
    `\n${c.bold('axe — every rule')}  ${c.dim('diagnostic, not compared to baseline')}\n`,
  );
  for (const [id, r] of [...byRule.entries()].sort((a, b) => b[1].nodes - a[1].nodes)) {
    console.log(`${String(r.nodes).padStart(5)}  ${(r.impact || '?').padEnd(9)} ${id}`);
  }
  console.log(
    `\n  ${c.bold(totalNodes)} nodes across ${Object.keys(current).length} rules, ` +
      `${audited} stories, ${WORKERS} worker${WORKERS === 1 ? '' : 's'}\n`,
  );
  process.exit(0);
}

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

  // ACCESSIBILITY.md publishes these same two figures, and `check-docs.js`
  // compares them against the file just written - so leaving the prose to a
  // human made re-recording a two-step operation where forgetting the second
  // step fails `verify` with a message about a number rather than about the
  // work. The figures are now written from the measurement, which is the same
  // rule the generated Foundations pages follow: exactly one place states a
  // value, and it is not typed by hand.
  const updatedDoc = await (async () => {
    const before = readFileSync(A11Y_DOC, 'utf8');
    const after = before
      .replace(/across \*\*\d+ stories\*\*/, `across **${audited} stories**`)
      .replace(/(\|\s*axe-core violations\s*\|\s*)\*\*\d+\*\*/, `$1**${totalNodes}**`);
    if (after === before) return null;

    // Reformatted because a changed digit can change a markdown table's
    // column alignment, which `prettier:check` covers.
    const docOptions = (await prettier.resolveConfig(A11Y_DOC)) ?? {};
    writeFileSync(A11Y_DOC, await prettier.format(after, { ...docOptions, parser: 'markdown' }));
    return true;
  })();

  console.log(
    `\n${c.green('✓')} baseline recorded: ${c.bold(totalNodes)} nodes across ` +
      `${Object.keys(current).length} rules, ${audited} stories` +
      (skipped ? c.dim(` (${skipped} excluded)`) : '') +
      `\n  ${c.dim(BASELINE.replace(ROOT + '/', ''))}` +
      (updatedDoc
        ? `\n  ${c.dim(A11Y_DOC.replace(ROOT + '/', ''))} ${c.dim('(figures updated to match)')}`
        : '') +
      '\n',
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

// The audited *count* is part of the recorded claim, not just context for it.
//
// `ACCESSIBILITY.md` states this number, and `check-docs.js` compares that
// prose against this file - so if the recorded count is allowed to lag behind
// reality, the doc check verifies the two stale numbers agree with each other
// and the published figure is wrong anyway. It drifted 475 → 480 exactly that
// way.
//
// Treated like the improvements branch below rather than as a regression: no
// violation has appeared, the record simply needs bringing up to date. It is
// also a cheap signal that the audit surface moved, which is the moment to ask
// whether newly added stories are covering states nothing looked at before.
if (audited !== baseline.storiesAudited) {
  console.error(
    `\n${c.red('✖')} ${c.bold('The audited story count no longer matches the baseline')}\n\n` +
      `    recorded ${baseline.storiesAudited}, audited ${c.bold(audited)}\n` +
      `\n  No new violations - but this figure is published in ACCESSIBILITY.md,\n` +
      `  so re-record it. That updates the prose for you:\n` +
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
