import type { Preview } from '@storybook/react-vite';
// Mirrors what a consumer importing both `eidos-ui/styles` and the optional
// `eidos-ui/fonts` gets. Without the second import the docs render in the
// system fallback rather than the theme's own Plus Jakarta Sans.
import '../src/styles/index.scss';
import './preview-fonts.scss';

const preview: Preview = {
  parameters: {
    // axe runs against every story, both in the "Accessibility" panel and as
    // part of `vitest --project=storybook`.
    //
    // `'todo'` reports violations without failing the run, which is honest
    // about where this actually stands rather than flattering: the first run
    // after wiring the addon was 207 of 439 stories failing. Two systemic
    // root causes have been fixed since (see CHANGELOG.md) and the count is
    // 137, but a real backlog remains - notably `label` (220),
    // `nested-interactive` on Checkbox/Radio's visually-hidden inputs and
    // DataGrid's clickable rows (179), and `button-name` on icon-only
    // controls (64).
    //
    // Flip this to `'error'` when that reaches zero. Leaving it at `'error'`
    // in the meantime would mean a permanently red suite, which teaches
    // people to ignore it.
    //
    // Either way it is a net, not a certificate: axe covers roughly a third
    // of the WCAG success criteria, so a clean run is necessary and nowhere
    // near sufficient. Nothing in this Storybook claims a conformance level
    // on the strength of it.
    a11y: {
      test: 'todo',
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
