import React from 'react';
import { X } from 'lucide-react';
import type { ChipProps } from './Chip.types';
import { Tooltip } from '../Tooltip/Tooltip.component';
import { renderIcon } from '../../utils';

export const Chip: React.FC<ChipProps> = ({
  variant = 'filled',
  color = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  tooltip,
  className = '',
  preIcon,
  posIcon,
  children,
  onClick,
  onRemove,
  ...chipProps
}) => {
  const isClickable = !!onClick;
  const isRemovable = !!onRemove;

  // Build CSS classes
  const chipClasses = [
    'eidos-chip',
    `eidos-chip--${variant}`,
    `eidos-chip--${color}`,
    `eidos-chip--${size}`,
    disabled && 'eidos-chip--disabled',
    isClickable && 'eidos-chip--clickable',
    isRemovable && 'eidos-chip--removable',
    fullWidth && 'eidos-chip--full-width',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (disabled || !onClick) return;
    onClick();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent chip click when removing
    if (disabled || !onRemove) return;
    onRemove();
  };

  // A chip that is both clickable and removable holds *two* controls, so it
  // has to render them as siblings.
  //
  // The previous shape switched the outer element to a `<div>` when
  // removable - the comment said "to avoid nested buttons" - and then gave
  // that div `role="button"` and `tabIndex={0}`. That is the same defect
  // wearing a different hat: a button containing a button, which is invalid
  // (`nested-interactive`) and leaves a screen reader announcing a control
  // inside a control. It is the same shape already fixed on `Dropdown` and
  // `DataGrid`'s rows.
  //
  // Now the outer element is a plain container whenever there is a remove
  // button, and the chip's own action moves to an inner `<button>` wrapping
  // just the content. Each control is separately reachable and separately
  // named.
  const hasBothControls = isClickable && isRemovable;
  const ChipElement = isClickable && !isRemovable ? 'button' : 'div';

  const body = (
    <>
      {preIcon && renderIcon(preIcon, 'eidos-chip--pre-icon')}

      <span className="eidos-chip--copy">{children}</span>

      {posIcon && renderIcon(posIcon, 'eidos-chip--pos-icon')}
    </>
  );

  const chipContent = (
    <ChipElement
      className={chipClasses}
      disabled={ChipElement === 'button' ? disabled : undefined}
      onClick={isClickable && !hasBothControls ? handleClick : undefined}
      {...chipProps}
    >
      {hasBothControls ? (
        <button
          type="button"
          className="eidos-chip--action"
          onClick={handleClick}
          disabled={disabled}
        >
          {body}
        </button>
      ) : (
        body
      )}

      {isRemovable && (
        <button
          className="eidos-chip--remove-button"
          onClick={handleRemove}
          disabled={disabled}
          aria-label="Remove"
          type="button"
        >
          <X className="eidos-chip--remove-icon" />
        </button>
      )}
    </ChipElement>
  );

  return tooltip ? <Tooltip message={tooltip}>{chipContent}</Tooltip> : chipContent;
};
