import { Divider } from '../../../src/components/Divider';
import { Section, Grid } from '../shared/Section';

export const DividerShowcase = () => (
  <Grid cols={3}>
    <Section label="Horizontal">
      <div>
        <div style={{ padding: '0.5rem 0', color: '#64748b', fontSize: '0.875rem' }}>Above</div>
        <Divider direction="horizontal" />
        <div style={{ padding: '0.5rem 0', color: '#64748b', fontSize: '0.875rem' }}>Below</div>
      </div>
    </Section>

    <Section label="Vertical">
      <div style={{ display: 'flex', alignItems: 'center', height: '60px', gap: '1rem' }}>
        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Left</span>
        <Divider direction="vertical" />
        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Right</span>
      </div>
    </Section>

    <Section label="In a List">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--gray-300)',
          borderRadius: 'var(--border-radius-md)',
        }}
      >
        <div style={{ padding: '0.625rem 0.875rem', fontSize: '0.875rem' }}>Item 1</div>
        <Divider />
        <div style={{ padding: '0.625rem 0.875rem', fontSize: '0.875rem' }}>Item 2</div>
        <Divider />
        <div style={{ padding: '0.625rem 0.875rem', fontSize: '0.875rem' }}>Item 3</div>
      </div>
    </Section>
  </Grid>
);
