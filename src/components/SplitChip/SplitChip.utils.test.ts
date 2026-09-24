import { describe, expect, it } from 'vitest';
import type { ChipVariantProps } from '../Chip/Chip.types';
import { resolveSegmentEdges } from './SplitChip.utils';

const seg = (variant: ChipVariantProps, disabled = false) => ({ variant, disabled });
const none = { joinedStart: false, joinedEnd: false, divided: false };

describe('resolveSegmentEdges', () => {
  it('leaves a single segment fully bordered', () => {
    expect(resolveSegmentEdges([seg('outlined')], true)).toEqual([none]);
  });

  it('joins a run of outlined segments seamlessly by default', () => {
    expect(resolveSegmentEdges([seg('outlined'), seg('outlined')], false)).toEqual([
      { ...none, joinedEnd: true },
      { ...none, joinedStart: true },
    ]);
  });

  it("uses the left outlined segment's own edge as the divider, never the neighbour's colour", () => {
    expect(resolveSegmentEdges([seg('outlined'), seg('outlined')], true)).toEqual([
      none,
      { ...none, joinedStart: true },
    ]);
    expect(resolveSegmentEdges([seg('outlined'), seg('text')], true)).toEqual([
      none,
      { ...none, joinedStart: true },
    ]);
  });

  it('keeps an outlined edge beside a segment with no visible border', () => {
    for (const other of ['filled', 'text'] as const) {
      expect(resolveSegmentEdges([seg('outlined'), seg(other)], false)).toEqual([
        none,
        { ...none, joinedStart: true },
      ]);
      expect(resolveSegmentEdges([seg(other), seg('outlined')], false)).toEqual([
        { ...none, joinedEnd: true },
        none,
      ]);
    }
  });

  it('never leaves the seam between an outlined and a disabled segment open', () => {
    const [plan, pro] = resolveSegmentEdges([seg('outlined'), seg('filled', true)], false);
    expect(plan.joinedEnd && pro.joinedStart).toBe(false);
  });

  it('joins a fully disabled chip into one grey outline', () => {
    expect(resolveSegmentEdges([seg('outlined', true), seg('filled', true)], false)).toEqual([
      { ...none, joinedEnd: true },
      { ...none, joinedStart: true },
    ]);
  });

  it('draws a divider only between segments without a visible border, when asked', () => {
    expect(resolveSegmentEdges([seg('filled'), seg('filled')], false)).toEqual([
      { ...none, joinedEnd: true },
      { ...none, joinedStart: true },
    ]);
    expect(resolveSegmentEdges([seg('filled'), seg('text')], true)).toEqual([
      { ...none, joinedEnd: true },
      { ...none, divided: true },
    ]);
  });
});
