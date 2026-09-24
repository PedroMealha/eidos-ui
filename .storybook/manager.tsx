// Required, unlike everywhere else in the repo: Storybook bundles the manager
// with the *classic* JSX runtime, so every `<span>` here compiles to
// `React.createElement` and needs `React` in scope. Without it the first
// deprecated component in the sidebar throws "React is not defined" and takes
// down the entire manager UI - verified, not assumed.
import React from 'react';
import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';
import { isDeprecatedEntry } from '../src/deprecation.docs';

/**
 * The sidebar badge for a component tagged `deprecated` (see
 * `src/deprecation.docs.ts` for the full convention).
 *
 * Hex rather than tokens: the manager is Storybook's own UI, outside the
 * preview iframe, so none of the library's custom properties exist here.
 * These are the preset `--danger-dark` on a light tint of it - 6.9:1, held to
 * the same bar as the components even though the a11y ratchet only audits
 * stories.
 */
const DeprecatedBadge: React.FC = () => (
  <span
    style={{
      marginLeft: 6,
      padding: '1px 5px',
      borderRadius: 4,
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.04em',
      lineHeight: '14px',
      color: '#ac2528',
      background: '#fdecec',
      verticalAlign: 'middle',
    }}
  >
    DEPRECATED
  </span>
);

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'eidos-ui',
    brandUrl: 'https://eidos-ui.pedromealha.com',
    brandImage: './eidosui-logo.svg',
    brandTarget: '_self',
  }),
  sidebar: {
    renderLabel: (item) =>
      isDeprecatedEntry(item) ? (
        <span>
          {item.name}
          <DeprecatedBadge />
        </span>
      ) : (
        item.name
      ),
  },
});
