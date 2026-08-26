import { useState } from 'react';
import { NumberInput } from '../../../src/components/NumberInput';
import { Section, Col, Row, Grid } from '../shared/Section';

export const NumberInputShowcase = () => {
  const [controlled, setControlled] = useState(5);

  return (
    <Col>
      <Section label="Default (uncontrolled)">
        <NumberInput defaultValue={0} min={0} max={100} />
      </Section>

      <Section label="Controlled with min/max">
        <Col>
          <NumberInput
            label="Quantity"
            value={controlled}
            onChange={setControlled}
            min={1}
            max={10}
            helperText={`Value: ${controlled}`}
          />
        </Col>
      </Section>

      <Section label="Decimal precision">
        <Row>
          <NumberInput defaultValue={1.5} step={0.1} precision={1} label="Step 0.1" min={0} max={10} />
          <NumberInput defaultValue={3.14} step={0.01} precision={2} label="Step 0.01" min={0} max={20} />
        </Row>
      </Section>

      <Section label="Sizes">
        <Row>
          <NumberInput size="sm"  defaultValue={0} label="Small" />
          <NumberInput size="md" defaultValue={0} label="Medium" />
          <NumberInput size="lg"  defaultValue={0} label="Large" />
        </Row>
      </Section>

      <Section label="States">
        <Grid cols={2}>
          <NumberInput label="Error" error errorMessage="Value out of range" defaultValue={0} />
          <NumberInput label="Disabled" disabled defaultValue={42} />
          <NumberInput label="Read only" readOnly defaultValue={99} />
          <NumberInput label="No typing" allowTyping={false} defaultValue={5} min={0} max={20} />
        </Grid>
      </Section>

      <Section label="Full width">
        <NumberInput fullWidth label="Seats" defaultValue={1} min={1} max={50} helperText="Max 50 seats per plan" />
      </Section>
    </Col>
  );
};
