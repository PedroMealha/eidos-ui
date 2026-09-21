import { describe, expect, it } from 'vitest';
import { dualModifier, fullWidthModifier } from './dualModifier';

/**
 * These two emit the back-compat class aliases.
 *
 * Tiny functions, but the thing they protect is invisible from inside this
 * repo: `README.md` presents `eidos-*` class names as targetable, so a
 * consumer stylesheet somewhere matches the legacy camelCase spelling.
 * Nothing in lint, tsc or Storybook would notice if the legacy half stopped
 * being emitted - the library would look fine and a stranger's CSS would
 * quietly stop applying.
 */

describe('dualModifier', () => {
  it('emits the canonical spelling first, then the legacy alias', () => {
    expect(dualModifier('eidos-input', 'full-width', 'fullWidth')).toBe(
      'eidos-input--full-width eidos-input--fullWidth',
    );
  });

  it('emits both halves, separated by a single space', () => {
    const result = dualModifier('eidos-tabs', 'hide-scrollbar', 'hideScrollbar');
    const classes = result.split(' ');
    expect(classes).toHaveLength(2);
    expect(classes[0]).toBe('eidos-tabs--hide-scrollbar');
    expect(classes[1]).toBe('eidos-tabs--hideScrollbar');
  });
});

describe('fullWidthModifier', () => {
  it('is the full-width preset of dualModifier', () => {
    expect(fullWidthModifier('eidos-select')).toBe(
      dualModifier('eidos-select', 'full-width', 'fullWidth'),
    );
  });

  it('still emits the legacy --fullWidth alias', () => {
    // The specific alias eight components shipped before the convention was
    // unified. Dropping it is a breaking change, so it must not happen by
    // accident - only as a deliberate edit at the next major.
    expect(fullWidthModifier('eidos-input')).toContain('eidos-input--fullWidth');
  });
});
