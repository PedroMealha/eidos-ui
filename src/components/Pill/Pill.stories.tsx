import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pill } from './Pill.component';
import { Chip } from '../Chip/Chip.component';
import { StoryRow, StoryStack, StoryGroup } from '../../story-layout.docs';

const meta = {
  title: 'Elements/Pill',
  component: Pill,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Pill content. When a number and `max` is set, shows `max+` if exceeded.',
      table: { type: { summary: 'React.ReactNode' } },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
      description: 'Color theme',
      table: {
        type: { summary: '"primary" | "secondary" | "success" | "danger" | "warning" | "info"' },
        defaultValue: { summary: 'primary' },
      },
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'text'],
      description: 'Visual style variant',
      table: {
        type: { summary: '"filled" | "outlined" | "text"' },
        defaultValue: { summary: 'filled' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Pill size',
      table: {
        type: { summary: '"sm" | "md" | "lg"' },
        defaultValue: { summary: 'md' },
      },
    },
    dot: {
      control: 'boolean',
      description:
        'Render a coloured dot. With no children, renders dot-only; with children, the dot sits alongside the label.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    max: {
      control: 'number',
      description: 'When children is a number, display `max+` if the value exceeds this threshold',
      table: { type: { summary: 'number' } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Pill>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT
// ============================================================================

export const Playground: Story = {
  args: {
    children: 'New',
    color: 'primary',
    variant: 'filled',
    size: 'md',
  },
};

// ============================================================================
// VARIANTS
// ============================================================================

export const Variants: Story = {
  render: () => (
    <StoryStack gap="lg">
      {(['filled', 'outlined', 'text'] as const).map((variant) => (
        <StoryGroup key={variant} label={variant}>
          <StoryRow gap="sm">
            {(['primary', 'success', 'danger'] as const).map((color) => (
              <Pill key={color} variant={variant} color={color}>
                {variant}
              </Pill>
            ))}
          </StoryRow>
        </StoryGroup>
      ))}
    </StoryStack>
  ),
};

// ============================================================================
// COLORS
// ============================================================================

export const Colors: Story = {
  render: () => (
    <StoryRow gap="sm">
      <Pill color="primary">Primary</Pill>
      <Pill color="secondary">Secondary</Pill>
      <Pill color="success">Success</Pill>
      <Pill color="danger">Danger</Pill>
      <Pill color="warning">Warning</Pill>
      <Pill color="info">Info</Pill>
    </StoryRow>
  ),
};

// ============================================================================
// DOT
// ============================================================================

export const Dot: Story = {
  render: () => (
    <StoryRow gap="sm">
      <Pill dot color="primary" />
      <Pill dot color="secondary" />
      <Pill dot color="success" />
      <Pill dot color="danger" />
      <Pill dot color="warning" />
      <Pill dot color="info" />
    </StoryRow>
  ),
};

// ============================================================================
// DOT WITH LABEL - dot rendered alongside content, e.g. a status pill
// ============================================================================

export const DotWithLabel: Story = {
  render: () => (
    <StoryRow gap="sm">
      <Pill dot variant="text" color="success">
        Active
      </Pill>
      <Pill dot variant="text" color="danger">
        Offline
      </Pill>
      <Pill dot variant="text" color="warning">
        Away
      </Pill>
      <Pill dot variant="outlined" color="info">
        In progress
      </Pill>
    </StoryRow>
  ),
};

// ============================================================================
// SIZES
// ============================================================================

export const Sizes: Story = {
  render: () => (
    <StoryStack gap="lg">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <StoryGroup key={size} label={size}>
          <StoryRow gap="sm">
            <Pill size={size}>Filled</Pill>
            <Pill size={size} variant="outlined">
              Outlined
            </Pill>
            <Pill size={size} variant="text">
              Text
            </Pill>
            <Pill size={size} dot color="success" />
          </StoryRow>
        </StoryGroup>
      ))}
    </StoryStack>
  ),
};

// ============================================================================
// NUMBERS - with max clamping
// ============================================================================

export const Numbers: Story = {
  render: () => (
    <StoryGroup label="max=99 - the value 150 is clamped to &ldquo;99+&rdquo;">
      <StoryRow gap="sm">
        <Pill color="primary" max={99}>
          {1}
        </Pill>
        <Pill color="primary" max={99}>
          {5}
        </Pill>
        <Pill color="primary" max={99}>
          {99}
        </Pill>
        <Pill color="danger" max={99}>
          {150}
        </Pill>
      </StoryRow>
    </StoryGroup>
  ),
};

// ============================================================================
// WITH CHIP - common UI composition pattern
// ============================================================================

export const WithChip: Story = {
  render: () => (
    <StoryStack gap="lg">
      <StoryGroup label="Status label + count pill">
        <StoryRow gap="sm">
          <Chip color="primary" variant="text">
            In progress
          </Chip>
          <Pill color="primary">4</Pill>
        </StoryRow>
      </StoryGroup>
      <StoryGroup label="Category chip + text pill">
        <StoryRow gap="sm">
          <Chip color="success" variant="text">
            Completed
          </Chip>
          <Pill color="success" variant="text">
            12
          </Pill>
        </StoryRow>
      </StoryGroup>
      <StoryGroup label="Alert chip + danger pill">
        <StoryRow gap="sm">
          <Chip color="danger" variant="text">
            Errors
          </Chip>
          <Pill color="danger" max={9}>
            {15}
          </Pill>
        </StoryRow>
      </StoryGroup>
      <StoryGroup label="Dot indicator alongside chip">
        <StoryRow gap="sm">
          <Pill dot color="success" />
          <Chip color="success" variant="outlined">
            Online
          </Chip>
          <Pill dot color="danger" />
          <Chip color="danger" variant="outlined">
            Offline
          </Chip>
          <Pill dot color="warning" />
          <Chip color="warning" variant="outlined">
            Away
          </Chip>
        </StoryRow>
      </StoryGroup>
    </StoryStack>
  ),
};
