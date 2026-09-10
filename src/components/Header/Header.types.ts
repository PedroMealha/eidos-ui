import { AvatarProps } from '../Avatar';
import { BreadcrumbProps } from '../Breadcrumb';
import { TextButtonProps, IconButtonProps } from '../Button';

export interface HeaderProps {
  title: string;
  subtitle?: string | React.ReactNode;
  breadcrumbs?: Pick<BreadcrumbProps, 'items' | 'separator'>;
  actions?: HeaderActionProps[];
  className?: string;
}

/**
 * Restricted, discriminated subset of ButtonProps for Header actions.
 */
export type HeaderActionProps =
  | Pick<
      TextButtonProps,
      | 'variant'
      | 'color'
      | 'loading'
      | 'disabled'
      | 'preIcon'
      | 'posIcon'
      | 'icon'
      | 'children'
      | 'onClick'
    >
  | Pick<
      IconButtonProps,
      | 'variant'
      | 'color'
      | 'loading'
      | 'disabled'
      | 'preIcon'
      | 'posIcon'
      | 'icon'
      | 'children'
      | 'onClick'
    >;

/** Header brand avatar - only the presentational fields, no `onClick`/`className` since the brand button already owns click handling and layout owns styling. */
export type HeaderAvatarProps = Pick<AvatarProps, 'src' | 'alt' | 'name' | 'color' | 'fallback'>;
