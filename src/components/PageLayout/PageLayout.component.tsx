import React from 'react';
import type { PageLayoutProps } from './PageLayout.types';
import './PageLayout.scss';
import { Toolbar } from '../Toolbar';
import { Header } from '../Header';

export const PageLayout: React.FC<PageLayoutProps> = ({
  toolbar,
  header,
  children,
  className = '',
  ...rest
}) => {
  const classes = ['eidos-pagelayout', className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      <Toolbar
        avatar={toolbar?.avatar}
        brandName={toolbar?.brandName || 'Eidos UI'}
        actions={toolbar?.actions}
        className="eidos-pagelayout__toolbar"
      />
      <div className="eidos-pagelayout__navigation">
        {/* Reserved for future sidebar navigation content - not yet configurable via props. */}
        <div></div>
      </div>
      <div className="eidos-pagelayout__content">
        {header && (
          <Header
            {...header}
            className={['eidos-pagelayout__header', header.className].filter(Boolean).join(' ')}
          />
        )}
        <div className="eidos-pagelayout__body">{children}</div>
        <div className="eidos-pagelayout__footer">&copy; {new Date().getFullYear()} Eidos UI</div>
      </div>
    </div>
  );
};
