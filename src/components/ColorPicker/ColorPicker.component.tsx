import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { Dropdown } from '../Dropdown/Dropdown.component';
import type {
  ColorPickerProps,
  HSVColor,
  RGBColor,
  HSLColor,
  ColorFormat,
} from './ColorPicker.types';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_SWATCHES: string[] = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981',
  '#06b6d4', '#6366f1', '#8b5cf6', '#ec4899',
  '#64748b', '#1e293b',
];

// ============================================================================
// Pure colour-utility functions
// ============================================================================

function hsvToRgb(h: number, s: number, v: number): RGBColor {
  // h: 0–360, s: 0–100, v: 0–100  →  r,g,b: 0–255
  const sn = s / 100;
  const vn = v / 100;
  const c = vn * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vn - c;

  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbToHsv(r: number, g: number, b: number): HSVColor {
  // r,g,b: 0–255  →  h: 0–360, s: 0–100, v: 0–100
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  const v = max * 100;
  const s = max === 0 ? 0 : (delta / max) * 100;

  let h = 0;
  if (delta !== 0) {
    if (max === rn)      h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else                 h = (rn - gn) / delta + 4;
    h = h * 60;
    if (h < 0) h += 360;
  }

  return { h: Math.round(h), s: Math.round(s), v: Math.round(v) };
}

function rgbToHex(r: number, g: number, b: number): string {
  const ch = (n: number) =>
    Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${ch(r)}${ch(g)}${ch(b)}`;
}

function hexToRgb(hex: string): RGBColor | null {
  const c = hex.trim().replace(/^#/, '');
  let r: number, g: number, b: number;

  if (c.length === 3) {
    r = parseInt(c[0] + c[0], 16);
    g = parseInt(c[1] + c[1], 16);
    b = parseInt(c[2] + c[2], 16);
  } else if (c.length === 6) {
    r = parseInt(c.slice(0, 2), 16);
    g = parseInt(c.slice(2, 4), 16);
    b = parseInt(c.slice(4, 6), 16);
  } else {
    return null;
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number): HSLColor {
  // r,g,b: 0–255  →  h: 0–360, s: 0–100, l: 0–100
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === rn)      h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else                 h = (rn - gn) / delta + 4;
    h = h * 60;
    if (h < 0) h += 360;
  }

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): RGBColor {
  // h: 0–360, s: 0–100, l: 0–100  →  r,g,b: 0–255
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;

  let r = 0, g = 0, b = 0;
  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// ============================================================================
// Format helpers
// ============================================================================

function colorToText(hsv: HSVColor, alpha: number, fmt: ColorFormat): string {
  const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);

  switch (fmt) {
    case 'hex':
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    case 'rgb':
      return alpha < 1
        ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)})`
        : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    case 'hsl': {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      return alpha < 1
        ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha.toFixed(2)})`
        : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }
  }
}

function parseColorText(text: string): RGBColor | null {
  const t = text.trim();

  // Try hex (with or without leading #)
  const hexCandidate = t.startsWith('#') ? t : /^[0-9a-f]{3,6}$/i.test(t) ? `#${t}` : null;
  if (hexCandidate) return hexToRgb(hexCandidate);

  // Try rgb() / rgba()
  const rgbMatch = t.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  // Try hsl() / hsla()
  const hslMatch = t.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/i);
  if (hslMatch) {
    return hslToRgb(
      parseInt(hslMatch[1], 10),
      parseInt(hslMatch[2], 10),
      parseInt(hslMatch[3], 10),
    );
  }

  return null;
}

/** Parse a hex string to HSVColor, falling back to red on failure. */
function hexToHsv(hex: string): HSVColor {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsv(rgb.r, rgb.g, rgb.b) : { h: 0, s: 100, v: 100 };
}

