import type { Meta, StoryObj } from '@storybook/react-vite';
import { Home, Folder, File, ChevronRight } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb.component';

const meta = {
  title: 'Layout/Components/Breadcrumb',
  component: Breadcrumb,
  parameters: { layout: 'padded' },
  argTypes: {
    separator: {
      control: 'text',
      description: 'Separator rendered between items. Accepts a string or ReactNode.',
      table: {
        type: { summary: 'React.ReactNode' },
        defaultValue: { summary: '/' },
      },
    },
    items: { table: { disable: true } },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT - four items, last one is current page
// ============================================================================

export const Default: Story = {
  args: {
    items: [
      { label: 'Home' },
      { label: 'Products' },
      { label: 'Electronics' },
      { label: 'Smartphones' },
    ],
  },
};

// ============================================================================
// WITH HREFS - anchor-based navigation links
// ============================================================================

export const WithHrefs: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Electronics', href: '/products/electronics' },
      { label: 'Smartphones' },
    ],
  },
};

// ============================================================================
// WITH ICONS
// ============================================================================

export const WithIcons: Story = {
  args: {
    items: [
      { label: 'Home', icon: <Home /> },
      { label: 'Projects', icon: <Folder /> },
      { label: 'Q4 Report', icon: <Folder /> },
      { label: 'Summary.pdf', icon: <File /> },
    ],
  },
};

// ============================================================================
// CUSTOM SEPARATOR - chevron icon
// ============================================================================

export const CustomSeparator: Story = {
  args: {
    separator: <ChevronRight size={14} />,
    items: [
      { label: 'Dashboard' },
      { label: 'Settings' },
      { label: 'Account' },
      { label: 'Security' },
    ],
  },
};

// ============================================================================
// SHORT - two items (root + current page)
// ============================================================================

export const Short: Story = {
  args: {
    items: [{ label: 'Home' }, { label: 'Profile' }],
  },
};

// ============================================================================
// LONG - six items
// ============================================================================

export const Long: Story = {
  args: {
    items: [
      { label: 'Home' },
      { label: 'Organisation' },
      { label: 'Teams' },
      { label: 'Engineering' },
      { label: 'Frontend' },
      { label: 'Design System' },
    ],
  },
};
