import { Tag, Check } from 'lucide-react';
import { Chip } from '../../../src/components/Chip';
import { Section, Row, Grid } from '../shared/Section';

export const ChipShowcase = () => (
  <Grid cols={3}>
    <Section label="Variants">
      <Row>
        <Chip variant="filled">Filled</Chip>
        <Chip variant="outlined">Outlined</Chip>
        <Chip variant="text">Text</Chip>
      </Row>
    </Section>

    <Section label="Colors">
      <Row>
        <Chip color="primary">Primary</Chip>
        <Chip color="secondary">Secondary</Chip>
        <Chip color="success">Success</Chip>
        <Chip color="danger">Danger</Chip>
        <Chip color="warning">Warning</Chip>
        <Chip color="info">Info</Chip>
      </Row>
    </Section>

    <Section label="Sizes">
      <Row>
        <Chip size="small">Small</Chip>
        <Chip size="medium">Medium</Chip>
        <Chip size="large">Large</Chip>
      </Row>
    </Section>

    <div style={{ gridColumn: '1 / -1' }}>
      <Section label="Icons">
        <Row>
          <Chip preIcon={Tag}>Tag Label</Chip>
          <Chip posIcon={Check}>Verified</Chip>
          <Chip preIcon={Tag} posIcon={Check}>Tagged & Verified</Chip>
        </Row>
      </Section>
    </div>

    <div style={{ gridColumn: '1 / -1' }}>
      <Section label="Interactive">
        <Row>
          <Chip onClick={() => alert('Chip clicked!')}>Clickable</Chip>
          <Chip onRemove={() => alert('Chip removed!')}>Removable</Chip>
          <Chip
            color="secondary"
            onClick={() => alert('Chip clicked!')}
            onRemove={() => alert('Chip removed!')}
          >
            Click & Remove
          </Chip>
        </Row>
      </Section>
    </div>

    <div style={{ gridColumn: '1 / -1' }}>
      <Section label="States">
        <Row>
          <Chip disabled>Disabled Filled</Chip>
          <Chip disabled variant="outlined">Disabled Outlined</Chip>
          <Chip tooltip="This chip provides additional context on hover.">With Tooltip</Chip>
        </Row>
      </Section>
    </div>
  </Grid>
);
