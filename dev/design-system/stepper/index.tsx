import { useState } from 'react';
import { User, CreditCard, Package, CheckCircle } from 'lucide-react';
import { Stepper } from '../../../src/components/Stepper';
import { Button } from '../../../src/components/Button';
import { Section, Col, Grid } from '../shared/Section';

const STEPS = [
  { label: 'Account',  description: 'Create your account' },
  { label: 'Profile',  description: 'Fill in your details' },
  { label: 'Billing',  description: 'Payment information' },
  { label: 'Confirm',  description: 'Review and submit' },
];

const STEPS_VERTICAL = [
  { label: 'Order placed',   description: 'Your order has been received', icon: <Package size={14} /> },
  { label: 'Processing',     description: 'We are preparing your order',  icon: <CreditCard size={14} /> },
  { label: 'Shipped',        description: 'On the way to you',            icon: <User size={14} /> },
  { label: 'Delivered',      description: 'Enjoy your purchase',          icon: <CheckCircle size={14} /> },
];

export const StepperShowcase = () => {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <Col>
      <Section label="Horizontal (default)">
        <Stepper steps={STEPS} activeStep={1} />
      </Section>

      <Section label="Vertical with icons">
        <div style={{ maxWidth: 320 }}>
          <Stepper steps={STEPS_VERTICAL} activeStep={2} orientation="vertical" />
        </div>
      </Section>

      <Section label="All completed">
        <Stepper steps={STEPS} activeStep={4} />
      </Section>

      <Section label="With error">
        <Stepper
          steps={[
            { label: 'Account' },
            { label: 'Profile', status: 'error', description: 'Fix validation errors' },
            { label: 'Billing' },
            { label: 'Confirm' },
          ]}
          activeStep={1}
        />
      </Section>

      <Section label="Colors">
        <Grid cols={2}>
          <Stepper steps={STEPS.slice(0, 3)} activeStep={1} color="primary" />
          <Stepper steps={STEPS.slice(0, 3)} activeStep={1} color="secondary" />
          <Stepper steps={STEPS.slice(0, 3)} activeStep={1} color="success" />
          <Stepper steps={STEPS.slice(0, 3)} activeStep={1} color="danger" />
        </Grid>
      </Section>

      <Section label="No step numbers">
        <Stepper steps={STEPS} activeStep={2} showNumbers={false} />
      </Section>

      <Section label="Interactive">
        <Col>
          <Stepper steps={STEPS} activeStep={activeStep} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="outlined"
              size="sm"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
            >
              Back
            </Button>
            <Button
              size="sm"
              disabled={activeStep === STEPS.length}
              onClick={() => setActiveStep((s) => Math.min(STEPS.length, s + 1))}
            >
              {activeStep === STEPS.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </Col>
      </Section>
    </Col>
  );
};
