import { useState } from 'react';
import { Drawer } from '../../../src/components/Drawer';
import { Button } from '../../../src/components/Button';
import type { DrawerPlacement, DrawerSize } from '../../../src/components/Drawer';
import { Section, Grid, Col } from '../shared/Section';

export const DrawerShowcase = () => {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<DrawerPlacement>('right');
  const [size, setSize] = useState<DrawerSize>('medium');

  return (
    <Col>
      <Grid cols={2}>
        <Section label="Placements">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(['left', 'right', 'top', 'bottom'] as const).map((p) => (
              <Button
                key={p}
                size="small"
                variant="outlined"
                onClick={() => { setPlacement(p); setSize('medium'); setOpen(true); }}
              >
                {p}
              </Button>
            ))}
          </div>
        </Section>

        <Section label="Sizes (right)">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(['small', 'medium', 'large', 'full'] as const).map((s) => (
              <Button
                key={s}
                size="small"
                variant="outlined"
                onClick={() => { setPlacement('right'); setSize(s); setOpen(true); }}
              >
                {s}
              </Button>
            ))}
          </div>
        </Section>
      </Grid>

      <Grid cols={2}>
        <Section label="With actions">
          <Button
            onClick={() => { setPlacement('right'); setSize('medium'); setOpen(true); }}
          >
            Open with actions
          </Button>
        </Section>

        <Section label="Bottom sheet">
          <Button
            variant="outlined"
            onClick={() => { setPlacement('bottom'); setSize('small'); setOpen(true); }}
          >
            Open bottom sheet
          </Button>
        </Section>
      </Grid>

      <Drawer
        isOpen={open}
        onClose={() => setOpen(false)}
        placement={placement}
        size={size}
        title={`${placement.charAt(0).toUpperCase() + placement.slice(1)} drawer - ${size}`}
        actions={[
          { id: 'cancel', label: 'Cancel', variant: 'text', onClick: () => setOpen(false) },
          { id: 'confirm', label: 'Confirm', variant: 'filled', color: 'primary', onClick: () => setOpen(false) },
        ]}
      >
        <p>Drawer content goes here. This can be any React node - forms, lists, navigation, detail panels.</p>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          Current: <strong>{placement}</strong> placement, <strong>{size}</strong> size.
        </p>
      </Drawer>
    </Col>
  );
};
