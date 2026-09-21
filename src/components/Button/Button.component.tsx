import React from 'react';
import { LoaderCircle } from 'lucide-react';
import { Tooltip } from '../Tooltip';
import { ButtonProps, IconButtonProps } from './Button.types';
import { renderIcon, devWarn } from '../../utils';

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

  // ── Accessible name for icon-only buttons ──────────────────────────────
  //
  // An icon-only button has no text, so without `aria-label` it is announced
  // as just "button". `tooltip` alone did NOT fix this: `Tooltip` renders a
  // floating panel and adds no naming attributes to its child, so the
  // library's own documented example - `<IconButton icon={Plus}
  // tooltip="Add item" />` - shipped a nameless control.
  //
  // Falling back to `tooltip` makes that documented pattern correct without
  // asking anyone to change their code: if you already described the button
  // for sighted users, that description now names it for everyone.
  //
  // Only ever a fallback - an explicit `aria-label` or `aria-labelledby`
  // always wins, since the caller may want a longer name than the tooltip.
  const suppliedLabel = buttonProps['aria-label'] ?? buttonProps['aria-labelledby'];
  const iconOnlyLabel = isIconOnly && !suppliedLabel ? tooltip : undefined;

  if (isIconOnly && !suppliedLabel && !tooltip) {
    devWarn(
      'button-icon-only-name',
      'Button: an icon-only button needs an accessible name. Pass `tooltip` (which now also names it) or `aria-label`, otherwise it is announced as just "button".',
    );
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
    <button
      type="button"
      {...buttonProps}
      aria-label={iconOnlyLabel ?? buttonProps['aria-label']}
      className={buttonClasses}
      disabled={disabled || loading}
    >
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
 * import { IconButton } from 'eidos-ui';
 * import { Plus } from 'lucide-react';
 *
 * <IconButton icon={Plus} tooltip="Add item" />
 * ```
 */
export const IconButton: React.FC<IconButtonProps> = (props) => {
  return <Button {...props} />;
};
