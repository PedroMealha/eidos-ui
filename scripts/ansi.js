/**
 * Terminal colour for the repo's own scripts.
 *
 * It lives here rather than being re-declared per script because the escape
 * table had already been copied once (`check-a11y-baseline.js`), and the
 * enabled/disabled decision below is the part that must not drift - a script
 * that strips colour when piped and another that does not produce different
 * logs for the same run.
 *
 * `%c` is NOT an alternative to any of this. It is a browser-devtools
 * convention, and Node's `util.format` accepts it only to discard it: the CSS
 * argument is swallowed and the text prints unstyled. `promote-changelog.js`
 * had four `console.log('%c…', 'color: green;')` calls that therefore never
 * coloured anything, silently, on every release.
 */

// Honour the two de-facto standards, and default off when stdout is not a
// terminal - a release log piped to a file or captured by CI should not get
// escape sequences interleaved with the text someone is about to grep.
const ENABLED =
  process.env.FORCE_COLOR !== undefined && process.env.FORCE_COLOR !== '0'
    ? true
    : !process.env.NO_COLOR && Boolean(process.stdout.isTTY);

const wrap = (open) => (s) => (ENABLED ? `\x1b[${open}m${s}\x1b[0m` : String(s));

export const c = {
  red: wrap('31'),
  green: wrap('32'),
  yellow: wrap('33'),
  dim: wrap('2'),
  bold: wrap('1'),
};

/**
 * A path/command mentioned inside a sentence, rendered as a chip: neon green
 * on black, padded by a space either side so it reads as one object rather
 * than as words with an odd colour.
 *
 * 256-colour index 82 rather than a 24-bit `38;2;57;255;20`: visually the same
 * green, and it survives terminals and multiplexers without truecolor support
 * instead of degrading to an unstyled literal escape.
 */
export const token = (s) => (ENABLED ? `\x1b[40;38;5;82m ${s} \x1b[0m` : s);

export { ENABLED as colorEnabled };
