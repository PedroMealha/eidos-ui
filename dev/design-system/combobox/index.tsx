import { useState } from 'react';
import { Combobox } from '../../../src/components/Combobox';
import type { ComboboxOption } from '../../../src/components/Combobox';
import { Section, Grid } from '../shared/Section';

const frameworkOptions: ComboboxOption[] = [
  { id: '1', label: 'React', value: 'react' },
  { id: '2', label: 'Vue', value: 'vue' },
  { id: '3', label: 'Angular', value: 'angular' },
  { id: '4', label: 'Svelte', value: 'svelte' },
  { id: '5', label: 'Solid', value: 'solid' },
];

const countryOptions: ComboboxOption[] = [
  { id: 'us', label: 'United States', value: 'us', group: 'North America' },
  { id: 'ca', label: 'Canada', value: 'ca', group: 'North America' },
  { id: 'mx', label: 'Mexico', value: 'mx', group: 'North America' },
  { id: 'gb', label: 'United Kingdom', value: 'gb', group: 'Europe' },
  { id: 'de', label: 'Germany', value: 'de', group: 'Europe' },
  { id: 'fr', label: 'France', value: 'fr', group: 'Europe' },
  { id: 'es', label: 'Spain', value: 'es', group: 'Europe' },
  { id: 'jp', label: 'Japan', value: 'jp', group: 'Asia' },
  { id: 'cn', label: 'China', value: 'cn', group: 'Asia' },
  { id: 'in', label: 'India', value: 'in', group: 'Asia' },
  { id: 'br', label: 'Brazil', value: 'br', group: 'South America' },
  { id: 'ar', label: 'Argentina', value: 'ar', group: 'South America' },
];

const descriptionOptions: ComboboxOption[] = [
  {
    id: 'free',
    label: 'Free Plan',
    value: 'free',
    description: 'Up to 3 projects, 1 GB storage',
  },
  {
    id: 'pro',
    label: 'Pro Plan',
    value: 'pro',
    description: 'Unlimited projects, 50 GB storage',
  },
  {
    id: 'enterprise',
    label: 'Enterprise Plan',
    value: 'enterprise',
    description: 'Custom limits, SSO, priority support',
  },
];

export const ComboboxShowcase = () => {
  const [basic, setBasic] = useState('');
  const [grouped, setGrouped] = useState('');
  const [freeText, setFreeText] = useState('');
  const [described, setDescribed] = useState('');
  const [sized, setSized] = useState('');

  return (
    <Grid cols={3}>
      <Section label="Basic">
        <Combobox
          label="Framework"
          options={frameworkOptions}
          value={basic}
          onChange={setBasic}
          placeholder="Search or select…"
        />
      </Section>

      <Section label="Grouped Options">
        <Combobox
          label="Country"
          options={countryOptions}
          value={grouped}
          onChange={setGrouped}
          placeholder="Select a country…"
        />
      </Section>

      <Section label="Allow Free Text">
        <Combobox
          label="Custom Framework"
          options={frameworkOptions}
          value={freeText}
          onChange={setFreeText}
          allowFreeText
          placeholder="Search or type your own…"
          hint="Type anything to use a custom value"
        />
      </Section>

      <Section label="With Descriptions">
        <Combobox
          label="Subscription Plan"
          options={descriptionOptions}
          value={described}
          onChange={setDescribed}
          placeholder="Choose a plan…"
          renderOption={(option) => (
            <div>
              <div style={{ fontWeight: 500 }}>{option.label}</div>
              {option.description && (
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>
                  {option.description}
                </div>
              )}
            </div>
          )}
        />
      </Section>

      <Section label="Loading State">
        <Combobox
          label="Loading Data"
          options={[]}
          loading
          loadingText="Fetching results…"
          placeholder="Search…"
        />
      </Section>

      <Section label="Error & Hint">
        <Combobox
          label="Framework"
          options={frameworkOptions}
          placeholder="Select a framework…"
          error="Please select a valid option"
          hint="This field is required"
        />
      </Section>

      <Section label="Disabled">
        <Combobox
          label="Disabled"
          options={frameworkOptions}
          defaultValue="react"
          placeholder="Cannot be changed"
          disabled
        />
      </Section>

      <div style={{ gridColumn: '1 / -1' }}>
        <Section label="Sizes">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <Combobox
                label="Small"
                size="small"
                options={frameworkOptions}
                value={sized}
                onChange={setSized}
                placeholder="Small…"
              />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <Combobox
                label="Medium"
                size="medium"
                options={frameworkOptions}
                value={sized}
                onChange={setSized}
                placeholder="Medium…"
              />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <Combobox
                label="Large"
                size="large"
                options={frameworkOptions}
                value={sized}
                onChange={setSized}
                placeholder="Large…"
              />
            </div>
          </div>
        </Section>
      </div>
    </Grid>
  );
};
