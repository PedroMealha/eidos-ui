import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination } from './Pagination.component';

// ============================================================================
// Meta
// ============================================================================

const meta = {
  title: 'Navigation/Pagination',
  component: Pagination,
  parameters: { layout: 'centered' },
  argTypes: {
    page: {
      control: 'number',
      description: 'Current page (1-based).',
      table: { type: { summary: 'number' } },
    },
    totalPages: {
      control: 'number',
      description: 'Total number of pages.',
      table: { type: { summary: 'number' } },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger'],
      description: 'Color of the active page button.',
      table: {
        type: { summary: '"primary" | "secondary" | "success" | "danger"' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of page buttons.',
      table: {
        type: { summary: '"small" | "medium" | "large"' },
        defaultValue: { summary: 'medium' },
      },
    },
    siblingCount: {
      control: 'number',
      description: 'How many page number buttons to show around the current page.',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '2' },
      },
    },
    showFirstLast: {
      control: 'boolean',
      description: 'Show first/last page jump buttons.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onChange: { table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT — controlled with useState
// ============================================================================

export const Default: Story = {
  render: (args) => {
    const [page, setPage] = React.useState(1);
    return <Pagination {...args} page={page} onChange={setPage} />;
  },
  args: {
    page: 1,
    totalPages: 10,
    onChange: () => {},
    color: 'primary',
    size: 'medium',
    siblingCount: 2,
    showFirstLast: true,
    disabled: false,
  },
};

// ============================================================================
// MANY PAGES — ellipsis on both sides
// ============================================================================

export const ManyPages: Story = {
  render: (args) => {
    const [page, setPage] = React.useState(25);
    return <Pagination {...args} page={page} onChange={setPage} />;
  },
  args: {
    page: 25,
    totalPages: 50,
    onChange: () => {},
    color: 'primary',
    size: 'medium',
    siblingCount: 2,
    showFirstLast: true,
  },
};

// ============================================================================
// COLORS
// ============================================================================

export const Colors = {
  render: () => {
    const colors = ['primary', 'secondary', 'success', 'danger'] as const;
    const label: React.CSSProperties = {
      margin: '0 0 0.5rem',
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      color: '#94a3b8',
      letterSpacing: '0.07em',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {colors.map((color) => (
          <div key={color}>
            <p style={label}>{color}</p>
            <Pagination page={3} totalPages={10} color={color} onChange={() => {}} />
          </div>
        ))}
      </div>
    );
  },
};

// ============================================================================
// SIZES
// ============================================================================

export const Sizes = {
  render: () => {
    const sizes = ['small', 'medium', 'large'] as const;
    const label: React.CSSProperties = {
      margin: '0 0 0.5rem',
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      color: '#94a3b8',
      letterSpacing: '0.07em',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {sizes.map((size) => (
          <div key={size}>
            <p style={label}>{size}</p>
            <Pagination page={3} totalPages={10} size={size} onChange={() => {}} />
          </div>
        ))}
      </div>
    );
  },
};

// ============================================================================
// NO FIRST / LAST
// ============================================================================

export const NoFirstLast: Story = {
  render: (args) => {
    const [page, setPage] = React.useState(5);
    return <Pagination {...args} page={page} onChange={setPage} />;
  },
  args: {
    page: 5,
    totalPages: 10,
    onChange: () => {},
    showFirstLast: false,
    color: 'primary',
    size: 'medium',
  },
};

// ============================================================================
// DISABLED
// ============================================================================

export const Disabled: Story = {
  args: {
    page: 3,
    totalPages: 10,
    disabled: true,
    color: 'primary',
    size: 'medium',
    onChange: () => {},
  },
};
