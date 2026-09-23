import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer } from './Footer.component';

const meta = {
  title: 'Layout/Components/Footer',
  component: Footer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Bottom bar for `PageLayout` - either a centered `copyright` string (the default) or a fully custom `component`. The two are mutually exclusive: passing both is a type error.',
      },
    },
  },
  argTypes: {
    copyright: {
      control: 'text',
      description: 'Copyright text, centered in the footer. Mutually exclusive with `component`.',
      table: {
        type: { summary: 'string' },
      },
    },
    component: {
      control: false,
      description:
        'Custom content that fully replaces the default centered copyright text. Mutually exclusive with `copyright`.',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default form - a `copyright` string, centered in the footer.
 */
export const Playground: Story = {
  args: {
    copyright: `© ${new Date().getFullYear()} Eidos UI`,
  },
};

/**
 * `component` accepts any `ReactNode` in place of `copyright`, giving full
 * control over layout and content (links, socials, multi-column content...).
 *
 * The slot is given the footer's full width, so a `space-between` bar like
 * this one needs no `width: 100%` of its own.
 */
export const WithCustomComponent: Story = {
  args: {
    component: (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--gray-500)',
        }}
      >
        <span>© {new Date().getFullYear()} Eidos UI</span>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      source: {
        code: `
<Footer
  component={
    <>
      <span>© {new Date().getFullYear()} Eidos UI</span>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </>
  }
/>`.trim(),
      },
    },
  },
};
