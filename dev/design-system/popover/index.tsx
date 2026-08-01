import { Popover } from '../../../src/components/Popover';
import { Button } from '../../../src/components/Button';
import { Section, Grid, Col, Row } from '../shared/Section';

export const PopoverShowcase = () => (
  <Col>
    <Section label="Basic">
      <Row>
        <Popover trigger={<Button>Open popover</Button>}>
          <p style={{ margin: 0 }}>This is a simple popover with just body content. Click outside or press Escape to dismiss.</p>
        </Popover>
      </Row>
    </Section>

    <Section label="With title + close button">
      <Row>
        <Popover
          trigger={<Button variant="outlined">With title</Button>}
          title="More information"
          showCloseButton
        >
          <p style={{ margin: 0 }}>Popovers can have an optional title and a close button in the header for easy dismissal.</p>
        </Popover>
      </Row>
    </Section>

    <Grid cols={2}>
      <Section label="Placements">
        <Row>
          {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
            <Popover key={placement} placement={placement} trigger={<Button size="small" variant="outlined">{placement}</Button>} title={placement}>
              <p style={{ margin: 0 }}>Preferred placement: <strong>{placement}</strong>. Flips automatically when it doesn't fit.</p>
            </Popover>
          ))}
        </Row>
      </Section>

      <Section label="Rich content">
        <Popover
          trigger={<Button variant="outlined">User settings</Button>}
          title="Quick settings"
          showCloseButton
          maxWidth={280}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span>Notifications</span>
              <input type="checkbox" defaultChecked />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span>Dark mode</span>
              <input type="checkbox" />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span>Compact view</span>
              <input type="checkbox" />
            </label>
          </div>
        </Popover>
      </Section>
    </Grid>

    <Section label="Disabled">
      <Row>
        <Popover trigger={<Button disabled>Disabled trigger</Button>} disabled>
          <p style={{ margin: 0 }}>This won't show.</p>
        </Popover>
      </Row>
    </Section>
  </Col>
);
