import React, { useState, useRef, useCallback } from 'react';
import { Pencil } from 'lucide-react';
import { Input } from '../Input/Input.component';
import type { InlineEditProps } from './InlineEdit.types';
import './InlineEdit.scss';

export const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onChange,
  onConfirm,
  onCancel,
  editing: editingProp,
  onEditingChange,
  type = 'text',
  placeholder,
  trigger = 'click',
  size = 'md',
  fullWidth = false,
  disabled = false,
  confirmOnBlur = true,
  renderDisplay,
  showEditIcon = true,
  inputVariant = 'outlined',
  className = '',
}) => {
  const isControlled = editingProp !== undefined;
  const [internalEditing, setInternalEditing] = useState(false);
  const editing = isControlled ? editingProp : internalEditing;

  // Track the value at the moment editing begins so Esc can revert to it.
  const valueAtEditStart = useRef(value);

  // Local draft while editing - keeps Input value in sync without forcing the
  // parent to wire `onChange` just to see live keystrokes.
  const [draft, setDraft] = useState(value);

  // ------------------------------------------------------------------
  // Editing state helpers
  // ------------------------------------------------------------------

  const openEdit = useCallback(() => {
    if (disabled) return;
    valueAtEditStart.current = value;
    setDraft(value);
    if (!isControlled) setInternalEditing(true);
    onEditingChange?.(true);
  }, [disabled, isControlled, onEditingChange, value]);

  const closeEdit = useCallback(() => {
    if (!isControlled) setInternalEditing(false);
    onEditingChange?.(false);
  }, [isControlled, onEditingChange]);

  const confirm = useCallback(() => {
    closeEdit();
    onConfirm?.(draft);
  }, [closeEdit, draft, onConfirm]);

  const cancel = useCallback(() => {
    // Revert the draft AND propagate the original value so the parent stays in
    // sync when `onChange` is used to maintain external state.
    setDraft(valueAtEditStart.current);
    onChange?.(valueAtEditStart.current);
    closeEdit();
    onCancel?.();
  }, [closeEdit, onChange, onCancel]);

  // ------------------------------------------------------------------
  // Input handlers
  // ------------------------------------------------------------------

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
    onChange?.(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Stop propagation so parent grids/tables don't double-handle Enter.
      e.stopPropagation();
      confirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cancel();
    }
    // Tab and Arrow keys intentionally bubble - consumers like DataGrid own
    // Tab-to-next-cell and arrow-key navigation at the container level.
  };

  const handleBlur = () => {
    if (confirmOnBlur) confirm();
  };

  // ------------------------------------------------------------------
  // Trigger props for display mode
  // ------------------------------------------------------------------

  const displayTriggerProps =
    trigger === 'doubleClick'
      ? { onDoubleClick: openEdit }
      : { onClick: openEdit };

  // ------------------------------------------------------------------
  // Render: edit mode
  // ------------------------------------------------------------------

  if (editing) {
    return (
      <Input
        type={type}
        variant={inputVariant}
        size={size}
        value={draft}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        fullWidth={fullWidth}
        clearable={false}
        autoFocus
        className={`eidos-inline-edit eidos-inline-edit--editing ${className}`}
      />
    );
  }

  // ------------------------------------------------------------------
  // Render: display mode
  // ------------------------------------------------------------------

  const isEmpty = !value;

  return (
    <span
      role="button"
      tabIndex={disabled ? undefined : 0}
      aria-label={disabled ? undefined : 'Click to edit'}
      className={[
        'eidos-inline-edit',
        `eidos-inline-edit--${size}`,
        fullWidth ? 'eidos-inline-edit--full-width' : '',
        disabled ? 'eidos-inline-edit--disabled' : '',
        isEmpty ? 'eidos-inline-edit--empty' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...(disabled ? {} : displayTriggerProps)}
      onKeyDown={
        disabled
          ? undefined
          : (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openEdit();
              }
            }
      }
    >
      <span className="eidos-inline-edit__text">
        {renderDisplay
          ? renderDisplay(value)
          : value || (
              <span className="eidos-inline-edit__placeholder">{placeholder}</span>
            )}
      </span>
      {!disabled && showEditIcon && (
        <span className="eidos-inline-edit__icon" aria-hidden>
          <Pencil />
        </span>
      )}
    </span>
  );
};
