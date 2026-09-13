/**
 * Verifies that every value/type exported from a component's own `index.ts`
 * (its public deep-import entry point, e.g. `eidos-ui/combobox`) is
 * also re-exported from the root barrel (`src/index.ts`, `eidos-ui`).
 *
 * Why this exists: `ComboboxOption` shipped in 3.0.0 missing from the root
 * barrel even though the component's own `index.ts` exported it - the
 * project's skill doc already states "root barrel must re-export every
 * public type", but nothing enforced it. This script is that enforcement,
 * run from `scripts/preflight-release.js` before every publish.
 *
 * Parsing approach: the codebase consistently uses single-statement
 * `export { A, B } from '...'` / `export type { A, B } from '...'` (with an
 * occasional `X as Y` rename). A lightweight regex scan is sufficient and
 * avoids pulling in a TS parser dependency for a release-time script.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const componentsDir = join(rootDir, 'src', 'components');

/**
 * Extracts named exports from a barrel file's source, split into `values`
 * and `types`. Handles multi-line `export type { ... } from '...'` blocks
 * and `X as Y` renames (the local name `Y` is what is importable).
 */
function extractExports(source) {
  const values = new Set();
  const types = new Set();

  // Strip line comments so a commented-out export isn't picked up.
  const clean = source.replace(/\/\/.*$/gm, '');

  const exportBlockRe = /export\s+(type\s+)?\{([^}]*)\}\s*from/g;
  let match;
  while ((match = exportBlockRe.exec(clean)) !== null) {
    const isType = Boolean(match[1]);
    const names = match[2]
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const asMatch = entry.match(/^\S+\s+as\s+(\S+)$/);
        return asMatch ? asMatch[1] : entry;
      });
    for (const name of names) {
      (isType ? types : values).add(name);
    }
  }

  return { values, types };
}

function listComponentDirs() {
  return readdirSync(componentsDir).filter((name) => {
    const full = join(componentsDir, name);
    return statSync(full).isDirectory();
  });
}

export function checkBarrelExports() {
  const rootSource = readFileSync(join(rootDir, 'src', 'index.ts'), 'utf8');
  const root = extractExports(rootSource);

  const missing = [];

  for (const name of listComponentDirs()) {
    const indexPath = join(componentsDir, name, 'index.ts');
    let source;
    try {
      source = readFileSync(indexPath, 'utf8');
    } catch {
      continue; // no index.ts (shouldn't happen, but not this script's job to enforce)
    }

    const component = extractExports(source);

    for (const value of component.values) {
      if (!root.values.has(value)) {
        missing.push({ component: name, kind: 'value', name: value });
      }
    }
    for (const type of component.types) {
      if (!root.types.has(type)) {
        missing.push({ component: name, kind: 'type', name: type });
      }
    }
  }

  return missing;
}

// Allow running directly: `node scripts/check-barrel-exports.js`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const missing = checkBarrelExports();
  if (missing.length === 0) {
    console.log('✓ Root barrel re-exports everything every component index.ts exports.');
  } else {
    console.error(`✖ Root barrel is missing ${missing.length} export(s):\n`);
    for (const { component, kind, name } of missing) {
      console.error(`  - ${name} (${kind}) — exported by src/components/${component}/index.ts`);
    }
    process.exit(1);
  }
}
