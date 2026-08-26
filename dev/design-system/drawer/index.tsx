import { useState } from 'react';
import { Drawer } from '../../../src/components/Drawer';
import { Button } from '../../../src/components/Button';
import type { DrawerPlacement, DrawerSize } from '../../../src/components/Drawer';
import { Section, Grid, Col, Row } from '../shared/Section';

export const DrawerShowcase = () => {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<DrawerPlacement>('right');
  const [size, setSize] = useState<DrawerSize>('md');

  return (
    <Col>
      <Grid cols={2}>
        <Section label="Placements">
          <Row>
            {(['left', 'right', 'top', 'bottom'] as const).map((p) => (
              <Button
                key={p}
                size="sm"
                variant="outlined"
                onClick={() => { setPlacement(p); setSize('md'); setOpen(true); }}
              >
                {p}
              </Button>
            ))}
          </Row>
        </Section>

        <Section label="Sizes (right)">
          <Row>
            {(['sm', 'md', 'lg', 'full'] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant="outlined"
                onClick={() => { setPlacement('right'); setSize(s); setOpen(true); }}
              >
                {s}
              </Button>
            ))}
          </Row>
        </Section>
      </Grid>

      <Grid cols={2}>
        <Section label="With actions">
          <Button
            onClick={() => { setPlacement('right'); setSize('md'); setOpen(true); }}
          >
            Open with actions
          </Button>
        </Section>

        <Section label="Bottom sheet">
          <Button
            variant="outlined"
            onClick={() => { setPlacement('bottom'); setSize('sm'); setOpen(true); }}
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
