import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { VirtualList } from './VirtualList.component';

// ============================================================================
// Shared fixture data
// ============================================================================

interface Item {
  id: number;
  name: string;
  email: string;
  department: string;
}

const DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'HR'];

const ITEMS: Item[] = Array.from({ length: 10_000 }, (_, i) => ({
  id: i,
  name: `User ${i + 1}`,
  email: `user${i}@example.com`,
  department: DEPARTMENTS[i % DEPARTMENTS.length] as string,
}));

// ============================================================================
// Shared styles
// ============================================================================

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0 1rem',
  height: '100%',
  borderBottom: '1px solid var(--gray-100)',
  boxSizing: 'border-box',
  fontSize: '0.875rem',
};

const avatarStyle = (hue: number): React.CSSProperties => ({
  flexShrink: 0,
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: `hsl(${hue}, 65%, 55%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.75rem',
});

const nameStyle: React.CSSProperties = {
  fontWeight: 500,
  color: 'var(--gray-800)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const metaStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--gray-400)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const chipStyle = (department: string): React.CSSProperties => {
  const palette: Record<string, string> = {
    Engineering: '#e0e7ff',
    Design: '#fce7f3',
    Product: '#d1fae5',
    Marketing: '#fef3c7',
    Sales: '#fee2e2',
    HR: '#e0f2fe',
  };
  return {
    marginLeft: 'auto',
    flexShrink: 0,
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: '0.7rem',
    fontWeight: 600,
    background: palette[department] ?? '#f1f5f9',
    color: 'var(--gray-700)',
  };
};

// ============================================================================
// Row renderers
// ============================================================================

function renderItem(item: Item): React.ReactNode {
  const initials = item.name.split(' ').map((w) => w[0]).join('');
  const hue = (item.id * 37) % 360;
  return (
    <div style={rowStyle}>
      <div style={avatarStyle(hue)}>{initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={nameStyle}>{item.name}</div>
        <div style={metaStyle}>{item.email}</div>
      </div>
      <span style={chipStyle(item.department)}>{item.department}</span>
    </div>
  );
}

// ============================================================================
// Meta
// ============================================================================

const meta = {
  title: 'Data Display/VirtualList',
  component: VirtualList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**VirtualList** is a high-performance windowed list that renders only the rows
visible in the scroll viewport (plus a configurable overscan buffer), keeping
DOM node count constant regardless of dataset size.

Powered by [\`@tanstack/react-virtual\`](https://tanstack.com/virtual) - scroll
tracking, size measurement, and item windowing are all handled by the
virtualizer so the component stays lean.

### Highlights
- Fixed **or** variable per-row heights via the \`rowHeight\` prop
- Generic - TypeScript infers the item type from the \`data\` prop
- Built-in loading skeletons and empty-state slot
- \`onEndReached\` callback for infinite scroll (fires once per crossing, resets on scroll-up)
        `.trim(),
      },
    },
  },
  // Baseline args satisfy TypeScript's required-prop constraint so that
  // individual stories using `render:()` don't need to repeat them.
  // The render functions in each story fully override these values.
  args: {
    data: [] as unknown[],
    renderRow: () => null,
    rowHeight: 48,
    height: 400,
  },
  argTypes: {
    height: {
      control: 'text',
      description: 'Viewport height - pixel number or any CSS string (e.g. `"60vh"`)',
      table: { type: { summary: 'number | string' } },
    },
    width: {
      control: 'text',
      description: 'Scroll-container width. Default: `"100%"`',
      table: { type: { summary: 'number | string' }, defaultValue: { summary: '"100%"' } },
    },
    overscan: {
      control: { type: 'number', min: 0, max: 20 },
      description: 'Extra rows rendered above/below the visible window to reduce blank-row flashes',
      table: { type: { summary: 'number' }, defaultValue: { summary: '3' } },
    },
    loading: {
      control: 'boolean',
      description: 'Replace content with animated skeleton rows',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    loadingRowCount: {
      control: { type: 'number', min: 1, max: 30 },
      description: 'Number of skeleton rows shown when `loading` is true',
      table: { type: { summary: 'number' }, defaultValue: { summary: '10' } },
    },
    endReachedThreshold: {
      control: { type: 'number', min: 0, max: 500 },
      description: 'px from bottom at which `onEndReached` fires',
      table: { type: { summary: 'number' }, defaultValue: { summary: '100' } },
    },
    data: { table: { disable: true } },
    renderRow: { table: { disable: true } },
    rowHeight: { table: { disable: true } },
    emptyContent: { table: { disable: true } },
    className: { table: { disable: true } },
    onScroll: { table: { disable: true } },
    onEndReached: { table: { disable: true } },
    getRowKey: { table: { disable: true } },
  },
} satisfies Meta<typeof VirtualList>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Story: Fixed Height (stress test - 10 000 rows)
// ============================================================================

export const Default: Story = {
  name: 'Fixed Row Height',
  parameters: {
    docs: {
      description: {
        story:
          'All 10 000 rows share the same 48 px height. Scroll performance stays constant because the DOM only ever holds ~20 nodes regardless of dataset size.',
      },
    },
  },
  render: () => (
    <VirtualList
      data={ITEMS}
      rowHeight={48}
      height={400}
      getRowKey={(item) => item.id}
      renderRow={renderItem}
    />
  ),
};

