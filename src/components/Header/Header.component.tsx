import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { HeaderActionProps, HeaderProps } from './Header.types';
import './Header.scss';
import { Button } from '../Button';
import { Popover } from '../Popover';
import { renderIcon } from '../../utils';
import { Ellipsis } from 'lucide-react';

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  media,
  meta,
  variant = 'default',
  titleAs: TitleElement = 'h1',
  actions,
  collapseActionsBelow = 640,
  actionsVisibleWhenCollapsed = 1,
  className = '',
}) => {
  const classes = ['eidos-header', `eidos-header--${variant}`, className].filter(Boolean).join(' ');

  const rootRef = useRef<HTMLDivElement>(null);
  const [isNarrow, setIsNarrow] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);

  // Measures the header's own box rather than the viewport, so the collapse
  // point matches the container queries in Header.scss - a viewport query
  // would disagree with them by the width of PageLayout's navigation rail,
  // which is itself collapsible. The 1px hero border makes this border-box
  // reading differ from the container query's content-box one by 2px; that is
  // far below any threshold worth caring about, and using one measurement for
  // both the initial pass and the observer keeps it to a single code path.
  const measure = useCallback(() => {
    const element = rootRef.current;
    if (!element) return;
    setIsNarrow(element.getBoundingClientRect().width <= collapseActionsBelow);
  }, [collapseActionsBelow]);

  // `useLayoutEffect` for the first measurement specifically: ResizeObserver
  // delivers its initial callback asynchronously, so relying on it alone
  // would paint the full action row for a frame before collapsing it. Reading
  // the box synchronously here collapses before paint instead. Nothing runs
  // during SSR, so the server renders the uncollapsed row and hydration
  // matches - the same client-only posture Navigation's `collapseBelow` has.
  useLayoutEffect(() => {
    if (!collapseActionsBelow) {
      setIsNarrow(false);
      return;
    }

    measure();

    const element = rootRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [collapseActionsBelow, measure]);

  const allActions = actions ?? [];
  const keptCount = Math.max(0, actionsVisibleWhenCollapsed);
  const isCollapsed = isNarrow && !!collapseActionsBelow && allActions.length > keptCount;

  // The *last* actions stay inline: a primary call to action is conventionally
  // rightmost, which is also how Header's own stories order them.
  const overflowActions = isCollapsed ? allActions.slice(0, allActions.length - keptCount) : [];
  const inlineActions = isCollapsed ? allActions.slice(allActions.length - keptCount) : allActions;

  // A portalled popover would otherwise stay on screen after the header grows
  // back past the threshold and its trigger stops being rendered.
  useEffect(() => {
    if (!isCollapsed && overflowOpen) setOverflowOpen(false);
  }, [isCollapsed, overflowOpen]);

  const renderOverflowAction = (action: HeaderActionProps, index: number) => {
    // Typed on `HTMLElement` so it satisfies both the button and the link
    // form's handler; the action's own handler is one or the other, and is
    // only ever called with the element it was attached to.
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      (action.onClick as React.MouseEventHandler<HTMLElement> | undefined)?.(event);
      setOverflowOpen(false);
    };

    // An icon-only action has no visible label, which is fine in a horizontal
    // row of small buttons and useless in a vertical list. Its tooltip is
    // already the label, so promote it rather than showing a bare glyph.
    if (action.icon && !action.children && action.tooltip) {
      const { icon, tooltip, ...rest } = action;
      return (
        <Button key={index} {...rest} size="md" preIcon={icon} onClick={handleClick}>
          {tooltip}
        </Button>
      );
    }

    return <Button key={index} {...action} size="md" onClick={handleClick} />;
  };

  const titles = (
    <div className="eidos-header__titles">
      <TitleElement className="eidos-header__title">{title}</TitleElement>
      {subtitle && <span className="eidos-header__subtitle">{subtitle}</span>}
      {!!meta?.length && (
        <div className="eidos-header__meta">
          {meta.map((item, index) => (
            <span key={index} className="eidos-header__meta-item">
              {item.icon && renderIcon(item.icon, 'eidos-header__meta-icon')}
              {item.label && <span className="eidos-header__meta-label">{item.label}</span>}
              <span className="eidos-header__meta-value">{item.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={classes} ref={rootRef}>
      <div className="eidos-header__content">
        {/* The `__lead` wrapper only exists when there is media to group with
            the titles. Media and titles need a tighter gap than titles and
            actions do, and a flex container has a single gap - but rendering
            the wrapper unconditionally would change the markup for every
            existing consumer, and the `eidos-*` class names are documented as
            targetable. */}
        {media ? (
          <div className="eidos-header__lead">
            <div className="eidos-header__media">{media}</div>
            {titles}
          </div>
        ) : (
          titles
        )}
        <div className="eidos-header__actions">
          {overflowActions.length > 0 && (
            <Popover
              open={overflowOpen}
              onOpenChange={setOverflowOpen}
              placement="bottom"
              maxWidth={260}
              // Popover puts `className` on its trigger wrapper, which is the
              // element that actually becomes a flex item of `__actions`.
              className="eidos-header__overflow-trigger"
              trigger={
                // No `aria-haspopup`/`aria-expanded` here: Popover already
                // sets both on the wrapper it renders around this button.
                <Button
                  icon={Ellipsis}
                  size="md"
                  variant="outlined"
                  color="secondary"
                  aria-label={`${overflowActions.length} more actions`}
                />
              }
            >
              <div className="eidos-header__overflow-actions">
                {overflowActions.map(renderOverflowAction)}
              </div>
            </Popover>
          )}
          {inlineActions.map((action, index) => (
            <Button key={index} size="md" {...action} />
          ))}
        </div>
      </div>
    </div>
  );
};
