import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { CircleCheck, CircleX, TriangleAlert } from 'lucide-react';
import { Alert } from '../Alert';
import { Button, IconButton } from '../Button';
import { Card } from '../Card';
import { ColorPicker } from '../ColorPicker';
import { Select } from '../Select';
import { Slider } from '../Slider';
import { Tooltip } from '../Tooltip';
import { useTheme } from '../ThemeProvider';
import type { ThemeColorKey, ThemeFontOption } from '../ThemeProvider';
import {
  THEME_COLOR_KEYS,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  defaultTheme,
} from '../ThemeProvider/ThemeProvider.tokens';
import {
  CONTRAST_DARK,
  CONTRAST_LIGHT,
  contrastRatio,
  pickContrast,
} from '../ThemeProvider/ThemeProvider.color';
import {
  FONT_ACCEPT,
  isFontStackAvailable,
  registerFontFile,
  subscribeToFontLoads,
  toFontStack,
} from '../ThemeProvider/ThemeProvider.fonts';
import type { ThemeEditorProps } from './ThemeEditor.types';

/** The page surface every diagnostic is measured against - `--white`. */
const PAGE_SURFACE = CONTRAST_LIGHT;

/** Below this, a fill is effectively invisible against the page behind it. */
const EDGE_MIN_RATIO = 1.5;

const COLOR_LABELS: Record<ThemeColorKey, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  success: 'Success',
  danger: 'Danger',
  warning: 'Warning',
  info: 'Info',
  hyperlink: 'Hyperlink',
};

/** `hyperlink` is only ever text on a surface, so it is graded differently. */
const isFill = (key: ThemeColorKey): boolean => key !== 'hyperlink';

/**
 * Built-in stacks, deliberately limited to fonts that can be relied on.
 *
 * A dropdown implies its entries are available, but a font stack is only a list
 * of *names* - nothing here can install a font. So the list is restricted to
 * generic families (guaranteed by CSS), `system-ui` (whatever the OS provides),
 * and the handful of genuinely web-safe faces. Fonts like Inter, which are not
 * installed anywhere by default, were removed: offering one is offering a
 * choice that silently does nothing on most machines.
 *
 * The preset is included because it is the shipped default and therefore has to
 * be representable - and note that `eidos-ui` does not ship the Plus Jakarta
 * Sans file either, so it renders only where the consumer provides it. That is
 * exactly why unavailable options are labelled as such.
 *
 * Anything beyond this belongs to the consuming app, via `fontOptions`.
 */