// ============================================================================
// Story: Variable Height
// ============================================================================

function variableRowHeight(index: number): number {
  // Odd-indexed rows are taller to show non-uniform layout
  return index % 2 === 0 ? 48 : 80;
}

function renderVariableItem(item: Item, index: number): React.ReactNode {
  const isTall = index % 2 !== 0;
  const initials = item.name.split(' ').map((w) => w[0]).join('');
  const hue = (item.id * 37) % 360;

  return (
    <div
      style={{
        ...rowStyle,
        flexDirection: isTall ? 'column' : 'row',
        alignItems: isTall ? 'flex-start' : 'center',
        justifyContent: 'center',
        padding: isTall ? '0.75rem 1rem' : '0 1rem',
        gap: isTall ? '0.25rem' : '0.75rem',
      }}
    >
      {!isTall && <div style={avatarStyle(hue)}>{initials}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={nameStyle}>{item.name}</div>
        <div style={metaStyle}>{item.email}</div>
        {isTall && (
          <div style={{ ...metaStyle, marginTop: 4 }}>
            <span style={chipStyle(item.department)}>{item.department}</span>
          </div>
        )}
      </div>
      {!isTall && <span style={chipStyle(item.department)}>{item.department}</span>}
    </div>
  );
}

export const VariableHeight: Story = {
  name: 'Variable Row Height',
  parameters: {
    docs: {
      description: {
        story:
          'Even rows are 48 px tall; odd rows expand to 80 px. The `rowHeight` function tells the virtualizer the exact size for each index upfront, so no post-render measurement is needed.',
      },
    },
  },
  render: () => (
    <VirtualList
      data={ITEMS}
      rowHeight={variableRowHeight}
      height={400}
      getRowKey={(item) => item.id}
      renderRow={renderVariableItem}
    />
  ),
};

// ============================================================================
// Story: Loading State
// ============================================================================

export const WithLoading: Story = {
  name: 'Loading State',
  parameters: {
    docs: {
      description: {
        story:
          'When `loading` is true, the real rows are replaced by animated skeleton placeholders. Use this for the initial data-fetch phase.',
      },
    },
  },
  render: () => (
    <VirtualList
      data={[] as Item[]}
      rowHeight={56}
      height={400}
      loading
      loadingRowCount={8}
      renderRow={renderItem}
    />
  ),
};

// ============================================================================
// Story: Empty State
// ============================================================================

function EmptyPlaceholder(): React.ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--gray-300)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
      <div style={{ fontWeight: 600, color: 'var(--gray-600)', fontSize: '0.9375rem' }}>
        No results found
      </div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', maxWidth: 240, textAlign: 'center' }}>
        Try adjusting your filters or search query.
      </div>
    </div>
  );
}

export const EmptyState: Story = {
  name: 'Empty State',
  parameters: {
    docs: {
      description: {
        story:
          'When `data` is empty (and not loading), the `emptyContent` slot is rendered centred inside the scroll container.',
      },
    },
  },
  render: () => (
    <VirtualList
      data={[] as Item[]}
      rowHeight={48}
      height={400}
      emptyContent={<EmptyPlaceholder />}
      renderRow={renderItem}
    />
  ),
};

// ============================================================================
// Story: Infinite Scroll
// ============================================================================

const PAGE_SIZE = 100;

export const InfiniteScroll: Story = {
  name: 'Infinite Scroll',
  parameters: {
    docs: {
      description: {
        story: `
Starts with the first 100 items. When the user scrolls within 150 px of the
bottom, \`onEndReached\` fires and the next batch is appended (max 10 000 items).
The guard ref prevents the callback from firing repeatedly while the user stays
at the bottom - it resets automatically once the new content pushes the
threshold above their scroll position.
        `.trim(),
      },
    },
  },
  render: () => {
    const [items, setItems] = React.useState<Item[]>(() => ITEMS.slice(0, PAGE_SIZE));
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);

    const handleEndReached = React.useCallback(() => {
      setItems((prev) => {
        if (prev.length >= ITEMS.length) return prev;
        // Simulate a brief network delay so the loading state is visible
        setIsLoadingMore(true);
        return prev;
      });
    }, []);

    // Simulate async fetch: load next page after a short delay
    React.useEffect(() => {
      if (!isLoadingMore) return;
      const timer = setTimeout(() => {
        setItems((prev) => {
          const next = ITEMS.slice(prev.length, prev.length + PAGE_SIZE);
          return next.length > 0 ? [...prev, ...next] : prev;
        });
        setIsLoadingMore(false);
      }, 600);
      return () => clearTimeout(timer);
    }, [isLoadingMore]);

    return (
      <div>
        <div
          style={{
            marginBottom: '0.5rem',
            fontSize: '0.8125rem',
            color: 'var(--gray-500)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>
            Showing <strong>{items.length.toLocaleString()}</strong> of{' '}
            <strong>{ITEMS.length.toLocaleString()}</strong> items
          </span>
          {isLoadingMore && (
            <span style={{ color: 'var(--primary-color)' }}>Loading more…</span>
          )}
        </div>
        <VirtualList
          data={items}
          rowHeight={48}
          height={400}
          getRowKey={(item) => item.id}
          onEndReached={handleEndReached}
          endReachedThreshold={150}
          renderRow={renderItem}
        />
      </div>
    );
  },
};
