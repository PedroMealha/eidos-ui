import { ToolbarProps } from '../Toolbar/Toolbar.types';
import { HeaderProps } from '../Header/Header.types';

export interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Main page content, rendered below the header inside the scrollable content area. */
  children: React.ReactNode;
  /** Configures the top-level `Toolbar` (brand, avatar, actions). Omit to render `Toolbar` with its defaults. */
  toolbar?: ToolbarProps;
  /** Configures the `Header` (title, subtitle, breadcrumbs, actions) rendered above the page content. Omit to render the layout without a header. */
  header?: HeaderProps;
}
