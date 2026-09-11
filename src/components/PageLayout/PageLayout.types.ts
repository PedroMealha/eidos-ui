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
}
