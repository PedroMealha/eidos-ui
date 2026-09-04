import React from 'react';
import type { BreadcrumbProps } from './Breadcrumb.types';

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  className = '',
}) => (
  <nav
    aria-label="Breadcrumb"
    className={['eidos-breadcrumb-nav', className].filter(Boolean).join(' ')}
  >
    <ol className="eidos-breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <li
            key={index}
            className={['eidos-breadcrumb-item', isLast && 'eidos-breadcrumb-item--current']
              .filter(Boolean)
              .join(' ')}
          >
            {isLast ? (
              <span aria-current="page" className="eidos-breadcrumb-current">
                {item.icon && <span className="eidos-breadcrumb-icon">{item.icon}</span>}
                {item.label}
              </span>
            ) : item.href ? (
              <a href={item.href} onClick={item.onClick} className="eidos-breadcrumb-link">
                {item.icon && <span className="eidos-breadcrumb-icon">{item.icon}</span>}
                {item.label}
              </a>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className="eidos-breadcrumb-link eidos-breadcrumb-link--button"
              >
                {item.icon && <span className="eidos-breadcrumb-icon">{item.icon}</span>}
                {item.label}
              </button>
            )}

            {!isLast && (
              <span aria-hidden="true" className="eidos-breadcrumb-separator">
                {separator}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

Breadcrumb.displayName = 'Breadcrumb';
