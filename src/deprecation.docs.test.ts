import { describe, expect, it } from 'vitest';
import { deprecationMessage, isDeprecatedEntry } from './deprecation.docs';

/**
 * No component is deprecated yet, so nothing in Storybook exercises the badge
 * or the banner. These pin the two decisions they make until something does.
 */

describe('isDeprecatedEntry', () => {
  it('badges a component tagged deprecated', () => {
    expect(isDeprecatedEntry({ type: 'component', tags: ['dev', 'deprecated'] })).toBe(true);
  });

  it('does not badge the stories and docs that inherit the tag', () => {
    expect(isDeprecatedEntry({ type: 'story', tags: ['deprecated'] })).toBe(false);
    expect(isDeprecatedEntry({ type: 'docs', tags: ['deprecated'] })).toBe(false);
  });

  it('ignores untagged and tagless entries', () => {
    expect(isDeprecatedEntry({ type: 'component', tags: ['dev'] })).toBe(false);
    expect(isDeprecatedEntry({ type: 'component' })).toBe(false);
  });
});

describe('deprecationMessage', () => {
  it('includes every field that is set, in reading order', () => {
    expect(
      deprecationMessage({
        since: '3.8.0',
        removeIn: '4.0.0',
        reason: 'It duplicated Select.',
        use: 'Select',
      }),
    ).toBe(
      'Deprecated since 3.8.0 and removed in 4.0.0. It duplicated Select. Use Select instead.',
    );
  });

  it('omits what is not decided yet', () => {
    expect(deprecationMessage({ since: '3.8.0' })).toBe('Deprecated since 3.8.0.');
  });
});
