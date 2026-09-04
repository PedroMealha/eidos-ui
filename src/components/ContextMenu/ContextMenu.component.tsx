import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MenuPanel } from '../Menu';
import type { MenuItem } from '../Menu';
import type { ContextMenuProps } from './ContextMenu.types';

interface MenuPosition {
  x: number;
  y: number;
}

/**
 * ContextMenu - wraps any content and attaches a right-click (or long-press)
 * triggered menu positioned at the cursor.
 *
 * The browser's native context menu is suppressed when `disabled` is false.
 * The menu closes on: click outside, item selection, Escape, and scroll.
 *
 * @example
 * ```tsx
 * <ContextMenu
 *   items={[
 *     { type: 'item', id: 'copy',   label: 'Copy',   icon: Copy,   onClick: () => copy() },
 *     { type: 'item', id: 'cut',    label: 'Cut',    icon: Scissors, onClick: () => cut() },
 *     { type: 'separator', id: 'sep1' },
 *     { type: 'item', id: 'delete', label: 'Delete', icon: Trash2, onClick: () => remove(), disabled: true },
 *   ]}
 * >
 *   <div className="canvas-area">...</div>
 * </ContextMenu>
 * ```
 */
export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  children,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    setIsPositioned(false);
  }, []);

  // Measure the menu panel after it renders and clamp to viewport edges.
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const { width, height } = menu.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const GAP = 4; // px clearance from viewport edge

    const clampedX = Math.min(position.x, vw - width - GAP);
    const clampedY = Math.min(position.y, vh - height - GAP);

    menu.style.left = `${Math.max(GAP, clampedX)}px`;
    menu.style.top = `${Math.max(GAP, clampedY)}px`;
    setIsPositioned(true);
  }, [isOpen, position]);

  // Close on click outside.
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen, close]);

  // Close on Escape or scroll.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    const handleScroll = () => close();

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true); // capture: catches nested scrollers
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, close]);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
    setIsPositioned(false);
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const handleItemClick = useCallback(
    (_item: MenuItem) => {
      close();
    },
    [close],
  );

  return (
    <>
      <div
        className={['eidos-context-menu-target', className].filter(Boolean).join(' ')}
        onContextMenu={handleContextMenu}
      >
        {children}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className={[
              'eidos-context-menu-panel',
              isPositioned && 'eidos-context-menu-panel--positioned',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              top: position.y,
              left: position.x,
            }}
          >
            <MenuPanel items={items} onItemClick={handleItemClick} />
          </div>,
          document.body,
        )}
    </>
  );
};
