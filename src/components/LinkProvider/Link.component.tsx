import React from 'react';
import { useLinkComponent } from './LinkProvider.context';

export interface EidosLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  /** Renders an inert link: no `href`, `aria-disabled`, out of the tab order. */
  disabled?: boolean;
}

/**
 * The one place the library renders a navigable link. Internal - not exported
 * from the package - so that `Button`, `Chip`, `Breadcrumb` and anything else
 * with an `href` agree on the three rules below instead of each re-deriving
 * them.
 *
 * - **An enabled link** renders the `LinkProvider` component, or `<a>`.
 * - **A disabled link has no `href`.** An anchor with an `href` cannot be
 *   disabled: `disabled` is not an anchor attribute, `pointer-events: none`
 *   still leaves it reachable by keyboard, and it still navigates on Enter.
 *   Removing the `href` is the only thing that makes it inert, and it is also
 *   why this path never uses the provider's component - a router link has no
 *   way to render without a destination. `role="link"` keeps the role that
 *   losing the `href` would otherwise remove, and `aria-disabled` says why.
 * - **`target="_blank"` defaults `rel` to `noopener noreferrer`,** so the
 *   opened page cannot reach back through `window.opener`. An explicit `rel`
 *   always wins.
 */
export const EidosLink: React.FC<EidosLinkProps> = ({
  href,
  disabled = false,
  target,
  rel,
  onClick,
  children,
  ...anchorProps
}) => {
  const LinkComponent = useLinkComponent();

  if (disabled) {
    return (
      <a
        {...anchorProps}
        role="link"
        aria-disabled="true"
        tabIndex={-1}
        onClick={(event) => event.preventDefault()}
      >
        {children}
      </a>
    );
  }

  return (
    <LinkComponent
      {...anchorProps}
      href={href}
      target={target}
      rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
      onClick={onClick}
    >
      {children}
    </LinkComponent>
  );
};
