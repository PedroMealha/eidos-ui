import { useState } from 'react';
import { ColorPicker } from '../../../src/components/ColorPicker';
import { Section, Grid } from '../shared/Section';

const TAILWIND_REDS: string[] = [
  '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5',
  '#f87171', '#ef4444', '#dc2626', '#b91c1c',
  '#991b1b', '#7f1d1d',
];

export const ColorPickerShowcase = () => {
  const [triggerColor, setTriggerColor] = useState('#6366f1');
  const [inlineColor, setInlineColor] = useState('#10b981');
  const [alphaColor, setAlphaColor] = useState('#3b82f6');
  const [hslColor, setHslColor] = useState('#f59e0b');
  const [swatchColor, setSwatchColor] = useState('#ef4444');

  return (
    <Grid cols={3}>
      <Section label="Trigger (Popover)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <ColorPicker
            label="Brand Color"
            value={triggerColor}
            onChange={setTriggerColor}
          />
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Current:{' '}
            <span
              style={{
                display: 'inline-block',
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '2px',
                backgroundColor: triggerColor,
                verticalAlign: 'middle',
                marginRight: '0.25rem',
                border: '1px solid #e2e8f0',
              }}
            />
            <code>{triggerColor}</code>
          </div>
        </div>
      </Section>

      <Section label="Inline">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <ColorPicker
            inline
            value={inlineColor}
            onChange={setInlineColor}
          />
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Current:{' '}
            <span
              style={{
                display: 'inline-block',
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '2px',
                backgroundColor: inlineColor,
                verticalAlign: 'middle',
                marginRight: '0.25rem',
                border: '1px solid #e2e8f0',
              }}
            />
            <code>{inlineColor}</code>
          </div>
        </div>
      </Section>

      <Section label="With Alpha">
        <ColorPicker
          inline
          showAlpha
          value={alphaColor}
          onChange={setAlphaColor}
        />
      </Section>

      <Section label="HSL Format">
        <ColorPicker
          inline
          format="hsl"
          value={hslColor}
          onChange={setHslColor}
        />
      </Section>

      <Section label="Custom Swatches (Tailwind Reds)">
        <ColorPicker
          inline
          swatches={TAILWIND_REDS}
          value={swatchColor}
          onChange={setSwatchColor}
        />
      </Section>

      <Section label="Disabled">
        <ColorPicker
          label="Disabled Picker"
          defaultValue="#8b5cf6"
          disabled
        />
      </Section>

      <div style={{ gridColumn: '1 / -1' }}>
        <Section label="Sizes">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <ColorPicker size="sm" label="Small" defaultValue="#ef4444" />
            </div>
            <div>
              <ColorPicker size="md" label="Medium" defaultValue="#f59e0b" />
            </div>
            <div>
              <ColorPicker size="lg" label="Large" defaultValue="#10b981" />
            </div>
          </div>
        </Section>
      </div>
    </Grid>
  );
};
