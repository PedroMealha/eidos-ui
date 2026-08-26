import { Progress } from '../../../src/components/Progress';
import { Section, Grid, Col } from '../shared/Section';

const COLORS = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'] as const;

export const ProgressShowcase = () => (
  <Col>
    <Section label="Determinate">
      <Col gap="0.75rem">
        <Progress value={0} showLabel />
        <Progress value={25} showLabel />
        <Progress value={50} showLabel />
        <Progress value={75} showLabel />
        <Progress value={100} showLabel color="success" />
      </Col>
    </Section>

    <Section label="Indeterminate">
      <Col gap="0.75rem">
        <Progress />
        <Progress color="secondary" />
      </Col>
    </Section>

    <Grid cols={2}>
      <Section label="Sizes">
        <Col gap="1rem">
          <div>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.375rem' }}>Small</p>
            <Progress value={60} size="sm" />
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.375rem' }}>Medium</p>
            <Progress value={60} size="md" />
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.375rem' }}>Large</p>
            <Progress value={60} size="lg" />
          </div>
        </Col>
      </Section>

      <Section label="Striped">
        <Col gap="0.75rem">
          <Progress value={40} striped />
          <Progress value={65} striped color="success" />
          <Progress value={80} striped color="warning" />
        </Col>
      </Section>
    </Grid>

    <Section label="Colors">
      <Col gap="0.75rem">
        {COLORS.map((c) => (
          <Progress key={c} value={70} color={c} showLabel label={c} />
        ))}
      </Col>
    </Section>
  </Col>
);
