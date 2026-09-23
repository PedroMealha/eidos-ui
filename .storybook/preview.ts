import type { Preview } from '@storybook/react-vite';
// Mirrors what a consumer importing both `eidos-ui/styles` and the optional
// `eidos-ui/fonts` gets. Without the second import the docs render in the
// system fallback rather than the theme's own Plus Jakarta Sans.
import '../src/styles/index.scss';
import './preview-fonts.scss';
// Storybook-only, for the guide pages - see the file's own header.
import './preview-docs.scss';

/** The two fields `storySort` reads from each sidebar entry. */
type StorySortEntry = { title: string; name: string };

/**
 * `Preview` alone leaves `storySort`'s parameters implicitly `any`, because
 * `Preview['parameters']` is an index signature of `any` - an error under
 * `strict`, and one only an editor reported until `.storybook` was added to the
 * tsconfig's `include`.
 *
 * The intersection has to be here, on the declaration. It cannot go on the
 * `options` object as a `satisfies`/`as` clause, and it cannot be an annotation
 * inside the comparator - see the note on `storySort` for what each of those
 * breaks. Declaring it here leaves every node from `parameters` down to
 * `storySort` a plain object literal, which is what Storybook's AST walk
 * requires, while still typing the parameters.
 */
const preview: Preview & {
  parameters: { options: { storySort: (a: StorySortEntry, b: StorySortEntry) => number } };
} = {
  parameters: {
    // axe runs against every story, in the "Accessibility" panel and as part
    // of `npm run test:stories`.
    //
    // **The tag set is pinned deliberately.** The addon's default does not
    // include `wcag22aa`, which meant `target-size` (SC 2.5.8) was never
    // evaluated - 99 failing nodes across ColorPicker, DataGrid, Chip,
    // SplitButton and NumberInput were invisible in every run until the tags
    // were set explicitly. The target is WCAG 2.2 AA; the tag list has to say
    // so, because the default quietly means something narrower.
    //
    // `2a/2aa` and `21a/21aa` are listed alongside `22aa` rather than assumed:
    // WCAG 2.2 is a superset of 2.1 and 2.0, but axe tags rules by the version
    // that introduced them, so omitting the earlier tags would drop the
    // criteria 2.2 inherited.
    //
    // `test: 'todo'` reports without failing. That is not the end state - see
    // `scripts/check-a11y-baseline.js`, which is what actually gates: it fails
    // on any violation beyond the recorded baseline, so the backlog can shrink
    // monotonically without the suite being permanently red (a red suite
    // teaches people to ignore it).
    //
    // Either way axe is a net, not a certificate: it covers roughly a third of
    // the WCAG success criteria, so a clean run is necessary and nowhere near
    // sufficient.
    a11y: {
      test: 'todo',
      config: {},
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
        },
      },
    },
    controls: {
      matchers: {
        color: /background$/i,
        date: /Date$/i,
      },
    },
    docs: {
      // Force the "Show code" panel to always serialize the actual rendered
      // React tree to JSX, instead of falling back to the raw literal source
      // of the story object for any story using a custom `render` function
      // (which would otherwise show the `{ render: () => ... }` wrapper).
      source: {
        type: 'dynamic',
      },
    },
    options: {
      // **This must stay an inline literal, and plain JavaScript.** Storybook
      // statically parses this file for `storySort` and `eval`s the node it
      // finds, in isolation, as raw JS. Two consequences, each of which fails
      // the entire index build rather than degrading:
      //
      //   - A reference to anything declared outside the function - even a
      //     `const` in this same file - reports
      //     `storySort: <array | object | function>`.
      //   - A TypeScript annotation anywhere inside it reports
      //     `SyntaxError: Unexpected token ':'`.
      //
      // So everything it needs is declared in the body, and there are no inner
      // helper functions: their parameters would need annotations, which is
      // the second failure.
      //
      // A third constraint decides where the parameter types can live. They
      // cannot be annotated here (the `eval` above), and they cannot be added
      // with `satisfies`/`as` on this object either: Storybook walks
      // `parameters` -> `options` -> `storySort` expecting plain object
      // literals, and either clause replaces `options` with a wrapper node, so
      // the walk reports `storySort: <array | object | function>` again. The
      // type therefore sits on the `preview` declaration - see the note there.
      //
      // A function rather than `{ method: 'alphabetical', order: [...] }`
      // because the declarative form cannot express "one named story first,
      // then alphabetical" without naming every component by hand. Plain
      // alphabetical sorted `Custom Footer` above the primary story, so the
      // sidebar disagreed with the page it describes.
      // `scripts/check-story-docs.js` holds the matching rule for the `.mdx`
      // side; the two exist to agree.
      storySort: (a, b) => {
        // The four guide pages lead, in reading order: what this is, how to
        // install it, the CSP caveat, then the release history. Left to sort
        // themselves they land in the ungrouped bucket, which put "Welcome"
        // and "Getting Started" *below* all 58 components - the worst possible
        // place for the two pages a newcomer needs first.
        //
        // `Foundations` is the shared vocabulary - the tokens and the rules
        // for using them - between the guides and the components that consume
        // them. `Theming` is separate on purpose: Foundations is what the
        // tokens *are*, Theming is how to change them at runtime.
        //
        // Anything unlisted sorts after these, alphabetically.
        const groups = [
          'Welcome',
          'Getting Started',
          'Content Security Policy',
          'Releases',
          'Foundations',
          'Layout',
          'Theming',
          'Elements',
          'Forms',
          'Navigation',
          'Overlays',
          'Data',
          'Feedback',
        ];

        if (a.title !== b.title) {
          const aFound = groups.indexOf(a.title.split('/')[0]);
          const bFound = groups.indexOf(b.title.split('/')[0]);
          const aGroup = aFound === -1 ? groups.length : aFound;
          const bGroup = bFound === -1 ? groups.length : bFound;

          return aGroup - bGroup || a.title.localeCompare(b.title, undefined, { numeric: true });
        }

        // Within one component: the Docs page, then `Playground`, then the
        // rest alphabetically - the same order the `.mdx` renders them in.
        const leading = ['Docs', 'Playground'];
        const aFound = leading.indexOf(a.name);
        const bFound = leading.indexOf(b.name);
        const aRank = aFound === -1 ? leading.length : aFound;
        const bRank = bFound === -1 ? leading.length : bFound;

        return aRank - bRank || a.name.localeCompare(b.name, undefined, { numeric: true });
      },
    },
  },
};

export default preview;
