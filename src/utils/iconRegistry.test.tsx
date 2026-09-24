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

  it('prefers a registered icon over the Lucide name lookup', () => {
    // Registering a *different* component under a real Lucide name proves the
    // registry is consulted first.
    registerIcons({ Bell: Star });
    expect(typeOf(renderIcon('bell'))).toBe(Star);
  });

  it('still resolves an unregistered Lucide name, with a deprecation warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const node = renderIcon('anchor');
    expect(typeOf(node)).not.toBe('i');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('removed in 4.0'));
  });

  it('renders anything else as icon-font classes', () => {
    expect(typeOf(renderIcon('fas fa-heart'))).toBe('i');
  });
});
