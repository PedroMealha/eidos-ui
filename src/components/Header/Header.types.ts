import type { IconType } from '../../utils';
import { TextButtonProps, IconButtonProps } from '../Button';

/**
 * `hero` renders the header on its own padded, bordered surface with a larger
 * title - the account/profile landing-area treatment. `default` is the bare
 * header that sits directly on the page.
 */
export type HeaderVariant = 'default' | 'hero';

/** A single supporting fact in the header's `meta` row. */
export interface HeaderMetaItem {
  /** Leading label for the fact - "Role", "Joined". Omit for a bare value. */
  label?: React.ReactNode;
  /** The fact itself. */
  value: React.ReactNode;
  /** Leading icon, resolved like every other icon prop in the library. */
  icon?: IconType;
}

export interface HeaderProps {
  /**
   * Page or section title. Accepts inline nodes alongside the text - a
   * status `Pill`/`Chip` beside the title is the common case - not just a
   * string. Keep the children inline-level; the title is a heading.
   */
  title: React.ReactNode;
  /** Supporting text rendered below the title. */
  subtitle?: React.ReactNode;
  /**
   * Leading media - an `Avatar`, a logo, an icon block - rendered before the
   * title/subtitle stack and omitted entirely when not passed.
   *
   * Deliberately any node rather than an `Avatar` config: it is also the
   * escape hatch for identity media larger than `Avatar`'s own `lg` size
   * (48px), which a hero header usually wants.
   */
  media?: React.ReactNode;
  /**
   * Supporting facts rendered below the subtitle - role, plan, joined date.
   * The row wraps one whole item at a time rather than splitting a fact
   * across lines.
   */
  meta?: HeaderMetaItem[];
  /** Surface treatment. @default 'default' */
  variant?: HeaderVariant;
  /** Trailing action buttons, rendered right-aligned. */
  actions?: HeaderActionProps[];
  /**
   * Header width, in px, at or below which actions past
   * `actionsVisibleWhenCollapsed` fold into an overflow popover.
   *
   * Measured against the header's **own** width rather than the viewport, so
   * it still behaves correctly next to `PageLayout`'s navigation rail or in
   * any other narrow column. Pass `0` to opt out and always render every
   * action inline.
   *
   * @default 640
   */
  collapseActionsBelow?: number;
  /**
   * How many actions stay outside the overflow popover once collapsed. The
   * **last** actions are the ones kept, since a primary call to action is
   * conventionally rightmost.
   *
   * @default 1
   */
  actionsVisibleWhenCollapsed?: number;
  className?: string;
}

/**
 * Restricted, discriminated subset of ButtonProps for Header actions.
 */
export type HeaderActionProps =
  | Pick<
      TextButtonProps,
      | 'variant'
      | 'color'
      | 'loading'
      | 'disabled'
      | 'preIcon'
      | 'posIcon'
      | 'icon'
      | 'children'
      | 'onClick'
      | 'tooltip'
    >
  | Pick<
      IconButtonProps,
      | 'variant'
      | 'color'
      | 'loading'
      | 'disabled'
      | 'preIcon'
      | 'posIcon'
      | 'icon'
      | 'children'
      | 'onClick'
      | 'tooltip'
    >;
