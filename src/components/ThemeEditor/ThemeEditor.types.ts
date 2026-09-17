import type { ThemeColorKey, ThemeFontOption } from '../ThemeProvider';

export interface ThemeEditorProps {
  /**
   * Which colour rows to show, in this order. Defaults to all seven - pass a
   * subset when only part of the palette should be user-editable.
   */
  colors?: ThemeColorKey[];
  /**
   * Body font stacks to offer. Defaults to a small built-in list.
   *
   * Supply your own to list the fonts your app actually ships - a stack is only
   * a *name*, so offering one the browser cannot resolve silently falls through
   * to the next entry.
   */
  fontOptions?: ThemeFontOption[];
  /** Monospace font stacks to offer. Defaults to a small built-in list. */
  monoFontOptions?: ThemeFontOption[];
  /**
   * Allow loading a font file from disk. Default `true`.
   *
   * The font is registered with the CSS Font Loading API from an `ArrayBuffer`,
   * which needs no CSP allowance, and renders immediately. It is **not**
   * persisted on its own - see `onFontUpload`.
   */
  allowFontUpload?: boolean;
  /**
   * Called with the file the user picked, after it has been registered and
   * applied.
   *
   * This is the hook for making an uploaded font permanent. A `ThemeConfig` is
   * JSON and cannot carry binary data, so the theme records only the family
   * *name* - without persisting the file yourself, the name resolves to nothing
   * on the next load and the stack quietly falls back. Upload the file to your
   * server (or store it in IndexedDB), then `registerFontFace` it on startup
   * and include it in `fontOptions`.
   *
   * @param file The font file as chosen by the user.
   * @param family The family name it was registered under.
   * @param mono `true` when it was picked for the monospace slot.
   */
  onFontUpload?: (file: File, family: string, mono: boolean) => void;
  /** Hide the typography section. */
  hideTypography?: boolean;
  /** Hide the "Reset all" action. */
  hideReset?: boolean;
  /** Hide the "Copy as CSS" action. */
  hideCssExport?: boolean;
  className?: string;
}
