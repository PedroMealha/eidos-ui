import type { ChipVariantProps } from '../Chip/Chip.types';

export interface SeamSegment {
  variant: ChipVariantProps;
  disabled: boolean;
}

export interface SegmentEdges {
  /** Drop the leading (left) border. */
  joinedStart: boolean;
  /** Drop the trailing (right) border. */
  joinedEnd: boolean;
  /** Draw a divider as the leading border, in the segment's own colour. */
  divided: boolean;
}

/**
 * A segment "owns" a visible border when it is `outlined`, or when it is
 * disabled - the disabled Chip style paints a grey border on every variant.
 * `filled` and `text` borders are transparent.
 */
const hasVisibleBorder = (segment: SeamSegment) =>
  segment.variant === 'outlined' || segment.disabled;

/**
 * Decides, per seam, which of the two neighbouring edges survives.
 *
 * Each seam is resolved from **both** sides at once. The first version decided
 * each edge from one side only ("drop it if the neighbour is not `text`"),
 * which broke two ways: an `outlined` segment beside a disabled one dropped
 * its edge while the disabled segment dropped its own too, leaving the seam
 * open; and with dividers, an `outlined` segment gave up its own border to a
 * divider drawn in the *neighbour's* colour.
 *
 * The rules, for a seam between A (left) and B (right):
 *
 * - Both have visible borders: if they are the same kind (both enabled
 *   `outlined`, or both disabled), seamless by default - both edges drop, so
 *   the run reads as one outline. With dividers, or when the kinds differ,
 *   A's own edge is the seam and B's drops.
 * - Only one has a visible border: that edge is the seam; the other drops, so
 *   there is never a double line and never an open side.
 * - Neither has one: both drop; with dividers, B draws one in its own colour.
 */
export const resolveSegmentEdges = (
  segments: SeamSegment[],
  showDividers: boolean,
): SegmentEdges[] => {
  const edges = segments.map(() => ({ joinedStart: false, joinedEnd: false, divided: false }));

  for (let i = 0; i < segments.length - 1; i++) {
    const a = hasVisibleBorder(segments[i]);
    const b = hasVisibleBorder(segments[i + 1]);
    // Two borders only merge into one outline when they are the same kind:
    // both enabled `outlined`, or both disabled. An outlined segment beside a
    // disabled one would otherwise lose the seam against a near-white surface.
    const sameOutline = segments[i].disabled === segments[i + 1].disabled;

    if (a && b) {
      edges[i].joinedEnd = !showDividers && sameOutline;
      edges[i + 1].joinedStart = true;
    } else if (a) {
      edges[i + 1].joinedStart = true;
    } else if (b) {
      edges[i].joinedEnd = true;
    } else {
      edges[i].joinedEnd = true;
      edges[i + 1].joinedStart = !showDividers;
      edges[i + 1].divided = showDividers;
    }
  }

  return edges;
};
