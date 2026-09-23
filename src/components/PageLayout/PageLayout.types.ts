import { ToolbarProps } from '../Toolbar/Toolbar.types';
import { HeaderProps } from '../Header/Header.types';
import { FooterProps } from '../Footer/Footer.types';
import { NavigationProps } from '../Navigation/Navigation.types';

export interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Main page content, rendered below the header inside the scrollable content area. */
  children: React.ReactNode;
  /** Configures the top-level `Toolbar` (brand, avatar, actions). Omit to render `Toolbar` with its defaults. */
  toolbar?: ToolbarProps;
  /** Configures the sidebar `Navigation` rail (brand, items, footer). Omit to render the reserved region empty. */
  navigation?: NavigationProps;
  /** Configures the `Header` (title, subtitle, breadcrumbs, actions) rendered above the page content. Omit to render the layout without a header. */
  header?: HeaderProps;
  /** Configures the `Footer` rendered below the page content. Omit to render the default Eidos UI copyright notice. */
  footer?: FooterProps;
  /**
   * Ref to the `main` content region - the layout's only scroll container.
   *
   * Use it to drive that region imperatively, most commonly to scroll back to
   * the top on navigation (`contentRef.current?.scrollTo({ top: 0 })`). Any
   * ref passed through `HTMLAttributes` reaches the outer element instead,
   * which never scrolls.
   */
  contentRef?: React.Ref<HTMLElement>;
  /**
   * Identifies the current page, so the content region's scroll offset is
   * remembered per page and applied when this value changes. A page seen
   * before reopens where it was left; a new one starts at the top.
   *
   * Pass the value that defines a navigation in your app - `location.pathname`
   * for one offset per path, or a per-history-entry id to match the browser,
   * where Back restores but a fresh link to the same URL starts at the top.
   * Keep it unchanged across a transition that should not move the scroll
   * position, such as a filter written to the query string.
   *
   * Omit it to leave the scroll position alone entirely.
   */
  scrollRestorationKey?: string | number;
}
