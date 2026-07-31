import { useState } from 'react';
import { Checkbox } from '../../../src/components/Checkbox';
import { Section, Grid, Col, Row } from '../shared/Section';

export const CheckboxShowcase = () => {
  const [checked, setChecked] = useState(false);

  return (
    <Col>
      <Grid cols={3}>
        <Section label="Basic">
          <Col gap="0.75rem">
            <Checkbox label="Unchecked" />
            <Checkbox label="Checked" defaultChecked />
            <Checkbox label="Indeterminate" indeterminate />
          </Col>
        </Section>

        <Section label="States">
          <Col gap="0.75rem">
            <Checkbox label="Disabled" disabled />
            <Checkbox label="Disabled checked" disabled defaultChecked />
            <Checkbox label="With error" error="This field is required" />
          </Col>
        </Section>

        <Section label="Controlled">
          <Col gap="0.75rem">
            <Checkbox
              label={`Controlled: ${checked ? 'on' : 'off'}`}
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
          </Col>
        </Section>
      </Grid>

      <Grid cols={2}>
        <Section label="Sizes">
          <Row>
            <Checkbox label="Small" size="small" defaultChecked />
            <Checkbox label="Medium" size="medium" defaultChecked />
            <Checkbox label="Large" size="large" defaultChecked />
          </Row>
        </Section>

        <Section label="Colors">
          <Row>
            <Checkbox label="Primary" color="primary" defaultChecked />
            <Checkbox label="Secondary" color="secondary" defaultChecked />
            <Checkbox label="Success" color="success" defaultChecked />
            <Checkbox label="Danger" color="danger" defaultChecked />
          </Row>
        </Section>
      </Grid>
    </Col>
  );
};
