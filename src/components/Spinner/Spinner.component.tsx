import React from 'react';
import { LoaderCircle } from 'lucide-react';
import type { ComponentSizeProps } from '../../utils';

export type SpinnerColorProps = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

export interface SpinnerProps {
  size?: ComponentSizeProps;
  color?: SpinnerColorProps;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => (
  <div
    role="status"
    aria-label="Loading"
    className={[
      'eidos-spinner-wrapper',
      `eidos-spinner-wrapper--${size}`,
      `eidos-spinner-wrapper--${color}`,
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    <LoaderCircle className="eidos-spinner" aria-hidden="true" />
  </div>
);
