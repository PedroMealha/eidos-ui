import { Skeleton } from '../../../src/components/Skeleton';
import { Section, Grid, Col, Row } from '../shared/Section';

export const SkeletonShowcase = () => (
  <Col>
    <Grid cols={2}>
      <Section label="Text variants">
        <Col gap="1rem">
          <div>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Single line</p>
            <Skeleton variant="text" />
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>Multi-line (4)</p>
            <Skeleton variant="text" lines={4} />
          </div>
        </Col>
      </Section>

      <Section label="Shape variants">
        <Row>
          <Skeleton variant="circular" width={48} height={48} />
          <Skeleton variant="rectangular" width={80} height={80} />
          <Skeleton variant="rounded" width={80} height={80} />
        </Row>
      </Section>
    </Grid>

    <Grid cols={2}>
      <Section label="Animation: Wave (default)">
        <Col gap="0.5rem">
          <Skeleton variant="text" animation="wave" />
          <Skeleton variant="text" animation="wave" width="80%" />
          <Skeleton variant="text" animation="wave" width="60%" />
        </Col>
      </Section>

      <Section label="Animation: Pulse">
        <Col gap="0.5rem">
          <Skeleton variant="text" animation="pulse" />
          <Skeleton variant="text" animation="pulse" width="80%" />
          <Skeleton variant="text" animation="pulse" width="60%" />
        </Col>
      </Section>
    </Grid>

    <Grid cols={2}>
      <Section label="Card placeholder">
        <Col gap="0.75rem">
          <Skeleton variant="rounded" height={160} />
          <Row>
            <Skeleton variant="circular" width={40} height={40} />
            <div style={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" />
              <div style={{ marginTop: '0.375rem' }}>
                <Skeleton variant="text" width="40%" />
              </div>
            </div>
          </Row>
          <Skeleton variant="text" lines={3} />
        </Col>
      </Section>

      <Section label="List placeholder">
        <Col gap="0.75rem">
          {Array.from({ length: 4 }).map((_, i) => (
            <Row key={i}>
              <Skeleton variant="circular" width={36} height={36} />
              <div style={{ flex: 1 }}>
                <Skeleton variant="text" width="70%" />
                <div style={{ marginTop: '0.25rem' }}>
                  <Skeleton variant="text" width="50%" />
                </div>
              </div>
            </Row>
          ))}
        </Col>
      </Section>
    </Grid>
  </Col>
);
