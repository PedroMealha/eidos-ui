import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { TooltipProps, TooltipState } from './Tooltip.types';
import { FOCUSABLE_SELECTOR } from '../../utils';

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  message,
  component: Component,
  componentProps,
  placement: preferredPlacement = 'top',
  delay = 100,
  disabled = false,
  className = '',
  triggerType = 'hover',
  closeOnClickOutside = true,
  closeOnEscape = true,
}) => {
  const [tooltipState, setTooltipState] = useState<TooltipState>({
    isVisible: false,
    position: { top: 0, left: 0, placement: 'top' },
    isPositioned: false,
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const isScrollingRef = useRef(false);

  const calculateOptimalPosition = useCallback(
    (triggerRect: DOMRect, tooltipRect: DOMRect) => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gap = 8;

      let placement: 'top' | 'bottom' | 'left' | 'right' = preferredPlacement;
      let top = 0;
      let left = 0;

      switch (preferredPlacement) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - gap;
          left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + gap;
          left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          break;
        case 'left':
          top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          left = triggerRect.left - tooltipRect.width - gap;
          break;
        case 'right':
          top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          left = triggerRect.right + gap;
          break;
      }

      if (placement === 'top' && top < gap) {
        placement = 'bottom';
        top = triggerRect.bottom + gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      } else if (placement === 'bottom' && top + tooltipRect.height > viewportHeight - gap) {
        placement = 'top';
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      } else if (placement === 'left' && left < gap) {
        placement = 'right';
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + gap;
      } else if (placement === 'right' && left + tooltipRect.width > viewportWidth - gap) {
        placement = 'left';
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left - tooltipRect.width - gap;
      }

      top = Math.max(gap, Math.min(top, viewportHeight - tooltipRect.height - gap));
      left = Math.max(gap, Math.min(left, viewportWidth - tooltipRect.width - gap));

      return { top, left, placement };
    },
    [preferredPlacement],
  );

  const handleScroll = useCallback(() => {
    if (!tooltipState.isVisible || !tooltipState.isPositioned || isScrollingRef.current) return;

    isScrollingRef.current = true;

    animationFrameRef.current = requestAnimationFrame(() => {
      if (triggerRef.current && tooltipRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();

        const { top, left, placement } = calculateOptimalPosition(triggerRect, tooltipRect);

        setTooltipState((prev) => ({
          ...prev,
          position: { top, left, placement },
        }));
      }

      isScrollingRef.current = false;
    });
  }, [tooltipState.isVisible, tooltipState.isPositioned, calculateOptimalPosition]);

  const handleMouseEnter = useCallback(() => {
    if (disabled || triggerType !== 'hover') return;

    timeoutRef.current = setTimeout(() => {
      setTooltipState((prev) => ({
        ...prev,
        isVisible: true,
        isPositioned: false,
      }));
    }, delay);
  }, [disabled, delay, triggerType]);

  const handleMouseLeave = useCallback(() => {
    if (triggerType !== 'hover') return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setTooltipState((prev) => ({
      ...prev,
      isVisible: false,
      isPositioned: false,
    }));
  }, [triggerType]);

  const handleClick = useCallback(() => {
    if (disabled || triggerType !== 'click') return;

    if (tooltipState.isVisible) {
      setTooltipState((prev) => ({
        ...prev,
        isVisible: false,
        isPositioned: false,
      }));
    } else {
      if (delay > 0) {
        timeoutRef.current = setTimeout(() => {
          setTooltipState((prev) => ({
            ...prev,
            isVisible: true,
            isPositioned: false,
          }));
        }, delay);
      } else {
        setTooltipState((prev) => ({
          ...prev,
          isVisible: true,
          isPositioned: false,
        }));
      }
    }
  }, [disabled, triggerType, tooltipState.isVisible, delay]);

  const handleFocus = useCallback(() => {
    if (disabled || triggerType !== 'focus') return;

    timeoutRef.current = setTimeout(() => {
      setTooltipState((prev) => ({
        ...prev,
        isVisible: true,
        isPositioned: false,
      }));
    }, delay);
  }, [disabled, triggerType, delay]);

  const handleBlur = useCallback(() => {
    if (triggerType !== 'focus') return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setTooltipState((prev) => ({
      ...prev,
      isVisible: false,
      isPositioned: false,
    }));
  }, [triggerType]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (!closeOnClickOutside || !tooltipState.isVisible || triggerType !== 'click') return;

      const target = event.target as Node;

      if (tooltipRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }

      setTooltipState((prev) => ({
        ...prev,
        isVisible: false,
        isPositioned: false,
      }));
    },
    [closeOnClickOutside, tooltipState.isVisible, triggerType],
  );

  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (
        closeOnEscape &&
        event.key === 'Escape' &&
        tooltipState.isVisible &&
        triggerType === 'click'
      ) {
        setTooltipState((prev) => ({
          ...prev,
          isVisible: false,
          isPositioned: false,
        }));
      }
    },
    [closeOnEscape, tooltipState.isVisible, triggerType],
  );

  useEffect(() => {
    if (
      tooltipState.isVisible &&
      !tooltipState.isPositioned &&
      tooltipRef.current &&
      triggerRef.current
    ) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      const { top, left, placement } = calculateOptimalPosition(triggerRect, tooltipRect);

      setTooltipState((prev) => ({
        ...prev,
        position: { top, left, placement },
        isPositioned: true,
      }));
    }
  }, [tooltipState.isVisible, tooltipState.isPositioned, calculateOptimalPosition]);

  useEffect(() => {
    const handleResize = () => {
      if (
        tooltipState.isVisible &&
        tooltipState.isPositioned &&
        tooltipRef.current &&
        triggerRef.current
      ) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();

        const { top, left, placement } = calculateOptimalPosition(triggerRect, tooltipRect);

        setTooltipState((prev) => ({
          ...prev,
          position: { top, left, placement },
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tooltipState.isVisible, tooltipState.isPositioned, calculateOptimalPosition]);

  useEffect(() => {
    if (tooltipState.isVisible) {
      window.addEventListener('scroll', handleScroll, { passive: true });

      document.body.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.removeEventListener('scroll', handleScroll);
    };
  }, [tooltipState.isVisible, handleScroll]);

  useEffect(() => {
    if (tooltipState.isVisible && triggerType === 'click') {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [tooltipState.isVisible, triggerType, handleClickOutside, handleEscapeKey]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const renderTooltipContent = () => {
    if (message) {
      return <span className="eidos-tooltip-message">{message}</span>;
    }
    if (Component) {
      return <Component {...(componentProps || {})} />;
    }
    return null;
  };

  // Whether the trigger wrapper has to become focusable itself, i.e. whether
  // the consumer's child is not already a control. Measured from the DOM
  // rather than guessed from the node type, because `children` is an
  // arbitrary `ReactNode` and the control may be nested inside it.
  const [triggerNeedsFocus, setTriggerNeedsFocus] = useState(false);

  useEffect(() => {
    const el = triggerRef.current;
    setTriggerNeedsFocus(!!el && el.querySelector(FOCUSABLE_SELECTOR) === null);
  }, [children, triggerType]);

  const getTriggerProps = () => {
    const props: Record<string, unknown> = {
      ref: triggerRef,
      className: 'eidos-tooltip-trigger',
    };

    switch (triggerType) {
      case 'hover':
        props.onMouseEnter = handleMouseEnter;
        props.onMouseLeave = handleMouseLeave;
        break;
      case 'click':
        props.onClick = handleClick;
        // Only when the trigger has no control of its own. Making this
        // wrapper a button unconditionally put a button inside a button
        // whenever the child was one - which is the common case, since
        // `Button` wraps *itself* in a Tooltip when given `tooltip`. That is
        // invalid (`nested-interactive`) and gives one action two tab stops.
        if (triggerNeedsFocus) {
          props.role = 'button';
          props.tabIndex = 0;
          props.onKeyDown = (event: React.KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleClick();
            }
          };
        }
        break;
      case 'focus':
        props.onFocus = handleFocus;
        props.onBlur = handleBlur;
        // Same reasoning: a focusable child already receives the focus that
        // opens the tooltip, and adding `tabIndex` here would just add a
        // second stop in front of it.
        if (triggerNeedsFocus) props.tabIndex = 0;
        break;
    }

    return props;
  };

  return (
    <>
      <div {...getTriggerProps()}>{children}</div>
      {tooltipState.isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`eidos-tooltip eidos-tooltip--${tooltipState.position.placement} ${className}`}
            style={{
              top: tooltipState.position.top,
              left: tooltipState.position.left,
            }}
            data-state={tooltipState.isPositioned ? 'entered' : 'entering'}
            role="tooltip"
          >
            {renderTooltipContent()}
          </div>,
          document.body,
        )}
    </>
  );
};

Tooltip.displayName = 'Tooltip';
