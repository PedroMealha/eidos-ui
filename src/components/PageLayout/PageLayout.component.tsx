import React from 'react';
import type { PageLayoutProps } from './PageLayout.types';
import './PageLayout.scss';
import { Toolbar } from '../Toolbar';
import { Header } from '../Header';
import { Footer } from '../Footer';
import type { FooterProps } from '../Footer';
import { Navigation } from '../Navigation';

const defaultFooter: FooterProps = { copyright: `© ${new Date().getFullYear()} Eidos UI` };

export const PageLayout: React.FC<PageLayoutProps> = ({
  toolbar,
  navigation,
  header,
  footer,
  children,
  className = '',
  ...rest
}) => {
  const classes = ['eidos-pagelayout', className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      <Toolbar
        breadcrumbs={toolbar?.breadcrumbs || { items: [], separator: <></> }}
        cmdPaletteItems={toolbar?.cmdPaletteItems || []}
        actions={toolbar?.actions || []}
        userMenu={toolbar?.userMenu || []}
        className="eidos-pagelayout__toolbar"
      />
      <div className="eidos-pagelayout__navigation">
        {navigation && <Navigation {...navigation} />}
      </div>
      <main className="eidos-pagelayout__content">
        {header && (
          <Header
            {...header}
            className={['eidos-pagelayout__header', header.className].filter(Boolean).join(' ')}
          />
        )}
        <div className="eidos-pagelayout__body">{children}</div>
        <Footer
          {...(footer ?? defaultFooter)}
          className={['eidos-pagelayout__footer', footer?.className].filter(Boolean).join(' ')}
        />
      </main>
    </div>
  );
};
