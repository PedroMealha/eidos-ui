import { BreadcrumbProps } from '../Breadcrumb';
import { ToolbarProps } from '../Toolbar/Toolbar.types';

export interface PageLayoutProps {
  title: string;
  subtitle?: string | React.ReactNode;
  noHeaderDivider?: boolean;
  toolbar?: ToolbarProps;
  breadcrumbs?: Pick<BreadcrumbProps, 'items' | 'separator'>;
}