const FONT_STACKS: ThemeFontOption[] = [
  // Taken from the preset rather than retyped, so the shipped default always
  // matches an option exactly. A hand-copied shorter stack did not match, and
  // the row fell back to showing a synthetic "custom" entry instead of the
  // name of the font actually in use.
  { label: 'Plus Jakarta Sans (theme default)', value: defaultTheme.typography.fontFamily! },
  { label: 'System UI', value: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
  { label: 'Helvetica / Arial', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Georgia', value: "Georgia, 'Times New Roman', serif" },
  { label: 'Sans-serif (generic)', value: 'sans-serif' },
  { label: 'Serif (generic)', value: 'serif' },
];

const MONO_STACKS: ThemeFontOption[] = [
  { label: 'JetBrains Mono (theme default)', value: defaultTheme.typography.monoFamily! },
  { label: 'Menlo / Consolas', value: 'Menlo, Consolas, monospace' },
  { label: 'Courier New', value: "'Courier New', Courier, monospace" },
  { label: 'Monospace (generic)', value: 'monospace' },
];

type Grade = 'aa' | 'aa-large' | 'fail';

const gradeFor = (ratio: number): Grade => (ratio >= 4.5 ? 'aa' : ratio >= 3 ? 'aa-large' : 'fail');

/** Spelled out for the middle grade, which is the one that misleads. */
const GRADE_CAVEAT: Partial<Record<Grade, string>> = {
  'aa-large':
    ' WCAG AA needs 4.5:1 for normal text and allows 3:1 only at 24px or larger - button and label text here is around 12px, so this does not pass.',
  fail: ' Below 3:1, which fails WCAG AA at every text size.',
};

/**
 * Severity is carried by an icon and the label text, not by colour.
 *
 * These badges cannot use `Pill`, or any themed `--x-color`: the theme being
 * edited also styles this editor, so a washed-out `success` colour would render
 * the "passes AA" badge illegible at precisely the moment it is reporting that
 * a colour is illegible. The badge styling comes from the gray ramp, which is
 * deliberately not themeable.
 *
 * Not relying on colour alone also satisfies WCAG 1.4.1 (Use of Colour).
 */
const GRADE_BADGE: Record<
  Grade,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  aa: { label: 'AA', icon: CircleCheck },
  // Named for what it means in practice, not just for the threshold it clears.
  // WCAG's relaxed 3:1 tier applies only to text at 24px (or 18.7px bold) and
  // above, and nothing in this library is that large - `--font-size-sm` is
  // ~12.25px at the default root size. A bare "AA large only" reads as a pass
  // when for every component here it is a fail.
  'aa-large': { label: 'Too low for body text', icon: TriangleAlert },
  fail: { label: 'Fails AA', icon: CircleX },
};

interface Diagnostic {
  grade: Grade;
  ratio: number;
  /** What the ratio describes, for the tooltip. */
  detail: string;
  /** Set when the fill is too close to the page surface to be seen. */
  edgeWarning?: string;
}

const diagnose = (key: ThemeColorKey, base: string, explicitContrast?: string): Diagnostic => {
  if (!isFill(key)) {
    // Link text sits on the page, so the page is what it must contrast with.
    const ratio = contrastRatio(base, PAGE_SURFACE);
    const grade = gradeFor(ratio);
    return {
      grade,
      ratio,
      detail: `Link text on the page background: ${ratio.toFixed(2)}:1 against white.${GRADE_CAVEAT[grade] ?? ''}`,
    };
  }

  const foreground = explicitContrast ?? pickContrast(base);
  const ratio = contrastRatio(base, foreground);
  const name = foreground.toLowerCase() === CONTRAST_DARK ? 'dark' : 'white';
  const edge = contrastRatio(base, PAGE_SURFACE);

  const grade = gradeFor(ratio);

  return {
    grade,
    ratio,
    detail: `${name === 'white' ? 'White' : 'Near-black'} text on this fill is ${ratio.toFixed(2)}:1.${
      explicitContrast ? ' Foreground pinned via the theme.' : ''
    }${GRADE_CAVEAT[grade] ?? ''}`,
    edgeWarning:
      edge < EDGE_MIN_RATIO
        ? `Only ${edge.toFixed(2)}:1 against the page background - this fill is barely distinguishable from the page it sits on.`
        : undefined,
  };
};

interface FontRowProps {
  label: string;
  /** Stack currently applied, used to pick the matching option. */
  value: string;
  options: ThemeFontOption[];
  mono: boolean;
  allowUpload: boolean;
  onChange: (stack: string) => void;
  onUploaded: (option: ThemeFontOption, file: File, family: string) => void;
}

/** Pulls the first family out of a stack, unquoted. */
const firstFamily = (stack: string): string =>
  stack
    .split(',')[0]
    ?.trim()
    .replace(/^['"]|['"]$/g, '') || 'Custom';

/**
 * One font row: a `Select` over the known stacks, an optional upload, and an
 * availability warning.
 *
 * Uses `Select` rather than `Combobox` deliberately. `Combobox` filters its
 * options against the text in the field, and the field holds a full font stack
 * (`'Plus Jakarta Sans', -apple-system, …`) which matches no option label - so
 * the list read "No results found" until the text was cleared by hand. A font
 * is a choice from a known set, not a search.
 */
const FontRow: React.FC<FontRowProps> = ({
  label,
  value,
  options,
  mono,
  allowUpload,
  onChange,
  onUploaded,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Web fonts load asynchronously, so the first render always sees them as
  // unavailable. Without re-checking once they arrive, the row would sit on a
  // stale "not installed" warning for a font that is rendering perfectly.
  // The reducer exists only to schedule that re-render; its value is unused.
  const [, onFontsLoaded] = useReducer((count: number) => count + 1, 0);
  useEffect(() => subscribeToFontLoads(onFontsLoaded), [onFontsLoaded]);

  const baseOptions = useMemo(() => {
    // A stack the theme carries but that isn't in the list (loaded by the host
    // app, or set programmatically) still needs to be selectable, labelled with
    // its own first family so the row names the font actually in use.
    const known = options.some((o) => o.value === value);
    return known ? options : [...options, { label: `${firstFamily(value)} (custom)`, value }];
  }, [options, value]);

  // Probed on every render rather than memoised: availability changes over time
  // as fonts load, so a cached answer is a wrong answer. Four canvas
  // measurements are far cheaper than getting this wrong.
  //
  // Availability is annotated per option rather than filtered or disabled. A
  // theme is shared across machines, so a font present here may be absent for
  // the next user - and vice versa, which would mean hiding a font someone
  // legitimately wants. Annotating keeps every choice selectable while making
  // the list stop implying that a name is a guarantee.
  const selectOptions = baseOptions.map((option) => ({
    id: option.value,
    label: isFontStackAvailable(option.value) ? option.label : `${option.label} - not installed`,
    value: option.value,
  }));

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setError(null);
      try {
        const family = await registerFontFile(file);
        const stack = toFontStack(family, mono);
        onUploaded({ label: `${family} (this session)`, value: stack }, file, family);
        onChange(stack);
      } catch (cause) {
        setError(
          cause instanceof Error ? cause.message : 'That file could not be loaded as a font.',
        );
      }
    },
    [mono, onChange, onUploaded],
  );

  const unavailable = !isFontStackAvailable(value);

  return (
    <div className="eidos-theme-editor-row eidos-theme-editor-row--wide">
      <span className="eidos-theme-editor-row__label">{label}</span>

      <div className="eidos-theme-editor-row__control">
        <Select
          options={selectOptions}
          value={value}
          onChange={(next) => onChange(Array.isArray(next) ? next[0] : next)}
          fullWidth
          // The row's visible label is a `<span>`, not a `<label htmlFor>`,
          // so nothing associates it with the control. Naming the input
          // directly keeps the two in step without restructuring the row.
          inputProps={{ 'aria-label': label }}
        />
      </div>

      {/* Occasional - lives before the action so it can never displace it. */}
      <div className="eidos-theme-editor-row__diagnostics">
        {unavailable && (
          <Tooltip
            message={`${firstFamily(value)} isn't available here, so the browser is rendering the next family in the stack instead. Upload the file, or have your app serve it, to use it.`}
          >
            <span className="eidos-theme-editor-badge eidos-theme-editor-badge--aa-large">
              <TriangleAlert className="eidos-theme-editor-badge__icon" />
              Not installed
            </span>
          </Tooltip>
        )}
        {error && (
          <Tooltip message={error}>
            <span className="eidos-theme-editor-badge eidos-theme-editor-badge--fail">
              <CircleX className="eidos-theme-editor-badge__icon" />
              Upload failed
            </span>
          </Tooltip>
        )}
      </div>

      {allowUpload && (
        <div className="eidos-theme-editor-row__actions">
          <Button
            variant="text"
            color="secondary"
            size="sm"
            preIcon="Upload"
            onClick={() => inputRef.current?.click()}
            tooltip="Load a font file to use it right away. Not saved - see onFontUpload to persist it."
          >
            Upload
          </Button>
          {/* Plain input rather than FileUpload: this is a single inline
              action in a dense row, not a drop zone. */}
          <input
            ref={inputRef}
            type="file"
            accept={FONT_ACCEPT}
            // Same proxy pattern as `MessageComposer` - see the note there.
            className="eidos-theme-editor-file"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              void handleFile(event.target.files?.[0]);
              // Allow re-picking the same file after a failure.
              event.target.value = '';
            }}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Live editor for the active `ThemeProvider` theme.
 *
 * Renders no preview of its own: the provider writes tokens to
 * `document.documentElement`, so the surrounding page is the preview.
 *
 * Contrast readouts are diagnostics only - a colour that fails is still
 * applied. Automatically "correcting" a chosen colour would mean silently
 * rendering something other than what was picked.
 */
export const ThemeEditor: React.FC<ThemeEditorProps> = ({
  colors = THEME_COLOR_KEYS as ThemeColorKey[],
  fontOptions = FONT_STACKS,
  monoFontOptions = MONO_STACKS,
  allowFontUpload = true,
  onFontUpload,
  hideTypography = false,
  hideReset = false,
  hideCssExport = false,
  className,
}) => {
  const { theme, resolvedTheme, setTheme, updateTheme, resetTheme, isDefault, toCss } = useTheme();
  const [copied, setCopied] = useState(false);

  // Fonts registered through the upload control this session. Kept local
  // because font *data* cannot live in a ThemeConfig - see the .mdx.
  const [uploaded, setUploaded] = useState<ThemeFontOption[]>([]);
  const [monoUploaded, setMonoUploaded] = useState<ThemeFontOption[]>([]);

  const setColor = useCallback(
    (key: ThemeColorKey, hex: string) => {
      const current = theme.colors?.[key];
      // Only the base is written here. A `contrast` pinned in the theme is
      // preserved rather than dropped, since the editor never sets one.
      const pinned = typeof current === 'object' ? current.contrast : undefined;
      updateTheme({ colors: { [key]: pinned ? { base: hex, contrast: pinned } : hex } });
    },
    [theme.colors, updateTheme],
  );

  const resetColor = useCallback(
    (key: ThemeColorKey) => {
      // Must go through setTheme, not updateTheme: updateTheme merges, so a key
      // left out of the patch keeps its existing value instead of being removed.
      // Removal is what restores the preset, since resolveTheme fills gaps.
      const nextColors = { ...theme.colors };
      delete nextColors[key];
      setTheme({ ...theme, colors: nextColors });
    },
    [theme, setTheme],
  );

  const diagnostics = useMemo(
    () =>
      colors.map((key) => {
        const { base, contrast } = resolvedTheme.colors[key];
        return { key, base, ...diagnose(key, base, contrast) };
      }),
    [colors, resolvedTheme],
  );

  const failing = diagnostics.filter((d) => d.grade === 'fail');
  const invisible = diagnostics.filter((d) => d.edgeWarning);

  const copyCss = useCallback(() => {
    const css = toCss();
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(css).then(done, done);
      return;
    }
    done();
  }, [toCss]);

  return (
    <div className={['eidos-theme-editor', className].filter(Boolean).join(' ')}>
      {(failing.length > 0 || invisible.length > 0) && (
        <Alert variant="warning" title="Contrast issues">
          {failing.length > 0 && (
            <p>
              Cannot reach WCAG AA (4.5:1) with either foreground:{' '}
              {failing.map((d) => COLOR_LABELS[d.key]).join(', ')}.
            </p>
          )}
          {invisible.length > 0 && (
            <p>
              Too close to the page background to read as a filled surface:{' '}
              {invisible.map((d) => COLOR_LABELS[d.key]).join(', ')}.
            </p>
          )}
        </Alert>
      )}

      <Card variant="outlined" padding="lg" className="eidos-theme-editor-section">
        <div className="eidos-theme-editor-section__header">
          <span className="eidos-theme-editor-section__title">Colours</span>
          <span className="eidos-theme-editor-section__hint">
            Shades, tints and foregrounds are derived from each base colour.
          </span>
        </div>

        <div className="eidos-theme-editor-rows">
          {diagnostics.map(({ key, base, grade, ratio, detail, edgeWarning }) => {
            const badge = GRADE_BADGE[grade];
            const overridden = theme.colors?.[key] !== undefined;
            return (
              <div className="eidos-theme-editor-row" key={key}>
                <span className="eidos-theme-editor-row__label">{COLOR_LABELS[key]}</span>

                {/* `md` rather than `sm`: the size drives the panel's
                    saturation/brightness canvas, and 120px is cramped for
                    picking a lightness precisely. */}
                <ColorPicker value={base} onChange={(hex) => setColor(key, hex)} size="md" />

                <div className="eidos-theme-editor-row__diagnostics">
                  <Tooltip message={detail}>
                    <span className={`eidos-theme-editor-badge eidos-theme-editor-badge--${grade}`}>
                      <badge.icon className="eidos-theme-editor-badge__icon" />
                      {`${ratio.toFixed(2)}:1 ${badge.label}`}
                    </span>
                  </Tooltip>
                  {edgeWarning && (
                    <Tooltip message={edgeWarning}>
                      <span className="eidos-theme-editor-badge eidos-theme-editor-badge--fail">
                        <CircleX className="eidos-theme-editor-badge__icon" />
                        Invisible on page
                      </span>
                    </Tooltip>
                  )}
                </div>

                <div className="eidos-theme-editor-row__actions">
                  <IconButton
                    icon="RotateCcw"
                    variant="text"
                    color="secondary"
                    size="sm"
                    disabled={!overridden}
                    onClick={() => resetColor(key)}
                    tooltip={overridden ? `Reset ${COLOR_LABELS[key]} to the preset` : 'Unchanged'}
                    aria-label={`Reset ${COLOR_LABELS[key]}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {!hideTypography && (
        <Card variant="outlined" padding="lg" className="eidos-theme-editor-section">
          <div className="eidos-theme-editor-section__header">
            <span className="eidos-theme-editor-section__title">Typography</span>
            <span className="eidos-theme-editor-section__hint">
              A stack only names a font - upload the file to use one the browser doesn&apos;t
              already have. Spacing is declared in <code>em</code>, so the scale moves padding with
              the text.
            </span>
          </div>

          <div className="eidos-theme-editor-rows">
            <FontRow
              label="Body font"
              value={resolvedTheme.typography.fontFamily}
              options={[...fontOptions, ...uploaded]}
              mono={false}
              allowUpload={allowFontUpload}
              onChange={(fontFamily) => updateTheme({ typography: { fontFamily } })}
              onUploaded={(option, file, family) => {
                setUploaded((prev) => [...prev, option]);
                onFontUpload?.(file, family, false);
              }}
            />

            <FontRow
              label="Mono font"
              value={resolvedTheme.typography.monoFamily}
              options={[...monoFontOptions, ...monoUploaded]}
              mono
              allowUpload={allowFontUpload}
              onChange={(monoFamily) => updateTheme({ typography: { monoFamily } })}
              onUploaded={(option, file, family) => {
                setMonoUploaded((prev) => [...prev, option]);
                onFontUpload?.(file, family, true);
              }}
            />

            <div className="eidos-theme-editor-row eidos-theme-editor-row--wide">
              <span className="eidos-theme-editor-row__label">Scale</span>
              <div className="eidos-theme-editor-row__control">
                <Slider
                  value={resolvedTheme.typography.fontScale}
                  min={FONT_SCALE_MIN}
                  max={FONT_SCALE_MAX}
                  step={0.025}
                  showValue
                  showMinMax
                  unit="×"
                  onChange={(value) => updateTheme({ typography: { fontScale: value } })}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {(!hideReset || !hideCssExport) && (
        <div className="eidos-theme-editor-actions">
          {!hideReset && (
            <Button variant="outlined" color="secondary" disabled={isDefault} onClick={resetTheme}>
              Reset all
            </Button>
          )}
          {!hideCssExport && (
            <Button
              variant="outlined"
              preIcon={copied ? 'Check' : 'Clipboard'}
              onClick={copyCss}
              tooltip="Copy the resolved tokens as a :root block you can paste into your own stylesheet"
            >
              {copied ? 'Copied' : 'Copy as CSS'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

ThemeEditor.displayName = 'ThemeEditor';
