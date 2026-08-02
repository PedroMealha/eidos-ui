export interface InlineEditProps {
  /** The current value. Always required — this component is always controlled. */
  value: string;

  /** Fires on every keystroke while in edit mode. */
  onChange?: (value: string) => void;

  /** Fires when editing is confirmed (Enter or blur). Receives the committed value. */
  onConfirm?: (value: string) => void;

  /** Fires when editing is cancelled (Esc). The display value reverts to what it was when editing began. */
  onCancel?: () => void;

  // ── Controlled editing state ──────────────────────────────────────────────
  /**
   * When provided, the editing state is controlled externally.
   * Omit to use uncontrolled mode (the component manages its own toggle).
   */
  editing?: boolean;

  /**
   * Called when the component wants to open or close editing.
   * Pair with `editing` for fully controlled mode.
   */
  onEditingChange?: (editing: boolean) => void;

  // ── Input configuration ───────────────────────────────────────────────────
  type?: 'text' | 'number' | 'date';
  placeholder?: string;

  /** Interaction that triggers edit mode in uncontrolled usage. Default: `'click'` */
  trigger?: 'click' | 'doubleClick';

  // ── Layout ────────────────────────────────────────────────────────────────
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;

  /**
   * Whether confirming on blur (focus leaving the input) commits the value.
   * Default: `true`.
   *
   * Set to `false` when the parent already handles commit/cancel externally
   * (e.g. DataGrid, which listens for click-outside and Tab navigation itself).
   */
  confirmOnBlur?: boolean;

  // ── Display customisation ─────────────────────────────────────────────────
  /** Custom render for the read-only display. Receives the current value. */
  renderDisplay?: (value: string) => React.ReactNode;

  /**
   * Whether to show the pencil icon affordance on hover in display mode.
   * Default: `true`. Set to `false` when the parent provides its own edit trigger.
   */
  showEditIcon?: boolean;

  /**
   * Variant applied to the underlying `<Input>` while in edit mode.
   * Default: `'outlined'`.
   */
  inputVariant?: 'filled' | 'outlined' | 'text' | 'bare';

  className?: string;
}
