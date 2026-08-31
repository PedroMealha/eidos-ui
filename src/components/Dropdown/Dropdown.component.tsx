import React, { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import type { DropdownProps, DropdownState } from "./Dropdown.types";
import { DropdownProvider } from "./Dropdown.context";
import { useDropdownContext } from "./Dropdown.hooks";

const DropdownInternal: React.FC<DropdownProps> = ({
  trigger,
  content,
  placement: preferredPlacement = "bottom",
  align = "start",
  delay = 0,
  disabled = false,
  defaultOpen = false,
  triggerClassName = "",
  contentClassName = "",
  closeOnClickOutside = true,
  closeOnEscape = true,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  autoWidth = true,
  triggerRef: externalTriggerRef,
  isNested = false,
  dropdownLevel,
  dropdownGroup,
}) => {
  const context = useDropdownContext();
  const actualLevel =
    dropdownLevel !== undefined ? dropdownLevel : context.level;
  const [dropdownState, setDropdownState] = useState<DropdownState>({
    isVisible: defaultOpen,
    isPositioned: false,
    position: { top: 0, left: 0, placement: preferredPlacement },
  });
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const isScrollingRef = useRef(false);

  const calculateDynamicSizing = useCallback(
    (triggerRect: DOMRect) => {
      // Shrink the panel to its content by default. This prevents the
      // position:fixed element from expanding to viewport width when children
      // use `width:100%` or `flex:1`. `minWidth` (set below) still wins when
      // the trigger is wider than the content, as CSS min-width overrides width.
      const styles: Record<string, string | number> = { width: "max-content" };

      if (autoWidth && (externalTriggerRef?.current || triggerRef.current)) {
        const triggerWidth = triggerRect.width;
        styles.minWidth = triggerWidth;
      }

      if (minWidth !== undefined) {
        styles.minWidth =
          typeof minWidth === "number" ? `${minWidth}px` : minWidth;
      }
      if (maxWidth !== undefined) {
        if (maxWidth === "auto") {
          styles.maxWidth = "none";
        } else {
          styles.maxWidth =
            typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth;
        }
      }
      if (minHeight !== undefined) {
        styles.minHeight =
          typeof minHeight === "number" ? `${minHeight}px` : minHeight;
      }
      if (maxHeight !== undefined) {
        if (maxHeight === "auto") {
          styles.maxHeight = "none";
        } else {
          styles.maxHeight =
            typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;
        }
      }

      const hasHeightConstraint =
        minHeight !== undefined || maxHeight !== undefined;
      if (hasHeightConstraint) {
        styles.overflowY = "auto";
      } else {
        styles.overflowY = "visible";
      }

      return styles;
    },
    [autoWidth, externalTriggerRef, minWidth, maxWidth, minHeight, maxHeight]
  );

  const calculateOptimalPosition = useCallback(
    (triggerRect: DOMRect, contentRect: DOMRect) => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gap = 8;

      let placement: "top" | "bottom" | "left" | "right" = preferredPlacement;
      let top = 0;
      let left = 0;

      // Helpers for cross-axis alignment
      const alignedLeft = (() => {
        switch (align) {
          case "end":    return triggerRect.right - contentRect.width;
          case "center": return triggerRect.left + (triggerRect.width - contentRect.width) / 2;
          default:       return triggerRect.left; // "start"
        }
      })();
      const alignedTop = (() => {
        switch (align) {
          case "end":    return triggerRect.bottom - contentRect.height;
          case "center": return triggerRect.top + (triggerRect.height - contentRect.height) / 2;
          default:       return triggerRect.top; // "start"
        }
      })();

      switch (preferredPlacement) {
        case "top":
          top = triggerRect.top - contentRect.height - gap;
          left = alignedLeft;
          break;
        case "bottom":
          top = triggerRect.bottom + gap;
          left = alignedLeft;
          break;
        case "left":
          top = alignedTop;
          left = triggerRect.left - contentRect.width - gap;
          break;
        case "right":
          top = alignedTop;
          left = triggerRect.right + gap;
          break;
      }

      if (placement === "top" && top < gap) {
        placement = "bottom";
        top = triggerRect.bottom + gap;
      } else if (
        placement === "bottom" &&
        top + contentRect.height > viewportHeight - gap
      ) {
        placement = "top";
        top = triggerRect.top - contentRect.height - gap;
      } else if (placement === "left" && left < gap) {
        placement = "right";
        left = triggerRect.right + gap;
      } else if (
        placement === "right" &&
        left + contentRect.width > viewportWidth - gap
      ) {
        placement = "left";
        left = triggerRect.left - contentRect.width - gap;
      }

      // Always clamp to both viewport edges - not just the near one - regardless
      // of whether an explicit min/max size was passed. `autoWidth` consumers
      // (Combobox, Select, TagInput suggestions, Menu, ...) never set
      // minWidth/maxWidth, so gating this on those props left the far edge
      // (right/bottom) completely unclamped and let content overflow the
      // viewport whenever it rendered wider/taller than its trigger.
      top = Math.max(
        gap,
        Math.min(top, viewportHeight - contentRect.height - gap)
      );

      left = Math.max(
        gap,
        Math.min(left, viewportWidth - contentRect.width - gap)
      );

      return { top, left, placement };
    },
    [preferredPlacement, align]
  );

  const handleScroll = useCallback(() => {
    if (
      !dropdownState.isVisible ||
      !dropdownState.isPositioned ||
      isScrollingRef.current
    )
      return;

    isScrollingRef.current = true;

    animationFrameRef.current = requestAnimationFrame(() => {
      if (triggerRef.current && contentRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();

        const { top, left, placement } = calculateOptimalPosition(
          triggerRect,
          contentRect
        );

        setDropdownState((prev) => ({
          ...prev,
          position: { top, left, placement },
        }));
      }

      isScrollingRef.current = false;
    });
  }, [
    dropdownState.isVisible,
    dropdownState.isPositioned,
    calculateOptimalPosition,
  ]);

  const handleTriggerClick = useCallback(() => {
    if (disabled) return;

    if (dropdownState.isVisible) {
      setDropdownState((prev) => ({
        ...prev,
        isVisible: false,
        isPositioned: false,
      }));
    } else {
      if (dropdownGroup) {
        const siblingDropdowns = document.querySelectorAll(
          `[data-dropdown-group="${dropdownGroup}"][data-dropdown-content]`
        );
        siblingDropdowns.forEach((dropdown) => {
          const dropdownElement = dropdown as HTMLElement;

          dropdownElement.dispatchEvent(new CustomEvent("closeSibling"));
        });
      }

      if (delay > 0) {
        timeoutRef.current = setTimeout(() => {
          setDropdownState((prev) => ({
            ...prev,
            isVisible: true,
            isPositioned: false,
          }));
        }, delay);
      } else {
        setDropdownState((prev) => ({
          ...prev,
          isVisible: true,
          isPositioned: false,
        }));
      }
    }
  }, [disabled, dropdownState.isVisible, delay, dropdownGroup]);

  useEffect(() => {
    const handleCloseSibling = () => {
      if (dropdownState.isVisible) {
        setDropdownState((prev) => ({
          ...prev,
          isVisible: false,
          isPositioned: false,
        }));
      }
    };

    const currentContentRef = contentRef.current;
    if (currentContentRef) {
      currentContentRef.addEventListener("closeSibling", handleCloseSibling);
    }

    return () => {
      if (currentContentRef) {
        currentContentRef.removeEventListener(
          "closeSibling",
          handleCloseSibling
        );
      }
    };
  }, [dropdownState.isVisible]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (!closeOnClickOutside || !dropdownState.isVisible) return;

      const target = event.target as Node;

      if (contentRef.current?.contains(target)) {
        return;
      }

      if (triggerRef.current?.contains(target)) {
        return;
      }

      const allDropdowns = document.querySelectorAll("[data-dropdown-content]");
      for (const dropdown of allDropdowns) {
        if (dropdown === contentRef.current) continue;

        if (dropdown.contains(target)) {
          const clickedDropdownLevel = parseInt(
            dropdown.getAttribute("data-dropdown-level") || "0"
          );

          if (clickedDropdownLevel > actualLevel) {
            return;
          }
        }
      }

      setDropdownState((prev) => ({
        ...prev,
        isVisible: false,
        isPositioned: false,
      }));
    },
    [closeOnClickOutside, dropdownState.isVisible, actualLevel]
  );

  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape" && dropdownState.isVisible) {
        setDropdownState((prev) => ({
          ...prev,
          isVisible: false,
          isPositioned: false,
        }));
      }
    },
    [closeOnEscape, dropdownState.isVisible]
  );

  useEffect(() => {
    if (
      dropdownState.isVisible &&
      !dropdownState.isPositioned &&
      contentRef.current &&
      triggerRef.current
    ) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();

      const { top, left, placement } = calculateOptimalPosition(
        triggerRect,
        contentRect
      );

      setDropdownState((prev) => ({
        ...prev,
        position: { top, left, placement },
        isPositioned: true,
      }));
    }
  }, [
    dropdownState.isVisible,
    dropdownState.isPositioned,
    calculateOptimalPosition,
  ]);

  useEffect(() => {
    const handleResize = () => {
      if (
        dropdownState.isVisible &&
        dropdownState.isPositioned &&
        contentRef.current &&
        triggerRef.current
      ) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();

        const { top, left, placement } = calculateOptimalPosition(
          triggerRect,
          contentRect
        );

        setDropdownState((prev) => ({
          ...prev,
          position: { top, left, placement },
        }));
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [
    dropdownState.isVisible,
    dropdownState.isPositioned,
    calculateOptimalPosition,
  ]);

  useEffect(() => {
    if (dropdownState.isVisible) {
      window.addEventListener("scroll", handleScroll, { passive: true });

      document.body.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.removeEventListener("scroll", handleScroll);
    };
  }, [dropdownState.isVisible, handleScroll]);

  useEffect(() => {
    if (dropdownState.isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [dropdownState.isVisible, handleClickOutside, handleEscapeKey]);

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

  return (
    <>
      <div
        ref={triggerRef}
        onClick={handleTriggerClick}
        className={`eidos-dropdown-trigger ${triggerClassName}`}
        role="button"
        tabIndex={-1}
      >
        {trigger}
      </div>
      {dropdownState.isVisible &&
        createPortal(
          <div
            ref={contentRef}
            data-dropdown-content
            data-dropdown-level={actualLevel}
            data-dropdown-group={dropdownGroup || ""}
            className={`eidos-dropdown-content eidos-dropdown-content--${dropdownState.position.placement} ${contentClassName || ""}`}
            style={{
              top: dropdownState.position.top,
              left: dropdownState.position.left,
              opacity: dropdownState.isPositioned ? 1 : 0,
              visibility: dropdownState.isPositioned ? "visible" : "hidden",
              // Nested submenus sit one level above their parent dropdown.
              zIndex: isNested
                ? "calc(var(--z-index-dropdown) + 1)"
                : "var(--z-index-dropdown)",
              ...calculateDynamicSizing(
                externalTriggerRef?.current?.getBoundingClientRect() ||
                  triggerRef.current?.getBoundingClientRect() ||
                  new DOMRect()
              ),
            }}
            role="menu"
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
};

export const Dropdown: React.FC<DropdownProps> = (props) => {
  const context = useDropdownContext();
  const nextLevel =
    props.dropdownLevel !== undefined ? props.dropdownLevel : context.level + 1;

  return (
    <DropdownProvider level={nextLevel}>
      <DropdownInternal {...props} />
    </DropdownProvider>
  );
};

Dropdown.displayName = "Dropdown";
