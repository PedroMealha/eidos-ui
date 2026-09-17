#!/usr/bin/env node
/**
 * Runs `tsup` then compiles the stylesheet.
 *
 * Exists only to raise the heap limit for tsup's declaration step. That step
 * bundles the type graph for every component entry point in a single worker
 * thread, so its memory use grows with the number of components - at 51 entries
 * it exceeds Node's default limit and dies with `ERR_WORKER_OUT_OF_MEMORY`
 * *after* the ESM and CJS bundles have already succeeded, which makes the
 * failure look unrelated to types.
 *
 * A bare `NODE_OPTIONS=... tsup` prefix in the npm script would do the same
 * thing in one line, but that syntax is not valid on Windows shells. Setting it
 * here keeps `npm run build` working the same way everywhere, and keeps the
 * reason documented next to the flag.
 *
 * If this ever starts failing again, raise `HEAP_MB` - the underlying growth is
 * inherent to bundling declarations for every entry at once.
 */
import { spawnSync } from 'child_process';

const HEAP_MB = 8192;

const run = (command, args) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      NODE_OPTIONS: [process.env.NODE_OPTIONS, `--max-old-space-size=${HEAP_MB}`]
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

run('tsup', []);
run(process.execPath, ['scripts/build-styles.js']);
