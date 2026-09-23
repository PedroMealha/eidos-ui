import React from 'react';
import type { PageLayoutProps } from './PageLayout.types';
import './PageLayout.scss';
import { Toolbar } from '../Toolbar';
import { Header } from '../Header';
import { Footer } from '../Footer';
import type { FooterProps } from '../Footer';
import { Navigation } from '../Navigation';
import { useScrollRestoration } from './useScrollRestoration';

const defaultFooter: FooterProps = { copyright: `© ${new Date().getFullYear()} Eidos UI` };

export const PageLayout: React.FC<PageLayoutProps> = ({
  toolbar,
  navigation,
  header,
  footer,
  children,
  className = '',
  // Destructured so they cannot fall into `...rest` and land on the root
  // element, which is not the scroll container.
  contentRef,
  scrollRestorationKey,
  ...rest
}) => {
  const classes = ['eidos-pagelayout', className].filter(Boolean).join(' ');
  const setContentRef = useScrollRestoration(scrollRestorationKey, contentRef);

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
      {/* A scrollable region containing nothing focusable cannot be scrolled
          by keyboard at all, and a page body is often pure content - a
          report, an article. `tabIndex={0}` makes the region itself focusable
          so arrow keys and Page Up/Down reach it (SC 2.1.1), matching
          `VirtualList` and `Chat`. */}
      <main ref={setContentRef} tabIndex={0} className="eidos-pagelayout__content">
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
