/**
 * A tiny fake transport layer.
 *
 * Every "endpoint" in this folder goes through `request()`, which adds
 * realistic latency so loading states, skeletons and disabled buttons are
 * actually visible while clicking around.
 *
 * Failures are deliberately NOT random. Random failures make a demo feel
 * broken rather than realistic, so there are exactly two ways to see an error:
 *   1. Act on a resource the domain rejects (e.g. a locked ticket).
 *   2. Flip the "Force API errors" switch in the admin header.
 */

const MIN_LATENCY_MS = 180;
const MAX_LATENCY_MS = 560;

let forceFailures = false;

export const setForceFailures = (value: boolean): void => {
  forceFailures = value;
};

export const getForceFailures = (): boolean => forceFailures;

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const latency = (): number => MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS);

/**
 * Wraps a resolver in simulated network latency and the forced-failure switch.
 * The resolver runs against the in-memory store and may throw `ApiError`
 * itself to model domain rules.
 */
export async function request<T>(label: string, resolver: () => T): Promise<T> {
  await sleep(latency());

  if (forceFailures) {
    throw new ApiError(`${label} failed: the upstream service is unavailable.`, 503);
  }

  return resolver();
}

/** Narrows unknown catch values to a message safe to show in a snackbar. */
export const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Something went wrong.';
