import React from 'react';
import type { TimelineProps } from './Timeline.types';

// Title and description are `div`s, not `span` and `p`. Both are documented
// as `ReactNode`, and the obvious content for an Experience or Education
// entry - a bullet list, a row of chips - is block-level: inside a `<p>` it is
// invalid HTML (React reports it as a hydration error, and the browser's
// parser closes the paragraph early), which pushed consumers to rebuild the
// component out of Cards.
//
// The list used to carry a hardcoded `aria-label="Timeline"`, which named
// every instance the same thing and overrode whatever heading introduced it.
// The name is now the consumer's to give, or to omit.
export const Timeline: React.FC<TimelineProps> = ({
  items,
  ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  className = '',
}) => (
  <ol
    className={['eidos-timeline', className].filter(Boolean).join(' ')}
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledBy}
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
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {/* Left: dot + connector */}
          <div className="eidos-timeline-track" aria-hidden="true">
            <div className="eidos-timeline-dot">
              {item.icon && <span className="eidos-timeline-dot-icon">{item.icon}</span>}
            </div>
            {!isLast && <div className="eidos-timeline-connector" />}
          </div>

          {/* Right: content */}
          <div className="eidos-timeline-content">
            {item.timestamp && <span className="eidos-timeline-timestamp">{item.timestamp}</span>}
            <div className="eidos-timeline-title">{item.title}</div>
            {item.description && (
              <div className="eidos-timeline-description">{item.description}</div>
            )}
          </div>
        </li>
      );
    })}
  </ol>
);

Timeline.displayName = 'Timeline';
