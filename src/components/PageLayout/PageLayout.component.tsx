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
      {/* Spread rather than forwarded field by field, so a prop added to
          `Toolbar` reaches `PageLayout` consumers without a second edit
          here - the previous per-field list silently dropped anything it
          didn't know about. `className` is merged last so the layout's own
          grid-area class can't be overwritten by the caller's. */}
      <Toolbar
        {...toolbar}
        className={['eidos-pagelayout__toolbar', toolbar?.className].filter(Boolean).join(' ')}
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
