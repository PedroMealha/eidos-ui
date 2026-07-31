import { Card } from '../../../src/components/Card';
import { Grid, Col, Row } from '../shared/Section';

export const CardShowcase = () => (
  <Col>
    <Grid cols={3}>
      <Card variant="outlined" padding="md">
        <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: '#09090b', marginBottom: '0.25rem' }}>Outlined</p>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#71717a' }}>Border, no shadow. Default variant.</p>
      </Card>
      <Card variant="elevated" padding="md">
        <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: '#09090b', marginBottom: '0.25rem' }}>Elevated</p>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#71717a' }}>Drop shadow, no border.</p>
      </Card>
      <Card variant="flat" padding="md">
        <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: '#09090b', marginBottom: '0.25rem' }}>Flat</p>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#71717a' }}>No border, no shadow. Bare surface.</p>
      </Card>
    </Grid>

    <Grid cols={4}>
      {(['none', 'sm', 'md', 'lg'] as const).map((p) => (
        <Card key={p} padding={p}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            padding="{p}"
          </p>
        </Card>
      ))}
    </Grid>

    <Card variant="outlined" padding="md" clickable onClick={() => {}}>
      <Row>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#09090b', marginBottom: '0.25rem' }}>Clickable card</p>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#71717a' }}>Hover to see interactive styles. Use <code>onClick</code> + <code>clickable</code> props.</p>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>→</span>
      </Row>
    </Card>

    <Grid cols={2}>
      <Card as="article" variant="outlined" padding="md">
        <p style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', fontWeight: 600, color: '#09090b' }}>Semantic: &lt;article&gt;</p>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#71717a' }}>Use the <code>as</code> prop to render as any HTML element for proper semantics.</p>
      </Card>
      <Card as="section" variant="elevated" padding="md">
        <p style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', fontWeight: 600, color: '#09090b' }}>Semantic: &lt;section&gt;</p>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#71717a' }}>Elevated variant on a <code>&lt;section&gt;</code> element.</p>
      </Card>
    </Grid>
  </Col>
);
