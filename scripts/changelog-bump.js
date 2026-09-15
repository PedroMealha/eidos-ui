/**
 * Shared reading of `CHANGELOG.md`'s `## [Unreleased]` section, and the bump
 * that its content implies.
 *
 * Extracted because three places need the same answer and must never disagree:
 *
 *   - `release.js`        - refuses a too-small bump BEFORE spending two
 *                           minutes on preflight (fails fast).
 *   - `promote-changelog.js` - the authoritative guard, aborting `npm version`
 *                           itself if the bump that actually ran is too small.
 *   - `check-changelog.js` - only cares whether anything was written at all.
 *
 * The rule, from the "Changelog discipline" section in SKILL.md: a literal
 * `**Breaking**` marker requires major and overrides everything else; an
 * `### Added` entry with no breaking marker requires at least minor; anything
 * else is a patch.
 */
import { readFileSync } from 'node:fs';

/**
 * The standing explanatory note that sits under `## [Unreleased]` even when
 * there are no real entries. Exported as a literal because
 * `promote-changelog.js` writes it back out when it promotes a release.
 */
export const BOILERPLATE =
  'Entries land here as work happens, not written retroactively at release time\n' +
  '- see the "Changelog discipline" section in\n' +
  '`.devin/skills/eidos-ui-rules/SKILL.md` for the convention this follows.';

/**
 * Whitespace-tolerant form of BOILERPLATE, for stripping it back out. Matching
 * loosely matters because the note gets re-wrapped by prettier whenever the
 * surrounding prose changes, and an exact-string strip would silently start
 * treating the boilerplate as a real entry.
 */
const BOILERPLATE_PATTERN =
  /Entries land here as work happens, not written retroactively at release time\s*-\s*see the "Changelog discipline" section in\s*`\.devin\/skills\/eidos-ui-rules\/SKILL\.md` for the convention this follows\./;

/** Smallest to largest, so a bump can be compared against a requirement. */
export const BUMPS = ['patch', 'minor', 'major'];

/** Position in BUMPS; -1 for anything unrecognised. */
export const rank = (bump) => BUMPS.indexOf(bump);

/**
 * Everything between `## [Unreleased]` and the next `## [` heading, with the
 * standing note removed. Empty string means nothing is queued for release.
 */
export function unreleasedContent(changelog = readFileSync('./CHANGELOG.md', 'utf8')) {
  const match = changelog.match(/## \[Unreleased\]\n([\s\S]*?)(?=\n## \[|$)/);
  if (!match) return '';
  return match[1].replace(BOILERPLATE_PATTERN, '').trim();
}

/** The smallest bump the queued entries permit. */
export function impliedBump(content) {
  if (/\*\*Breaking\*\*/i.test(content)) return 'major';
  if (/^### Added\b/m.test(content)) return 'minor';
  return 'patch';
}
