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
 * If this ever starts failing again, raise the heap in `run-with-heap.js` -
 * the underlying growth is inherent to bundling declarations for every entry
 * at once.
 */
import { runWithHeap } from './run-with-heap.js';

runWithHeap('tsup');
runWithHeap(process.execPath, ['scripts/build-styles.js']);
