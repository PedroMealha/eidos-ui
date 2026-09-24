import React from 'react';
import { Chip } from '../Chip/Chip.component';
import type { SplitChipProps } from './SplitChip.types';
import { resolveSegmentEdges } from './SplitChip.utils';

/**
 * SplitChip - one chip split into independent segments, each with its own
 * label, variant, colour and optional click handler.
 *
 * Every segment is a real `Chip`, the same way `SplitButton` is built from
 * `Button`, so variants, sizes, icons, tooltips, disabled styling and the
 * "hover only when clickable" rule cannot drift between the two. This
 * component only adds the join: collapsed inner borders, radii on the outer
 * ends, and optional dividers.
 *
 * @example
 * ```tsx
 * <SplitChip
 *   segments={[
 *     { id: 'label', label: 'Status', variant: 'outlined' },
 *     { id: 'value', label: 'Open', color: 'success', onClick: openFilter },
 *   ]}
 * />
 * ```
 */
export const SplitChip: React.FC<SplitChipProps> = ({
  segments,
  variant = 'filled',
  color = 'primary',
  size = 'md',
  disabled = false,
  showDividers = false,
  className = '',
  ...rest
}) => {
  const classes = [
    'eidos-split-chip',
    `eidos-split-chip--${size}`,
    showDividers && 'eidos-split-chip--dividers',
    disabled && 'eidos-split-chip--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const lastIndex = segments.length - 1;
  const resolved = segments.map((segment) => ({
    variant: segment.variant ?? variant,
    disabled: disabled || !!segment.disabled,
  }));
  const edges = resolveSegmentEdges(resolved, showDividers);

  return (
    <div className={classes} {...rest}>
      {segments.map((segment, index) => (
        <Chip
          key={segment.id}
          variant={resolved[index].variant}
          color={segment.color ?? color}
          size={size}
          disabled={resolved[index].disabled}
          onClick={segment.onClick}
          tooltip={segment.tooltip}
          preIcon={segment.preIcon}
          posIcon={segment.posIcon}
          // Position comes from the index, not `:first-child`/`:last-child`:
          // a segment with a `tooltip` is wrapped in the Tooltip's trigger
          // `div`, so the chip is no longer a direct child of this container
          // and structural pseudo-classes would round the wrong corners.
          className={[
            'eidos-split-chip__segment',
            index === 0 && 'eidos-split-chip__segment--first',
            index === lastIndex && 'eidos-split-chip__segment--last',
            edges[index].joinedStart && 'eidos-split-chip__segment--joined-start',
            edges[index].joinedEnd && 'eidos-split-chip__segment--joined-end',
            edges[index].divided && 'eidos-split-chip__segment--divided',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {segment.label}
        </Chip>
      ))}
    </div>
  );
};
