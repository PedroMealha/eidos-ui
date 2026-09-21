/**
 * The git pathspec for "sources that end up in dist/".
 *
 * Shared by `release-needed.js` (does this warrant publishing?) and
 * `check-changelog.js` (does this need a changelog entry?), which must agree:
 * a change that needs a release needs an entry, and a change that needs
 * neither must trigger neither.
 *
 * They previously held separate copies with a "keep the two in sync" comment,
 * which is the duplicated-fact shape that has rotted prose in this repo twice
 * already. It had in fact already drifted from reality in both copies -
 * `*.test.tsx` was excluded but `*.test.ts` was not, so the unit tests added
 * alongside the accessibility work would have reported a release as needed
 * for changing nothing that ships.
 *
 * What belongs here: anything tsup reads, plus the scripts that decide what
 * tsup produces. What does not: anything under `src/` that exists only for
 * Storybook or the test run, since `files` is `["dist"]` and tsup builds from
 * each component's `index.ts`.
 */
export const BUILD_INPUTS = [
  'src',
  // Bare `*` patterns match at any depth, unlike `src/**/*.mdx`, which misses
  // files sitting directly in src/ (e.g. src/Introduction.mdx).
  ':(exclude)*.mdx',
  ':(exclude)*.stories.tsx',
  // All three test shapes: `.test.ts` (unit), `.test.tsx` (component), and
  // `.test-d.ts` (type-level, see src/types.test-d.ts).
  ':(exclude)*.test.ts',
  ':(exclude)*.test.tsx',
  ':(exclude)*.test-d.ts',
  // Storybook-only helpers: JSX a guide page needs but can't declare inline
  // (src/Releases.docs.tsx), and shared story/test utilities with no JSX at
  // all (src/story-a11y.docs.ts). Both extensions, so the naming convention
  // rather than the file extension is what marks something as non-shipping.
  ':(exclude)*.docs.ts',
  ':(exclude)*.docs.tsx',
  'tsup.config.ts',
  'scripts/build-styles.js',
  // The build entry point - it sets the heap limit tsup's declaration step
  // needs, so a change here can change whether dist/ is produced at all.
  'scripts/build.js',
];
