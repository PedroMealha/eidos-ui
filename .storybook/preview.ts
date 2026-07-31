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
  },
};

export default preview;

