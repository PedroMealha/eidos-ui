import { TextButtonProps, IconButtonProps } from '../Button';

export interface HeaderProps {
  /** Page or section title. */
  title: string;
  /** Supporting text rendered below the title. */
  subtitle?: string | React.ReactNode;
  /** Trailing action buttons, rendered right-aligned. */
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
      | 'tooltip'
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
      | 'tooltip'
    >;
