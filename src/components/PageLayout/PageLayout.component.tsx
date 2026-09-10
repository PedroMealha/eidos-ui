import React from 'react';
import type { PageLayoutProps } from './PageLayout.types';
import './PageLayout.scss';
import { Toolbar } from '../Toolbar';
import { Header } from '../Header';

export const PageLayout: React.FC<PageLayoutProps> = ({ toolbar, header, children, ...rest }) => {
  return (
    <div className="eidos-pagelayout" {...rest}>
      <Toolbar
        avatar={toolbar?.avatar}
        brandName={toolbar?.brandName || 'Eidos UI'}
        actions={toolbar?.actions}
        className="eidos-pagelayout__toolbar"
      />
      <div className="eidos-pagelayout__navigation">
        <div></div>
      </div>
      <div className="eidos-pagelayout__content">
        {header && <Header className="eidos-pagelayout__header" {...header} />}
        <div className="eidos-pagelayout__body">{children}</div>
        <div className="eidos-pagelayout__footer">&copy; {new Date().getFullYear()} Eidos UI</div>
      </div>
    </div>
  );
};
