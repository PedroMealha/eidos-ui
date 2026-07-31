import { Download, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Button, IconButton } from '../../../src/components/Button';
import { Section, Row, Grid } from '../shared/Section';

export const ButtonShowcase = () => (
  <Grid cols={3}>
    <Section label="Variants">
      <Row>
        <Button variant="filled">Filled</Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="text">Text</Button>
      </Row>
    </Section>

    <Section label="Colors">
      <Row>
        <Button color="primary">Primary</Button>
        <Button color="secondary">Secondary</Button>
        <Button color="success">Success</Button>
        <Button color="danger">Danger</Button>
      </Row>
    </Section>

    <Section label="Sizes">
      <Row>
        <Button size="small">Small</Button>
        <Button size="medium">Medium</Button>
        <Button size="large">Large</Button>
      </Row>
    </Section>

    <div style={{ gridColumn: '1 / -1' }}>
      <Section label="Icons">
        <Row>
          <Button preIcon={Download}>Download</Button>
          <Button posIcon={ArrowRight}>Continue</Button>
          <Button icon={Plus} tooltip="Add item" />
          <IconButton icon={Trash2} color="danger" variant="outlined" tooltip="Delete item" />
        </Row>
      </Section>
    </div>

    <div style={{ gridColumn: '1 / -1' }}>
      <Section label="States">
        <Row>
          <Button disabled>Disabled</Button>
          <Button variant="outlined" disabled>Disabled Outlined</Button>
          <Button loading>Loading</Button>
          <Button loading loadingText="Saving...">Save</Button>
          <Button tooltip="This action cannot be undone.">With Tooltip</Button>
        </Row>
      </Section>
    </div>
  </Grid>
);
