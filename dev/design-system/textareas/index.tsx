import { Textarea } from '../../../src/components/Textarea';
import { Section, Grid, Col } from '../shared/Section';

export const TextareaShowcase = () => (
  <Col>
    <Grid cols={3}>
      <Section label="Variants">
        <Col gap="0.75rem">
          <Textarea variant="filled" placeholder="Filled variant" />
          <Textarea variant="outlined" placeholder="Outlined variant" />
          <Textarea variant="text" placeholder="Text variant" />
        </Col>
      </Section>

      <Section label="States">
        <Col gap="0.75rem">
          <Textarea placeholder="Default" />
          <Textarea placeholder="Disabled" disabled />
          <Textarea placeholder="Loading…" loading />
          <Textarea placeholder="With error" error="This field is required" />
        </Col>
      </Section>

      <Section label="With Label">
        <Col gap="0.75rem">
          <Textarea label="Description" placeholder="Enter a description…" />
          <Textarea label="Required field" placeholder="Cannot be empty" required />
          <Textarea label="Notes" placeholder="With error" error="Please add a note" />
        </Col>
      </Section>
    </Grid>

    <Grid cols={2}>
      <Section label="Character Count">
        <Textarea
          label="Bio"
          placeholder="Tell us about yourself…"
          showCount
          maxLength={200}
          rows={4}
        />
      </Section>

      <Section label="Resize">
        <Col gap="0.75rem">
          <Textarea placeholder="Vertical resize (default)" resize="vertical" rows={3} />
          <Textarea placeholder="No resize" resize="none" rows={3} />
          <Textarea placeholder="Both directions" resize="both" rows={3} />
        </Col>
      </Section>
    </Grid>

    <Section label="Full Width">
      <Textarea label="Full width textarea" placeholder="Spans the full container width" fullWidth rows={3} />
    </Section>
  </Col>
);
