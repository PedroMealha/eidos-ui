import type { Meta, StoryObj } from '@storybook/react';
import { ChevronDown, Settings, User, LogOut, HelpCircle } from 'lucide-react';
import { Dropdown } from './Dropdown.component';
import { Button } from '../Button';

const meta = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible dropdown that positions its content relative to a trigger element. Works standalone by default. To enable **mutual exclusion** between multiple dropdowns (only one open at a time), wrap them with `DropdownProvider` and use the `dropdownGroup` prop.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    trigger: undefined,
    content: undefined,
  },
  argTypes: {
    trigger: {
      control: false,
      description: 'The element that triggers the dropdown (e.g., button, text, icon)',
      table: { type: { summary: 'React.ReactNode' } },
    },
    content: {
      control: false,
      description: 'The content to display in the dropdown',
      table: { type: { summary: 'React.ReactNode' } },
    },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Preferred placement of the dropdown (auto-adjusts if no space)',
      table: { type: { summary: '"top" | "bottom" | "left" | "right"' }, defaultValue: { summary: 'bottom' } },
    },
    delay: {
      control: 'number',
      description: 'Delay in milliseconds before showing the dropdown',
      table: { type: { summary: 'number' }, defaultValue: { summary: '0' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the dropdown trigger',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    closeOnClickOutside: {
      control: 'boolean',
      description: 'Close dropdown when clicking outside',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Close dropdown when pressing Escape key',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    autoWidth: {
      control: 'boolean',
      description: 'Match dropdown width to trigger width',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    minWidth: {
      control: 'text',
      description: 'Minimum width of dropdown (number in px or string with units)',
      table: { type: { summary: 'number | string' }, defaultValue: { summary: 'undefined' } },
    },
    maxWidth: {
      control: 'text',
      description: 'Maximum width of dropdown (number in px, string with units, or "auto")',
      table: { type: { summary: 'number | string | "auto"' }, defaultValue: { summary: 'undefined' } },
    },
    minHeight: {
      control: 'text',
      description: 'Minimum height of dropdown',
      table: { type: { summary: 'number | string' }, defaultValue: { summary: 'undefined' } },
    },
    maxHeight: {
      control: 'text',
      description: 'Maximum height of dropdown',
      table: { type: { summary: 'number | string | "auto"' }, defaultValue: { summary: 'undefined' } },
    },
    triggerClassName: {
      control: 'text',
      description: 'Additional CSS class for trigger element',
      table: { type: { summary: 'string' }, defaultValue: { summary: '""' } },
    },
    contentClassName: {
      control: 'text',
      description: 'Additional CSS class for dropdown content',
      table: { type: { summary: 'string' }, defaultValue: { summary: '""' } },
    },
    isNested: {
      control: 'boolean',
      description: 'Whether this is a nested dropdown (affects z-index)',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    dropdownGroup: {
      control: 'text',
      description: 'Group identifier - only one dropdown in a group can be open at a time',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
    },
    className: { table: { disable: true } },
    triggerRef: { table: { disable: true } },
    dropdownLevel: { table: { disable: true } },
    parentDropdownId: { table: { disable: true } },
    onNestedDropdownOpen: { table: { disable: true } },
    onNestedDropdownClose: { table: { disable: true } },
  },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: <Button variant="outlined">Open Dropdown</Button>,
    content: (
      <div style={{ padding: '1rem', minWidth: '200px' }}>
        <p>Dropdown content goes here!</p>
      </div>
    ),
  },
};

export const Examples = {
  render: () => {
    const label: React.CSSProperties = {
      marginBottom: '0.625rem',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      color: '#94a3b8',
    };

    return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', padding: '1.5rem' }}>
      <div>
        <p style={label}>Basic Menu</p>
        <Dropdown
          trigger={
            <Button variant="outlined" posIcon={ChevronDown}>
              User Menu
            </Button>
          }
          content={
            <div style={{ minWidth: '200px' }}>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onClick={() => alert('Profile clicked')}
              >
                <User size={16} />
                <span>Profile</span>
              </div>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onClick={() => alert('Settings clicked')}
              >
                <Settings size={16} />
                <span>Settings</span>
              </div>
              <div style={{ height: '1px', background: 'var(--gray-200)', margin: '0.5rem 0' }} />
              <div
                style={{
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--danger)',
                }}
                onClick={() => alert('Logout clicked')}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </div>
            </div>
          }
        />
      </div>

      <div>
        <p style={label}>Placements</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Dropdown
            placement="top"
            trigger={<Button variant="filled">Top</Button>}
            content={<div style={{ padding: '1rem' }}>Top placement</div>}
          />
          <Dropdown
            placement="bottom"
            trigger={<Button variant="filled">Bottom</Button>}
            content={<div style={{ padding: '1rem' }}>Bottom placement</div>}
          />
          <Dropdown
            placement="left"
            trigger={<Button variant="filled">Left</Button>}
            content={<div style={{ padding: '1rem' }}>Left placement</div>}
          />
          <Dropdown
            placement="right"
            trigger={<Button variant="filled">Right</Button>}
            content={<div style={{ padding: '1rem' }}>Right placement</div>}
          />
        </div>
      </div>

      <div>
        <p style={label}>Sizing</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Dropdown
            trigger={<Button variant="outlined">Min Width 300px</Button>}
            content={<div style={{ padding: '1rem' }}>This dropdown has a minimum width of 300px</div>}
            minWidth={300}
          />
          <Dropdown
            trigger={<Button variant="outlined">Max Height 150px</Button>}
            content={
              <div style={{ padding: '1rem' }}>
                <p>This dropdown has scrollable content</p>
                <p>Line 1</p>
                <p>Line 2</p>
                <p>Line 3</p>
                <p>Line 4</p>
                <p>Line 5</p>
                <p>Line 6</p>
              </div>
            }
            maxHeight={150}
          />
        </div>
      </div>

      <div>
        <p style={label}>With Delay</p>
        <Dropdown
          delay={500}
          trigger={<Button variant="outlined">Click me (500ms delay)</Button>}
          content={<div style={{ padding: '1rem' }}>This appeared after a delay!</div>}
        />
      </div>

      <div>
        <p style={label}>Grouped (mutual exclusion)</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Dropdown
            dropdownGroup="actions"
            trigger={<Button variant="filled" color="primary">Action 1</Button>}
            content={<div style={{ padding: '1rem', minWidth: '150px' }}>Dropdown 1 content</div>}
          />
          <Dropdown
            dropdownGroup="actions"
            trigger={<Button variant="filled" color="secondary">Action 2</Button>}
            content={<div style={{ padding: '1rem', minWidth: '150px' }}>Dropdown 2 content</div>}
          />
          <Dropdown
            dropdownGroup="actions"
            trigger={<Button variant="filled" color="success">Action 3</Button>}
            content={<div style={{ padding: '1rem', minWidth: '150px' }}>Dropdown 3 content</div>}
          />
        </div>
      </div>

      <div>
        <p style={label}>Custom Trigger</p>
        <Dropdown
          trigger={
            <div style={{
              padding: '0.5rem 1rem',
              border: '1px solid var(--gray-300)',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <HelpCircle size={16} />
              <span>Need Help?</span>
            </div>
          }
          content={
            <div style={{ padding: '1rem', maxWidth: '250px' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Help Center</h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                Click here to access documentation, tutorials, and support resources.
              </p>
            </div>
          }
        />
      </div>
    </div>
    );
  },
};

