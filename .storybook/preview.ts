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
    options: {
      storySort: {
        // Sort stories alphabetically within each group.
        // The `order` array defines the top-level group sequence;
        // '*' catches anything not explicitly listed.
        method: 'alphabetical',
        order: [
          'Elements',
          'Forms',
          'Feedback',
          'Layout',
          'Navigation',
          'Overlays',
          'Data Display',
          'Data',
          '*',
        ],
      },
    },
  },
};

export default preview;

