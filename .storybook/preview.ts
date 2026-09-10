import type { Preview } from '@storybook/react-vite';
import '../src/styles/index.scss';

const preview: Preview = {
  parameters: {
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
        method: 'alphabetical',
        order: ['Elements', 'Forms', 'Navigation', 'Overlays', 'Data', 'Feedback', 'Layout', '*'],
      },
    },
  },
};

export default preview;
