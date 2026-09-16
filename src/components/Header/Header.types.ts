import { TextButtonProps, IconButtonProps } from '../Button';

export interface HeaderProps {
  /**
   * Page or section title. Accepts inline nodes alongside the text - a
   * status `Pill`/`Chip` beside the title is the common case - not just a
   * string. Keep the children inline-level; the title is a heading.
   */
  title: React.ReactNode;
  /** Supporting text rendered below the title. */
  subtitle?: React.ReactNode;
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
