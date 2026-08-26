import { Spinner } from '../../../src/components/Spinner';
import { Section, Col, Row } from '../shared/Section';

export const SpinnerShowcase = () => (
  <Col>
    <Section label="Sizes">
      <Row>
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
      </Row>
    </Section>

    <Section label="Colors">
      <Row>
        <Spinner color="primary" />
        <Spinner color="secondary" />
        <Spinner color="success" />
        <Spinner color="danger" />
        <Spinner color="warning" />
        <Spinner color="info" />
      </Row>
    </Section>
  </Col>
);
