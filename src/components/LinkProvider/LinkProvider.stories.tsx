import { createContext, useContext, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { LinkProvider } from './LinkProvider.component';
import type { LinkComponentProps } from './LinkProvider.types';
import { Button } from '../Button';
import { Chip } from '../Chip';
import { Breadcrumb } from '../Breadcrumb';
import { StoryStack, StoryRow, StoryValue } from '../../story-layout.docs';

/**
 * Stands in for a router's `navigate`, so the story can show where a click
 * went instead of leaving the Storybook frame.
 */
const NavigateContext = createContext<(href: string) => void>(() => {});

/**
 * The shape of a real router link: renders an anchor, and turns a plain
 * left-click into client-side navigation while leaving modified clicks
 * (new tab, new window) to the browser.
 */
const DemoRouterLink = ({ href, onClick, ...props }: LinkComponentProps) => {
  const navigate = useContext(NavigateContext);
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        navigate(href);
      }}
    />
  );
};

const meta = {
  title: 'Navigation/LinkProvider',
  component: LinkProvider,
  parameters: { layout: 'padded' },
  args: { component: DemoRouterLink, children: null },
  argTypes: {
    component: {
      control: false,
      description:
        'Renders every enabled library link inside the provider - typically your router’s link. Receives standard anchor props with a required `href`.',
      table: {
        type: { summary: 'React.ElementType<LinkComponentProps>' },
        defaultValue: { summary: "'a'" },
      },
    },
    children: { table: { disable: true } },
  },
} satisfies Meta<typeof LinkProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [location, setLocation] = useState('/');

    return (
      <NavigateContext.Provider value={setLocation}>
        <LinkProvider {...args}>
          <StoryStack gap="lg">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Projects', href: '/projects' },
                { label: 'Eidos' },
              ]}
            />
            <StoryRow>
              <Button href="/projects/new">New project</Button>
              <Chip href="/tags/design" variant="outlined">
                design
              </Chip>
              <Button href="/archive" variant="outlined" disabled>
                Archive
              </Button>
            </StoryRow>
            <StoryValue label="Router location" value={location} />
          </StoryStack>
        </LinkProvider>
      </NavigateContext.Provider>
    );
  },
  play: async ({ canvas, userEvent, step }) => {
    await step('a Button link navigates through the provided component', async () => {
      await userEvent.click(canvas.getByRole('link', { name: 'New project' }));
      await waitFor(() => expect(canvas.getByText('/projects/new')).toBeInTheDocument());
    });

    await step('so do Chip and Breadcrumb links', async () => {
      await userEvent.click(canvas.getByRole('link', { name: 'design' }));
      await waitFor(() => expect(canvas.getByText('/tags/design')).toBeInTheDocument());
      await userEvent.click(canvas.getByRole('link', { name: 'Projects' }));
      await waitFor(() => expect(canvas.getByText('/projects')).toBeInTheDocument());
    });

    await step('a disabled link never reaches the router', async () => {
      const archive = canvas.getByRole('link', { name: 'Archive' });
      await expect(archive).not.toHaveAttribute('href');
    });
  },
};
