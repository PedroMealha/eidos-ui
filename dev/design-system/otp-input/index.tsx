import { useState } from 'react';
import { OTPInput } from '../../../src/components/OTPInput';
import { Section, Grid } from '../shared/Section';

const OTPCompleteDemo = () => {
  const [completedValue, setCompletedValue] = useState<string | null>(null);

  return (
    <Section label="onComplete Callback">
      <OTPInput
        label="Fill all slots"
        hint={completedValue ? `Complete! Value: ${completedValue}` : 'Fill all 6 slots to trigger onComplete'}
        onComplete={(val) => setCompletedValue(val)}
        onChange={() => setCompletedValue(null)}
      />
    </Section>
  );
};

export const OTPInputShowcase = () => (
  <Grid cols={3}>
    <Section label="Default (6-digit)">
      <OTPInput />
    </Section>

    <Section label="Short Code (4-digit)">
      <OTPInput length={4} />
    </Section>

    <Section label="Label & Hint">
      <OTPInput
        label="Verification Code"
        hint="Check your email"
      />
    </Section>

    <Section label="Masked">
      <OTPInput
        label="Password OTP"
        mask={true}
      />
    </Section>

    <Section label="Alphanumeric">
      <OTPInput
        label="Alphanumeric Code"
        type="alphanumeric"
        length={6}
        hint="Letters and numbers accepted"
      />
    </Section>

    <Section label="Error State">
      <OTPInput
        label="Verification Code"
        error="Invalid code, please try again"
        defaultValue="123"
      />
    </Section>

    <Section label="AutoFocus">
      <OTPInput
        label="Auto-focused"
        hint="First slot is focused on render"
        autoFocus
      />
    </Section>

    <OTPCompleteDemo />

    <Section label="Disabled">
      <OTPInput
        label="Disabled"
        defaultValue="123456"
        disabled
      />
    </Section>

    <div style={{ gridColumn: '1 / -1' }}>
      <Section label="Sizes">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <OTPInput size="small" label="Small" />
          <OTPInput size="medium" label="Medium" />
          <OTPInput size="large" label="Large" />
        </div>
      </Section>
    </div>
  </Grid>
);
