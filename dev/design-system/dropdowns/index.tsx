import { ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { Dropdown } from '../../../src/components/Dropdown';
import { Button } from '../../../src/components/Button';
import { Section, Row, Col } from '../shared/Section';

const menuItemStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '0.875rem',
};

const separatorStyle: React.CSSProperties = {
  height: '1px',
  background: '#e2e8f0',
  margin: '0.25rem 0',
};

export const DropdownShowcase = () => (
  <Col>
    <Section label="Basic Menu">
      <Dropdown
        trigger={
          <Button variant="outlined" posIcon={ChevronDown}>
            User Menu
          </Button>
        }
        content={
          <div style={{ minWidth: '200px' }}>
            <div style={menuItemStyle} onClick={() => alert('Profile clicked')}>
              <User size={16} />
              <span>Profile</span>
            </div>
            <div style={menuItemStyle} onClick={() => alert('Settings clicked')}>
              <Settings size={16} />
              <span>Settings</span>
            </div>
            <div style={separatorStyle} />
            <div
              style={{ ...menuItemStyle, color: 'var(--danger-color)' }}
              onClick={() => alert('Logout clicked')}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </div>
          </div>
        }
      />
    </Section>

    <Section label="Placements">
      <Row>
        <Dropdown
          placement="top"
          trigger={<Button variant="filled" size="small">Top</Button>}
          content={<div style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>Opens above</div>}
        />
        <Dropdown
          placement="bottom"
          trigger={<Button variant="filled" size="small">Bottom</Button>}
          content={<div style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>Opens below</div>}
        />
        <Dropdown
          placement="left"
          trigger={<Button variant="filled" size="small">Left</Button>}
          content={<div style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>Opens to the left</div>}
        />
        <Dropdown
          placement="right"
          trigger={<Button variant="filled" size="small">Right</Button>}
          content={<div style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>Opens to the right</div>}
        />
      </Row>
    </Section>

    <Section label="Grouped (Mutual Exclusion)">
      <Row>
        <Dropdown
          dropdownGroup="demo"
          trigger={<Button variant="outlined">Section A</Button>}
          content={
            <div style={{ padding: '0.75rem 1rem', minWidth: '180px', fontSize: '0.875rem' }}>
              Content for Section A
            </div>
          }
        />
        <Dropdown
          dropdownGroup="demo"
          trigger={<Button variant="outlined">Section B</Button>}
          content={
            <div style={{ padding: '0.75rem 1rem', minWidth: '180px', fontSize: '0.875rem' }}>
              Content for Section B
            </div>
          }
        />
        <Dropdown
          dropdownGroup="demo"
          trigger={<Button variant="outlined">Section C</Button>}
          content={
            <div style={{ padding: '0.75rem 1rem', minWidth: '180px', fontSize: '0.875rem' }}>
              Content for Section C
            </div>
          }
        />
      </Row>
    </Section>
  </Col>
);
