/**
 * Runs a command with Node's heap limit raised, and exits with its status.
 *
 * Two commands in this repo outgrow Node's default ~4 GB limit, for unrelated
 * reasons, and both fail in ways that do not point at memory:
 *
 * - `tsup`'s declaration step bundles the type graph for every component
 *   entry in one worker, so it dies with `ERR_WORKER_OUT_OF_MEMORY` *after*
 *   the ESM and CJS bundles have already succeeded.
 * - `storybook dev` crashes during coverage report serialization when the
 *   testing widget runs the full suite - see `scripts/storybook.js`.
 *
 * A bare `NODE_OPTIONS=... cmd` prefix in the npm script would do the same
 * thing in one line, but that syntax is not valid on Windows shells. Setting
 * it here keeps the scripts working the same way everywhere, and keeps the
 * reason documented next to the flag.
 */
import { spawnSync } from 'child_process';

export const DEFAULT_HEAP_MB = 8192;

export const runWithHeap = (command, args = [], heapMb = DEFAULT_HEAP_MB) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      // Appended rather than replacing, so an existing NODE_OPTIONS from the
      // environment is not silently discarded.
      NODE_OPTIONS: [process.env.NODE_OPTIONS, `--max-old-space-size=${heapMb}`]
        .filter(Boolean)
        .join(' '),
    },
  });

  if (result.error) {
    console.error(`✖ failed to start ${command}:`, result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};