// ============================================================================
// Component
// ============================================================================

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  defaultValue,
  onChange,
  format = 'hex',
  showAlpha = false,
  showSwatches = true,
  swatches = DEFAULT_SWATCHES,
  disabled = false,
  size = 'medium',
  inline = false,
  label,
  className = '',
}) => {
  // ── Initial hex (only used on first render by useState) ──────────────────
  const initialHex = value ?? defaultValue ?? '#6366f1';

  // ── State ─────────────────────────────────────────────────────────────────
  const [hsv, setHsv] = useState<HSVColor>(() => hexToHsv(initialHex));
  const [alpha, setAlpha] = useState<number>(1);
  const [activeFormat, setActiveFormat] = useState<ColorFormat>(format);
  const [inputText, setInputText] = useState<string>(() =>
    colorToText(hexToHsv(initialHex), 1, format),
  );
  const [copied, setCopied] = useState(false);

  // ── Refs - give event handlers always-fresh values without stale closures ──
  const hsvRef = useRef<HSVColor>(hsv);
  hsvRef.current = hsv;

  const alphaRef = useRef<number>(alpha);
  alphaRef.current = alpha;

  const activeFormatRef = useRef<ColorFormat>(activeFormat);
  activeFormatRef.current = activeFormat;

  // onChange is stored in a ref so applyColor never becomes stale
  const onChangeRef = useRef<ColorPickerProps['onChange']>(onChange);
  onChangeRef.current = onChange;

  const inputFocusedRef = useRef(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Refs for in-flight drag listeners - cleaned up on mouseup and on unmount
  const dragHandlersRef = useRef<{
    move: (e: MouseEvent) => void;
    up: () => void;
  } | null>(null);

  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const currentRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const currentHex = rgbToHex(currentRgb.r, currentRgb.g, currentRgb.b);

  // ── Sync from controlled `value` prop ─────────────────────────────────────
  // Runs only when `value` changes. We normalize both sides to the same
  // hex format before comparing so that round-trip conversions don't trigger
  // spurious updates (which would overwrite the preserved hue when s/v = 0).
  useEffect(() => {
    if (value === undefined) return;
    const rgb = hexToRgb(value);
    if (!rgb) return;
    const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const newNormalised = rgbToHex(
      ...Object.values(hsvToRgb(newHsv.h, newHsv.s, newHsv.v)) as [number, number, number],
    );
    // currentHex is captured from this render - guards against echo loops
    // when the parent echoes back our own onChange emission
    if (newNormalised === currentHex) return;
    setHsv(newHsv);
    if (!inputFocusedRef.current) {
      setInputText(colorToText(newHsv, alphaRef.current, activeFormatRef.current));
    }
  }, [value, currentHex]);

  // ── Cleanup drag listeners and timers on unmount ──────────────────────────
  useEffect(() => {
    return () => {
      if (dragHandlersRef.current) {
        document.removeEventListener('mousemove', dragHandlersRef.current.move);
        document.removeEventListener('mouseup', dragHandlersRef.current.up);
      }
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  // ── Core: apply a new HSV + alpha, emit onChange ───────────────────────────
  // Stable (empty dep array) - reads live values exclusively via refs.
  const applyColor = useCallback((newHsv: HSVColor, newAlpha: number) => {
    setHsv(newHsv);
    setAlpha(newAlpha);

    if (!inputFocusedRef.current) {
      setInputText(colorToText(newHsv, newAlpha, activeFormatRef.current));
    }

    const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    onChangeRef.current?.(hex);
  }, []);

  // ── 2-D saturation / brightness canvas ────────────────────────────────────
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();

      const pick = (clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const s = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        const v = Math.max(0, Math.min(100, 100 - ((clientY - rect.top) / rect.height) * 100));
        applyColor({ h: hsvRef.current.h, s, v }, alphaRef.current);
      };

      pick(e.clientX, e.clientY);

      const handleMouseMove = (me: MouseEvent) => pick(me.clientX, me.clientY);
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        dragHandlersRef.current = null;
      };

      dragHandlersRef.current = { move: handleMouseMove, up: handleMouseUp };
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [disabled, applyColor],
  );

  // ── Hue slider ────────────────────────────────────────────────────────────
  const handleHueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      applyColor({ ...hsvRef.current, h: Number(e.target.value) }, alphaRef.current);
    },
    [applyColor],
  );

  // ── Alpha slider ──────────────────────────────────────────────────────────
  const handleAlphaChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      applyColor(hsvRef.current, Number(e.target.value) / 100);
    },
    [applyColor],
  );

  // ── Format toggle ─────────────────────────────────────────────────────────
  const handleFormatChange = useCallback((fmt: ColorFormat) => {
    setActiveFormat(fmt);
    setInputText(colorToText(hsvRef.current, alphaRef.current, fmt));
  }, []);

  // ── Text-input commit (Enter / blur) ──────────────────────────────────────
  const handleInputCommit = useCallback(() => {
    const rgb = parseColorText(inputText);
    if (!rgb) {
      // Invalid - reset to the current valid colour
      setInputText(colorToText(hsvRef.current, alphaRef.current, activeFormatRef.current));
      return;
    }
    const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    applyColor(newHsv, alphaRef.current);
    // Always normalise the text after a commit (even if the input still has focus)
    setInputText(colorToText(newHsv, alphaRef.current, activeFormatRef.current));
  }, [inputText, applyColor]);

  // ── Swatch click ──────────────────────────────────────────────────────────
  const handleSwatchClick = useCallback(
    (hex: string) => {
      const rgb = hexToRgb(hex);
      if (!rgb) return;
      applyColor(rgbToHsv(rgb.r, rgb.g, rgb.b), alphaRef.current);
    },
    [applyColor],
  );

  // ── Copy to clipboard ─────────────────────────────────────────────────────
  const handleCopy = useCallback(() => {
    const text = colorToText(hsvRef.current, alphaRef.current, activeFormatRef.current);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Clipboard access denied - silently ignore
    });
  }, []);

  // ── Alpha-slider background gradient ─────────────────────────────────────
  // We use a transparent-to-current-colour gradient layered over a checkerboard
  // so the alpha slider always shows the correct colour transition.
  const transparentColor = `rgba(${currentRgb.r}, ${currentRgb.g}, ${currentRgb.b}, 0)`;

  const alphaTrackBg = {
    backgroundImage: [
      `linear-gradient(to right, ${transparentColor}, ${currentHex})`,
      'linear-gradient(45deg, #e2e8f0 25%, transparent 25%)',
      'linear-gradient(-45deg, #e2e8f0 25%, transparent 25%)',
      'linear-gradient(45deg, transparent 75%, #e2e8f0 75%)',
      'linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
    ].join(', '),
    backgroundSize: '100%, 8px 8px, 8px 8px, 8px 8px, 8px 8px',
    backgroundPosition: '0 0, 0 0, 0 4px, 4px -4px, -4px 0',
  };

  // ── Picker panel (shared between inline and popover modes) ────────────────
  const panel = (
    <div className={`eidos-color-picker-panel${inline ? ' eidos-color-picker-panel--inline' : ''}`}>
      {/* 2-D sat / brightness canvas */}
      <div
        ref={canvasRef}
        className="eidos-color-picker-canvas"
        style={{
          background: [
            'linear-gradient(to top, #000, transparent)',
            `linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))`,
          ].join(', '),
        }}
        onMouseDown={handleCanvasMouseDown}
        role="presentation"
      >
        <div
          className="eidos-color-picker-thumb"
          style={{
            left: `${hsv.s}%`,
            top: `${100 - hsv.v}%`,
            background: currentHex,
          }}
        />
      </div>

      {/* Sliders */}
      <div className="eidos-color-picker-sliders">
        {/* Hue */}
        <input
          type="range"
          className="eidos-color-picker-hue"
          min={0}
          max={360}
          step={1}
          value={hsv.h}
          disabled={disabled}
          onChange={handleHueChange}
          aria-label="Hue"
        />

        {/* Alpha */}
        {showAlpha && (
          <div className="eidos-color-picker-alpha-wrapper">
            <div className="eidos-color-picker-alpha-bg" style={alphaTrackBg} />
            <input
              type="range"
              className="eidos-color-picker-alpha"
              min={0}
              max={100}
              step={1}
              value={Math.round(alpha * 100)}
              disabled={disabled}
              onChange={handleAlphaChange}
              aria-label="Opacity"
            />
          </div>
        )}
      </div>

      {/* Text input + format toggles + copy */}
      <div className="eidos-color-picker-inputs">
        <div className="eidos-color-picker-format-btns" role="group" aria-label="Colour format">
          {(['hex', 'rgb', 'hsl'] as ColorFormat[]).map((fmt) => (
            <button
              key={fmt}
              type="button"
              className={[
                'eidos-color-picker-format-btn',
                activeFormat === fmt && 'eidos-color-picker-format-btn--active',
              ].filter(Boolean).join(' ')}
              onClick={() => handleFormatChange(fmt)}
              disabled={disabled}
              aria-pressed={activeFormat === fmt}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>

        <input
          type="text"
          className="eidos-color-picker-input"
          value={inputText}
          disabled={disabled}
          spellCheck={false}
          aria-label="Colour value"
          onChange={(e) => setInputText(e.target.value)}
          onFocus={() => { inputFocusedRef.current = true; }}
          onBlur={() => {
            inputFocusedRef.current = false;
            handleInputCommit();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleInputCommit();
            if (e.key === 'Escape') {
              setInputText(colorToText(hsvRef.current, alphaRef.current, activeFormatRef.current));
            }
          }}
        />

        <button
          type="button"
          className={[
            'eidos-color-picker-copy',
            copied && 'eidos-color-picker-copy--copied',
          ].filter(Boolean).join(' ')}
          onClick={handleCopy}
          disabled={disabled}
          aria-label="Copy colour value"
          title="Copy colour value"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      {/* Swatches */}
      {showSwatches && (
        <div className="eidos-color-picker-swatches" role="group" aria-label="Colour presets">
          {swatches.map((swatchHex) => (
            <button
              key={swatchHex}
              type="button"
              className={[
                'eidos-color-picker-swatch',
                currentHex === swatchHex && 'eidos-color-picker-swatch--active',
              ].filter(Boolean).join(' ')}
              style={{ background: swatchHex }}
              onClick={() => handleSwatchClick(swatchHex)}
              disabled={disabled}
              aria-label={`Select ${swatchHex}`}
              title={swatchHex}
            />
          ))}
        </div>
      )}
    </div>
  );

  // ── Root element classes ───────────────────────────────────────────────────
  const rootClasses = [
    'eidos-color-picker',
    `eidos-color-picker--${size}`,
    disabled && 'eidos-color-picker--disabled',
    className,
  ].filter(Boolean).join(' ');

  // ── Inline mode ───────────────────────────────────────────────────────────
  if (inline) {
    return (
      <div className={rootClasses}>
        {label && <span className="eidos-color-picker-label">{label}</span>}
        {panel}
      </div>
    );
  }

  // ── Popover (trigger + Dropdown) ──────────────────────────────────────────
  return (
    <div className={rootClasses}>
      {label && <span className="eidos-color-picker-label">{label}</span>}
      <Dropdown
        trigger={
          <button
            type="button"
            className="eidos-color-picker-trigger"
            disabled={disabled}
            aria-label={label ?? 'Open colour picker'}
          >
            <span
              className="eidos-color-picker-trigger-swatch"
              style={{ background: currentHex }}
            />
            <span className="eidos-color-picker-trigger-value">{currentHex}</span>
          </button>
        }
        content={panel}
        placement="bottom"
        autoWidth={false}
        minWidth={260}
        disabled={disabled}
      />
    </div>
  );
};

ColorPicker.displayName = 'ColorPicker';
