import type { Preview } from '@storybook/react-vite';
// Mirrors what a consumer importing both `eidos-ui/styles` and the optional
// `eidos-ui/fonts` gets. Without the second import the docs render in the
// system fallback rather than the theme's own Plus Jakarta Sans.
import '../src/styles/index.scss';
import './preview-fonts.scss';
// Storybook-only, for the guide pages - see the file's own header.
import './preview-docs.scss';

const preview: Preview = {
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
      storySort: {
        // Sort stories alphabetically within each group.
        // The `order` array defines the top-level group sequence;
        // '*' catches anything not explicitly listed.
        //
        // The four guide pages are named explicitly and lead the sidebar, in
        // reading order: what this is, how to install it, the CSP caveat, then
        // the release history. Without them in `order` they fall into the
        // ungrouped bucket, which sorted "Welcome" and "Getting Started"
        // *below* all 58 components - the worst possible place for the two
        // pages a newcomer needs first.
        //
        // They stay at the top rather than bracketing the component groups:
        // Storybook places docs-only entries ahead of component groups
        // regardless of where they sit relative to '*', so listing
        // "Content Security Policy" and "Releases" after it did nothing.
        // Keeping all four together is also the more coherent read.
        method: 'alphabetical',
        order: [
          'Welcome',
          'Getting Started',
          'Content Security Policy',
          'Releases',
          // The shared vocabulary - tokens and the rules for using them -
          // between the guides that explain the library and the components
          // that consume it. `Theming` is separate on purpose: Foundations
          // is what the tokens *are*, Theming is how to change them at
          // runtime.
          'Foundations',
          'Layout',
          'Theming',
          'Elements',
          'Forms',
          'Navigation',
          'Overlays',
          'Data',
          'Feedback',
          '*',
        ],
      },
    },
  },
};

export default preview;
