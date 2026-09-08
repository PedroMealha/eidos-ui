import type { ComponentSizeProps } from '../../utils';

export interface KbdProps {
  /** The key name or symbol to display. */
  children: React.ReactNode;
  size?: ComponentSizeProps;
  className?: string;
}
