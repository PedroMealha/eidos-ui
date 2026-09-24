import type { IconType, ComponentSizeProps } from '../../utils';

/** Shared across every Button-family component (Button, ButtonGroup, SplitButton, bulk actions, ...). */
export type ButtonVariantProps = 'filled' | 'outlined' | 'text';
/** Shared across every Button-family component (Button, ButtonGroup, SplitButton, bulk actions, ...). */
export type ButtonColorProps = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

interface ButtonStyleProps {
  variant?: ButtonVariantProps;
  color?: ButtonColorProps;
  size?: ComponentSizeProps;
  /**
   * Disables the control. On a link this removes the `href` as well, since an
   * anchor with a destination cannot otherwise be made inert.
   */
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  tooltip?: string;
}

interface TextContentProps {
  children: React.ReactNode;
  preIcon?: IconType;
  posIcon?: IconType;
  icon?: never;
  loadingText?: string;
}

interface IconContentProps {
  icon: IconType;
  children?: never;
  preIcon?: never;
  posIcon?: never;
  loadingText?: never;
}

type NativeButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'color' | 'children' | 'disabled' | 'className'
> & {
  href?: never;
};

type NativeLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'color' | 'children' | 'className'
> & {
  /**
   * Renders the button as a link to this URL - through `LinkProvider`'s
   * component when one is set, a plain `<a>` otherwise. Styling is identical.
   */
  href: string;
};

/** A `<button>` with a text label. */
export interface TextButtonProps extends ButtonStyleProps, TextContentProps, NativeButtonProps {}

/** A `<button>` showing only an icon. */
export interface IconButtonProps extends ButtonStyleProps, IconContentProps, NativeButtonProps {}

/** A link styled as a button, with a text label. */
export interface TextLinkButtonProps extends ButtonStyleProps, TextContentProps, NativeLinkProps {}

/** A link styled as a button, showing only an icon. */
export interface IconLinkButtonProps extends ButtonStyleProps, IconContentProps, NativeLinkProps {}

export type ButtonProps =
  TextButtonProps | IconButtonProps | TextLinkButtonProps | IconLinkButtonProps;
