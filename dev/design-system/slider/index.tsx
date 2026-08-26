import { Slider } from '../../../src/components/Slider';
import { Section, Grid, Col } from '../shared/Section';

export const SliderShowcase = () => (
  <Col>
    <Grid cols={2}>
      <Section label="Default">
        <Slider defaultValue={40} showValue label="Volume" />
      </Section>

      <Section label="With min/max labels">
        <Slider defaultValue={65} showValue showMinMax label="Price range" min={0} max={1000} step={10} />
      </Section>
    </Grid>

    <Section label="Colors">
      <Col gap="1.25rem">
        {(['primary', 'secondary', 'success', 'danger'] as const).map((color) => (
          <Slider key={color} defaultValue={60} color={color} label={color} showValue />
        ))}
      </Col>
    </Section>

    <Section label="Sizes">
      <Col gap="1.25rem">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Slider key={size} defaultValue={50} size={size} label={size} />
        ))}
      </Col>
    </Section>

    <Grid cols={2}>
      <Section label="Disabled">
        <Slider value={30} disabled label="Disabled slider" showValue />
      </Section>

      <Section label="Fine-grained steps">
        <Slider defaultValue={0.5} min={0} max={1} step={0.01} showValue label="Opacity" showMinMax />
      </Section>
    </Grid>
  </Col>
);
