export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Visual style of the card. `outlined` adds a border; `elevated` adds a drop shadow; `flat` is bare. */
  variant?: 'outlined' | 'elevated' | 'flat';
  /** Inner padding. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Render as a different element (e.g. `"article"`, `"section"`, `"li"`). Defaults to `"div"`. */
  as?: React.ElementType;
  /** Makes the card interactive — adds hover/focus styles and `cursor: pointer`. */
  clickable?: boolean;
  className?: string;
  children?: React.ReactNode;
}
