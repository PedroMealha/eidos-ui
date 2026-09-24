import type { IconType, ComponentSizeProps } from '../../utils';

export type ChipVariantProps = 'filled' | 'outlined' | 'text';
export type ChipColorProps = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

interface BaseChipProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  variant?: ChipVariantProps;
  color?: ChipColorProps;
  size?: ComponentSizeProps;
  fullWidth?: boolean;
  disabled?: boolean;
  tooltip?: string;
  className?: string;
  onClick?: () => void;
  onRemove?: () => void;
  /**
   * Makes the chip a link to this URL - through `LinkProvider`'s component
   * when one is set, a plain `<a>` otherwise. Styled as a clickable chip.
   */
  href?: string;
  /** Link target. Only applies with `href`. */
  target?: React.AnchorHTMLAttributes<HTMLAnchorElement>['target'];
  /** Link relationship. Defaults to `noopener noreferrer` with `target="_blank"`. */
  rel?: string;
}

export interface TextChipProps extends BaseChipProps {
  children: React.ReactNode;
  preIcon?: IconType;
  posIcon?: IconType;
}

export type ChipProps = TextChipProps;
