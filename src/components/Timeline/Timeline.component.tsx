import React from 'react';
import type { TimelineProps } from './Timeline.types';

export const Timeline: React.FC<TimelineProps> = ({ items, className = '' }) => (
  <ol
    className={['eidos-timeline', className].filter(Boolean).join(' ')}
    aria-label="Timeline"
  >
    {items.map((item, index) => {
      const isLast = index === items.length - 1;
      const color = item.color ?? 'default';

      return (
        <li
          key={item.id}
          className={[
            'eidos-timeline-item',
            `eidos-timeline-item--${color}`,
            !isLast && 'eidos-timeline-item--has-connector',
          ].filter(Boolean).join(' ')}
        >
          {/* Left: dot + connector */}
          <div className="eidos-timeline-track" aria-hidden="true">
            <div className="eidos-timeline-dot">
              {item.icon && (
                <span className="eidos-timeline-dot-icon">{item.icon}</span>
              )}
            </div>
            {!isLast && <div className="eidos-timeline-connector" />}
          </div>

          {/* Right: content */}
          <div className="eidos-timeline-content">
            {item.timestamp && (
              <span className="eidos-timeline-timestamp">{item.timestamp}</span>
            )}
            <span className="eidos-timeline-title">{item.title}</span>
            {item.description && (
              <p className="eidos-timeline-description">{item.description}</p>
            )}
          </div>
        </li>
      );
    })}
  </ol>
);

Timeline.displayName = 'Timeline';
