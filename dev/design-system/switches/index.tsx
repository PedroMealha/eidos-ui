import { useState } from 'react';
import { Switch } from '../../../src/components/Switch';
import { Section, Grid, Col, Row } from '../shared/Section';

export const SwitchShowcase = () => {
  const [controlled, setControlled] = useState(false);

  return (
    <Col>
      <Grid cols={3}>
        <Section label="Basic">
          <Col gap="0.75rem">
            <Switch label="Off by default" />
            <Switch label="On by default" defaultChecked />
            <Switch label="Label on left" labelPosition="left" defaultChecked />
          </Col>
        </Section>

        <Section label="States">
          <Col gap="0.75rem">
            <Switch label="Disabled off" disabled />
            <Switch label="Disabled on" disabled defaultChecked />
            <Switch
              label={`Controlled: ${controlled ? 'on' : 'off'}`}
              checked={controlled}
              onChange={(e) => setControlled(e.target.checked)}
            />
          </Col>
        </Section>

        <Section label="Colors">
          <Col gap="0.75rem">
            <Switch label="Primary" color="primary" defaultChecked />
            <Switch label="Secondary" color="secondary" defaultChecked />
            <Switch label="Success" color="success" defaultChecked />
            <Switch label="Danger" color="danger" defaultChecked />
          </Col>
        </Section>
      </Grid>

      <Section label="Sizes">
        <Row>
          <Switch label="Small" size="small" defaultChecked />
          <Switch label="Medium" size="medium" defaultChecked />
          <Switch label="Large" size="large" defaultChecked />
        </Row>
      </Section>
    </Col>
  );
};
