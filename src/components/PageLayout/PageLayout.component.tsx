import React from 'react';
import type { PageLayoutProps } from './PageLayout.types';
import './PageLayout.scss';
import { Breadcrumb } from '../Breadcrumb';
import { Toolbar } from '../Toolbar';
import { Divider } from '../Divider';

export const PageLayout: React.FC<PageLayoutProps> = ({
  toolbar,
  title = 'Page Title',
  subtitle,
  breadcrumbs,
  noHeaderDivider = false,
  ...rest
}) => {

  return (
    <div className="eidos-pagelayout" {...rest}>
      <Toolbar
        avatar={toolbar?.avatar}
        brandName={toolbar?.brandName || 'Eidos UI'}
        actions={toolbar?.actions}
        className="eidos-pagelayout__toolbar"
      />
      <div className="eidos-pagelayout__navigation"></div>
      <div className="eidos-pagelayout__content">
        <div className="eidos-pagelayout__header">
          {breadcrumbs && <Breadcrumb {...breadcrumbs} />}
          <h3 className="eidos-pagelayout__title">{title}</h3>
          {subtitle && <span className="eidos-pagelayout__subtitle">{subtitle}</span>}
          {!noHeaderDivider && <Divider />}
        </div>
        <div className="eidos-pagelayout__body">Content</div>
        <div className="eidos-pagelayout__footer">Footer</div>
      </div>
    </div>
  );
};
