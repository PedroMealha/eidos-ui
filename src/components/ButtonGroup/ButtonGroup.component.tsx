import React from 'react';
import type { ButtonGroupProps } from './ButtonGroup.types';

/**
 * ButtonGroup - wraps adjacent Button components into a single visual unit.
 *
 * - Collapses inner border-radii so only the two outer ends are rounded.
 * - Collapses the shared border between adjacent outlined buttons into one line.
 * - Optionally propagates `size`, `variant`, and `color` down to children that
 *   don't already specify those props (each child can still override individually).
 *
 * @example
 * ```tsx
 * <ButtonGroup variant="outlined" color="primary">
 *   <Button>Left</Button>
 *   <Button>Center</Button>
 *   <Button>Right</Button>
 * </ButtonGroup>
 * ```
 */
export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  size,
  variant,
  color,
  orientation = 'horizontal',
  className = '',
}) => {
  const clampedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    // Child's own explicitly-set props win; group-level props are fallbacks.
    const childProps = child.props as Record<string, unknown>;
    return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
      ...(size !== undefined && childProps.size === undefined && { size }),
      ...(variant !== undefined && childProps.variant === undefined && { variant }),
      ...(color !== undefined && childProps.color === undefined && { color }),
    });
  });

  const classes = ['eidos-button-group', `eidos-button-group--${orientation}`, className]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{clampedChildren}</div>;
};
