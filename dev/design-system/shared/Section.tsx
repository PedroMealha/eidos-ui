import { Card } from '../../../src/components/Card';

interface SectionProps {
  label: string;
  children: React.ReactNode;
}

const labelStyle: React.CSSProperties = {
  marginBottom: '0.625rem',
  fontSize: '0.7rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: '#94a3b8',
};

export const Section = ({ label, children }: SectionProps) => (
  <Card variant="outlined" padding="md">
    <p style={labelStyle}>{label}</p>
    {children}
  </Card>
);

export const Row = ({ children, wrap = true }: { children: React.ReactNode; wrap?: boolean }) => (
  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: wrap ? 'wrap' : 'nowrap', alignItems: 'center' }}>
    {children}
  </div>
);

export const Col = ({ children, gap = '1rem' }: { children: React.ReactNode; gap?: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>
    {children}
  </div>
);

export const Grid = ({ children, cols = 3 }: { children: React.ReactNode; cols?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: '1rem' }}>
    {children}
  </div>
);
