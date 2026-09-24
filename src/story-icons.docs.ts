import {
  ArrowBigDownDash,
  ArrowRight,
  Check,
  Download,
  MousePointerClick,
  Plus,
  Star,
  Tag,
} from 'lucide-react';
import type { ArgTypes } from '@storybook/react-vite';

/**
 * Icons offered by the Controls panel for icon props.
 *
 * Icon props take a component, which a Controls text field cannot hold - it
 * would render `[object Object]` and ignore edits. A `select` with `mapping`
 * is Storybook's mechanism for exactly this: the panel shows the names, and
 * the story receives the component. Stories set these args by *name* too
 * (`posIcon: 'MousePointerClick'`), which Storybook maps the same way.
 *
 * `.docs.ts` so `release-needed.js` and `check-changelog.js` ignore it, like
 * `story-layout.docs.tsx`.
 */
const STORY_ICONS = {
  ArrowBigDownDash,
  ArrowRight,
  Check,
  Download,
  MousePointerClick,
  Plus,
  Star,
  Tag,
};

export type StoryIconName = keyof typeof STORY_ICONS;

/** An argType for an icon prop: a select of `STORY_ICONS`, mapped to components. */
export const iconArgType = (description: string): ArgTypes[string] => ({
  control: 'select',
  options: [undefined, ...Object.keys(STORY_ICONS)],
  mapping: STORY_ICONS,
  description,
  table: {
    type: { summary: 'React.ComponentType | string' },
    category: 'Icons',
    defaultValue: { summary: 'undefined' },
  },
});
