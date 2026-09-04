import React from 'react';
import { LoaderCircle } from 'lucide-react';
import { Tooltip } from '../Tooltip';
import { ButtonProps, IconButtonProps } from './Button.types';
import { renderIcon } from '../../utils';

export const Button: React.FC<ButtonProps> = ({
  variant = 'filled',
  color = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  loadingText = 'Loading...',
  tooltip,
  className = '',
  preIcon,
  posIcon,
  icon,
  children,
  ...buttonProps
}) => {
  const isIconOnly = !!icon;

  if (isIconOnly) {
    if (children) {
      throw new Error('Icon-only buttons cannot have children');
    }
    if (preIcon) {
      throw new Error('Icon-only buttons cannot have preIcon');
    }
    if (posIcon) {
      throw new Error('Icon-only buttons cannot have posIcon');
    }
  }

  const buttonClasses = [
    'eidos-button',
    `eidos-button--${variant}`,
    `eidos-button--${color}`,
    `eidos-button--${size}`,
    isIconOnly && 'eidos-button--icon-only',
    disabled && 'eidos-button--disabled',
    loading && 'eidos-button--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const buttonContent = (
    <button type="button" {...buttonProps} className={buttonClasses} disabled={disabled || loading}>
      {loading ? (
        <>
          {!isIconOnly && (
            <>
              <span className="eidos-button--loading-spinner">
                <LoaderCircle className="eidos-button--spinner-icon" />
              </span>
              <span className="eidos-button--copy">{loadingText}</span>
            </>
          )}
          {isIconOnly && (
            <span className="eidos-button--loading-spinner">
              <LoaderCircle className="eidos-button--spinner-icon" />
            </span>
          )}
        </>
      ) : (
        <>
          {preIcon && renderIcon(preIcon, 'eidos-button--pre-icon')}

          {isIconOnly && icon ? (
            renderIcon(icon, 'eidos-button--icon')
          ) : (
            <span className="eidos-button--copy">{children}</span>
          )}

          {posIcon && renderIcon(posIcon, 'eidos-button--pos-icon')}
        </>
      )}
    </button>
  );

  return tooltip ? <Tooltip message={tooltip}>{buttonContent}</Tooltip> : buttonContent;
};

/**
 * IconButton - Convenience wrapper for icon-only buttons
 *
 * @example
 * ```tsx
 * import { IconButton } from '@pmealha/eidos-ui';
 * import { Plus } from 'lucide-react';
 *
 * <IconButton icon={Plus} tooltip="Add item" />
 * ```
 */
export const IconButton: React.FC<IconButtonProps> = (props) => {
  return <Button {...props} />;
};
