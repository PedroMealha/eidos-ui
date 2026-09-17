/**
 * Logs a misconfiguration warning, once per `key`, and never in production.
 *
 * Deliberately reads `process.env.NODE_ENV` off `globalThis` behind a cast
 * rather than referencing `process` directly: this is a browser library, and
 * a bare `process` reference fails the `tsup` dts build (its worker resolves
 * without node types, so `npm run typecheck` passing is not enough) as well
 * as throwing at runtime anywhere a bundler hasn't substituted it. The
 * optional chaining covers every case - no `process`, no `env`, no value.
 *
 * Because the check is dynamic rather than a statically replaceable
 * `process.env.NODE_ENV` expression, the message text stays in production
 * bundles; only the logging is skipped. That is the trade for not shipping a
 * `process` reference at all, and these strings are small.
 */
const warned = new Set<string>();

export function devWarn(key: string, message: string): void {
  const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
    ?.NODE_ENV;
  if (nodeEnv === 'production') return;
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[eidos-ui] ${message}`);
}
