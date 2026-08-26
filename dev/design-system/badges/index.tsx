import { Badge } from '../../../src/components/Badge';
import { Chip } from '../../../src/components/Chip';
import { Section, Grid, Col, Row } from '../shared/Section';

const COLORS = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'] as const;

export const BadgeShowcase = () => (
  <Col>
    <Grid cols={3}>
      <Section label="Variants">
        <Row>
          <Badge variant="filled" color="primary">Filled</Badge>
          <Badge variant="outlined" color="primary">Outlined</Badge>
          <Badge variant="text" color="primary">Text</Badge>
        </Row>
      </Section>

      <Section label="Colors - Filled">
        <Row>
          {COLORS.map((c) => <Badge key={c} color={c}>{c}</Badge>)}
        </Row>
      </Section>

      <Section label="Colors - Soft">
        <Row>
          {COLORS.map((c) => <Badge key={c} color={c} variant="text">{c}</Badge>)}
        </Row>
      </Section>
    </Grid>

    <Grid cols={3}>
      <Section label="Dot">
        <Row>
          {COLORS.map((c) => <Badge key={c} color={c} dot />)}
        </Row>
      </Section>

      <Section label="Sizes">
        <Row>
          <Badge size="sm">Small</Badge>
          <Badge size="md">Medium</Badge>
        </Row>
      </Section>

      <Section label="Numeric with max">
        <Row>
          <Badge color="danger">1</Badge>
          <Badge color="danger">5</Badge>
          <Badge color="danger" max={99}>{99}</Badge>
          <Badge color="danger" max={99}>{150}</Badge>
        </Row>
      </Section>
    </Grid>

    <Section label="Inline with other components">
      <Row>
        <Chip color="primary">Messages <Badge color="danger" size="sm">3</Badge></Chip>
        <Chip color="secondary">Alerts <Badge color="warning" size="sm" variant="text">12</Badge></Chip>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
          Notifications <Badge color="primary" dot />
        </span>
      </Row>
    </Section>
  </Col>
);
