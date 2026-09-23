import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'eidos-ui',
    brandUrl: 'https://eidos-ui.pedromealha.com',
    brandImage: './eidosui-logo.svg',
    brandTarget: '_self',
  }),
});
