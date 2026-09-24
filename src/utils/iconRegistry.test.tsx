import { afterEach, describe, expect, it, vi } from 'vitest';
import { isValidElement } from 'react';
import type { ReactElement } from 'react';
import { Heart, Star } from 'lucide-react';
import { registerIcons, resolveRegisteredIcon, toIconKey } from './iconRegistry';
import { renderIcon } from './renderIcon';

/** The component a `renderIcon` result would mount, without mounting it. */
const typeOf = (node: unknown) => (isValidElement(node) ? (node as ReactElement).type : null);

describe('toIconKey', () => {
  it('normalises kebab-case, PascalCase and camelCase to one key', () => {
    expect(toIconKey('arrow-right')).toBe('ArrowRight');
    expect(toIconKey('ArrowRight')).toBe('ArrowRight');
    expect(toIconKey('arrowRight')).toBe('ArrowRight');
    expect(toIconKey('trash-2')).toBe('Trash2');
  });
});

describe('registerIcons', () => {
  it('resolves a registered icon by either spelling', () => {
    registerIcons({ Heart });
    expect(resolveRegisteredIcon('heart')).toBe(Heart);
    expect(resolveRegisteredIcon('Heart')).toBe(Heart);
  });

  it('accepts kebab-case keys', () => {
    registerIcons({ 'star-icon-test': Star });
    expect(resolveRegisteredIcon('StarIconTest')).toBe(Star);
  });

  // The registry lives on `globalThis` because tsup's CJS entries each carry
  // their own copy of this module. A second copy must see the same icons.
  it('is shared through a registered symbol, not module state', () => {
    registerIcons({ Heart });
    const scope = globalThis as unknown as Record<symbol, Map<string, unknown>>;
    expect(scope[Symbol.for('eidos-ui.icon-registry')].get('Heart')).toBe(Heart);
  });
});

describe('renderIcon', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders a registered icon by name', () => {
    registerIcons({ Bell: Star });
    expect(typeOf(renderIcon('bell'))).toBe(Star);
  });

  // The lookup against Lucide's full `icons` map is gone as of 4.0 - it is
  // what bundled every Lucide icon. A real Lucide name that nobody registered
  // must therefore *not* resolve to an SVG.
  it('does not resolve an unregistered Lucide name, and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(typeOf(renderIcon('anchor'))).toBe('i');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('registerIcons({ Anchor })'));
  });

  it('renders icon-font classes without warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(typeOf(renderIcon('fas fa-heart'))).toBe('i');
    expect(warn).not.toHaveBeenCalled();
  });
});
