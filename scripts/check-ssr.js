#!/usr/bin/env node
/**
 * Asserts two things about server rendering, both of which the documentation
 * claims and neither of which anything else in the toolchain checks.
 *
 * 1. **No overlay throws when it is rendered open.** Every overlay in this
 *    library portals into `document.body`, and a portal is client-only. An
 *    overlay that is already open on its first render therefore reached
 *    `createPortal` - and a browser-only global - during `renderToString`, and
 *    took the whole server render down with it:
 *
 *        renderToString(<Modal isOpen>)          ReferenceError: document is not defined
 *        renderToString(<Dropdown defaultOpen>)  ReferenceError: DOMRect is not defined
 *        renderToString(<Select autoOpen>)       ReferenceError: DOMRect is not defined
 *
 *    Those are real, measured failures from before `useIsClient` existed.
 *    `Select autoOpen` is not hypothetical - `DataGrid`'s select cell editor
 *    uses it.
 *
 * 2. **No component emits an inline `style` attribute into the SSR payload.**
 *    This is the load-bearing claim on the "Content Security Policy" docs page:
 *    that these components need no `style-src-attr 'unsafe-inline'` allowance
 *    even when server-rendered. It used to hold for an incidental reason -
 *    they "start closed by default", so the branch that computes a position
 *    never ran. That reason stopped being watertight the moment `defaultOpen`
 *    existed, and the claim deserves a test rather than a reason.
 *
 * Why a plain node script and not a Vitest project: the two existing test
 * projects both run in a real chromium, deliberately (see the "unit project
 * runs in a browser on purpose" note in the project rules). An SSR check needs
 * the *absence* of a DOM, which chromium cannot provide, and adding a
 * node-environment project would mean a third set of rendering semantics. This
 * follows `check-docs.js` / `check-changelog.js` / `check-barrel-exports.js`
 * instead.
 *
 * Reads `dist/`, so it must run after `npm run build`.
 */
import { existsSync } from 'node:fs';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';

const DIST = new URL('../dist/index.js', import.meta.url);

if (!existsSync(DIST)) {
  console.error('\n✖ check-ssr: dist/ not found. Run `npm run build` first.\n');
  process.exit(1);
}

const ui = await import(DIST.href);

const OPTION = { value: 'a', label: 'A' };
const ITEMS = [{ type: 'item', id: '1', label: 'One' }];

/**
 * Each case renders on a server with no DOM whatsoever. "Open" cases are the
 * point: a closed overlay was never the risk.
 */
const cases = [
  ['Button', () => h(ui.Button, null, 'Save')],
  ['Input', () => h(ui.Input, { value: '', onChange() {} })],

  // Overlays that a consumer can render already open.
  ['Modal (open)', () => h(ui.Modal, { isOpen: true, onClose() {}, title: 'T' }, 'body')],
  ['Modal (closed)', () => h(ui.Modal, { isOpen: false, onClose() {}, title: 'T' }, 'body')],
  ['Drawer (open)', () => h(ui.Drawer, { isOpen: true, onClose() {}, title: 'T' }, 'body')],
  [
    'Dropdown (defaultOpen)',
    () => h(ui.Dropdown, { defaultOpen: true, trigger: 't', content: 'c' }),
  ],
  ['Dropdown (closed)', () => h(ui.Dropdown, { trigger: 't', content: 'c' })],
  ['Popover (defaultOpen)', () => h(ui.Popover, { defaultOpen: true, trigger: 't' }, 'c')],
  ['CommandPalette (defaultOpen)', () => h(ui.CommandPalette, { defaultOpen: true, items: [] })],
  ['Select (autoOpen)', () => h(ui.Select, { autoOpen: true, options: [OPTION] })],

  // Interaction-only overlays. They cannot open during a server render, so
  // these are regression guards rather than fixes - if one ever gains a
  // `defaultOpen`, this is what notices.
  ['Menu', () => h(ui.Menu, { trigger: h(ui.Button, null, 'Open'), items: ITEMS })],
  ['Tooltip', () => h(ui.Tooltip, { message: 'hi' }, h(ui.Button, null, 'x'))],
  ['ContextMenu', () => h(ui.ContextMenu, { items: ITEMS }, 'target')],
  ['Combobox', () => h(ui.Combobox, { options: [OPTION] })],
  ['TagInput', () => h(ui.TagInput, { value: [], onChange() {}, suggestions: ['a'] })],
  ['DatePicker', () => h(ui.DatePicker, { value: null, onChange() {} })],
  [
    'SplitButton',
    () => h(ui.SplitButton, { label: 'Go', onClick() {}, options: [{ id: '1', label: 'One' }] }),
  ],
];

const failures = [];

for (const [label, build] of cases) {
  let html;
  try {
    html = renderToString(build());
  } catch (error) {
    failures.push(`${label}: threw ${error.constructor.name}: ${error.message.split('\n')[0]}`);
    continue;
  }

  // The CSP claim. `style="..."` in the payload is exactly what
  // `style-src-attr` gates; a CSSOM assignment on the client is not.
  const styles = html.match(/style="[^"]*"/g);
  if (styles) {
    failures.push(`${label}: emitted an inline style attribute: ${styles.join(', ')}`);
  }
}

if (failures.length > 0) {
  console.error(`\n✖ SSR check failed\n`);
  for (const failure of failures) console.error(`    ${failure}`);
  console.error(
    `\n  An overlay must render nothing on the server rather than throwing, and\n` +
      `  no component may serialise a \`style\` attribute into the SSR payload -\n` +
      `  see src/ContentSecurityPolicy.mdx.\n`,
  );
  process.exit(1);
}

console.log(`✓ ssr: ${cases.length} cases render without a DOM, and emit no inline styles`);
