import type { IconType } from '../../utils';
import type {
  TextButtonProps,
  IconButtonProps,
  TextLinkButtonProps,
  IconLinkButtonProps,
} from '../Button';

/**
 * `hero` raises the header's prominence with a larger title - the
 * account/profile landing-area treatment. `default` is the standard page
 * header.
 *
 * Neither paints a surface: no background, border or padding. The header is
 * normally rendered inside an already-padded region (`PageLayout` pads its
 * header area), so a second inset here would misalign it against the rest of
 * the page. Wrap the header in a `Card` if a surface is wanted.
 */
export type HeaderVariant = 'default' | 'hero';

/**
 * The element the title renders as. Restricted to headings, rather than any
 * element type, because the title is the header's heading by definition.
 */
export type HeaderTitleLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

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
   * Deliberately any node rather than an `Avatar` config, so it can equally
   * hold a logo or an icon block. A hero header usually wants an `Avatar` at
   * `xl` or `2xl`.
   */
  media?: React.ReactNode;
  /**
   * Supporting facts rendered below the subtitle - role, plan, joined date.
   * The row wraps one whole item at a time rather than splitting a fact
   * across lines.
   */
  meta?: HeaderMetaItem[];
  /**
   * Heading level of the title. Keep `h1` for a page header; use a lower
   * level when the header introduces a section further down the page. Only
   * the element changes - the title looks the same at every level.
   *
   * @default 'h1'
   */
  titleAs?: HeaderTitleLevel;
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

type HeaderActionKeys =
  | 'variant'
  | 'color'
  | 'loading'
  | 'disabled'
  | 'preIcon'
  | 'posIcon'
  | 'icon'
  | 'children'
  | 'onClick'
  | 'tooltip';

type HeaderLinkActionKeys = HeaderActionKeys | 'href' | 'target' | 'rel';

/**
 * Restricted, discriminated subset of ButtonProps for Header actions. Pass
 * `href` to render the action as a link.
 */
export type HeaderActionProps =
  | Pick<TextButtonProps, HeaderActionKeys>
  | Pick<IconButtonProps, HeaderActionKeys>
  | Pick<TextLinkButtonProps, HeaderLinkActionKeys>
  | Pick<IconLinkButtonProps, HeaderLinkActionKeys>;
