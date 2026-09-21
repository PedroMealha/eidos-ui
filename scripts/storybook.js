#!/usr/bin/env node
/**
 * Runs `storybook dev` with a raised heap limit.
 *
 * Without it, running the full component-test suite from the testing widget
 * with **Coverage** enabled kills `storybook dev` outright:
 *
 *     FATAL ERROR: Reached heap limit Allocation failed
 *     - JavaScript heap out of memory
 *
 * The crash lands well after the tests themselves have passed (~140s in, for
 * a run that finished testing at ~38s) and the stack is almost entirely
 * `JsonStringify` -> `SerializeArrayLikeSlow`: it is the v8 coverage report
 * being serialized, not any component or test.
 *
 * Two things confirm it is not this project's code:
 *
 * - `npx vitest run --coverage` over the same suite completes in ~73s with a
 *   1.5 GB peak. Same stories, same config, no crash.
 * - Storybook tracks the dev-UI coverage path crashing on large suites
 *   separately from the CLI path (storybookjs/storybook#35508), with the same
 *   "CLI works, dev UI does not" signature.
 *
 * So this is a mitigation, not a fix - the ceiling is upstream. If it stops
 * being enough, raise `HEAP_MB`, or generate coverage from the CLI instead:
 *
 *     npm test -- --coverage
 *
 * Worth knowing either way: Storybook's own documentation states coverage is
 * not calculated while watch mode is active, so the widget's coverage number
 * comes from a non-watch run regardless.
 */
import { runWithHeap } from './run-with-heap.js';

runWithHeap('storybook', ['dev', '-p', '6007', ...process.argv.slice(2)]);
