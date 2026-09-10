import { ToolbarProps } from '../Toolbar/Toolbar.types';
import { HeaderProps } from '../Header/Header.types';

export interface PageLayoutProps {
  children: React.ReactNode;
  toolbar?: ToolbarProps;
  header?: HeaderProps;
}
