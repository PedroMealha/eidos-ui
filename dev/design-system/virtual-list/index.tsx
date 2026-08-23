import { useState, useMemo, useCallback } from 'react';
import { VirtualList } from '../../../src/components/VirtualList';
import { Section, Col } from '../shared/Section';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ColorItem {
  id: number;
  label: string;
  color: string;
}

interface VarItem {
  id: number;
  text: string;
}

interface UserCard {
  id: number;
  name: string;
  email: string;
  avatarColor: string;
}

// ─── Static data (generated once at module level for stable references) ───────

const SWATCH_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
];

const LOREM_SENTENCES = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa.',
];

const AVATAR_COLORS = [
  '#7c3aed', '#2563eb', '#059669', '#d97706',
  '#dc2626', '#0891b2', '#9333ea', '#be185d',
];

const FIRST_NAMES = ['Alice', 'Bob', 'Carol', 'David', 'Eva', 'Frank', 'Grace', 'Henry'];
const LAST_NAMES  = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Martinez'];
const DOMAINS     = ['example.com', 'company.io', 'work.dev', 'corp.net'];

const ALL_COLOR_ITEMS: ColorItem[] = Array.from({ length: 10_000 }, (_, i) => ({
  id: i,
  label: `Item #${i + 1}`,
  color: SWATCH_COLORS[i % SWATCH_COLORS.length] as string,
}));

const VAR_ITEMS: VarItem[] = Array.from({ length: 500 }, (_, i) => ({
  id: i,
  // every 3rd item is short; the rest carry a lorem sentence
  text: i % 3 === 0
    ? `Item ${i + 1}`
    : `Item ${i + 1} - ${LOREM_SENTENCES[i % LOREM_SENTENCES.length] as string}`,
}));

const USER_CARDS: UserCard[] = Array.from({ length: 200 }, (_, i) => {
  const first  = FIRST_NAMES[i % FIRST_NAMES.length] as string;
  const last   = LAST_NAMES[i % LAST_NAMES.length]   as string;
  const domain = DOMAINS[i % DOMAINS.length]          as string;
  return {
    id: i,
    name:        `${first} ${last}`,
    email:       `${first.toLowerCase()}.${last.toLowerCase()}${i}@${domain}`,
    avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length] as string,
  };
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const searchWrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginBottom: '0.75rem',
};

const searchInputStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.375rem 0.625rem',
  fontSize: '0.875rem',
  border: '1px solid #e2e8f0',
  borderRadius: '0.375rem',
  outline: 'none',
};

const countStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: '#94a3b8',
  whiteSpace: 'nowrap',
};

const rowBaseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0 0.75rem',
  borderBottom: '1px solid #f1f5f9',
  boxSizing: 'border-box',
};

const swatchStyle = (color: string): React.CSSProperties => ({
  width: 20,
  height: 20,
  borderRadius: '50%',
  background: color,
  flexShrink: 0,
});

const rowLabelStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#1e293b',
};

const varRowStyle = (height: number): React.CSSProperties => ({
  ...rowBaseStyle,
  height,
  alignItems: 'center',
  flexWrap: 'nowrap',
  overflow: 'hidden',
});

const varTextStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: '#1e293b',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const avatarStyle = (color: string): React.CSSProperties => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  background: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.8125rem',
  flexShrink: 0,
});

const userInfoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
  overflow: 'hidden',
};

const userNameStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#0f172a',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const userEmailStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: '#64748b',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

// ─── Row height function for VAR_ITEMS (stable, no closure over component state) ─

const varRowHeight = (index: number): number =>
  (VAR_ITEMS[index]?.text.length ?? 0) > 30 ? 72 : 48;

// ─── Showcase ─────────────────────────────────────────────────────────────────

export const VirtualListShowcase = () => {
  const [query, setQuery] = useState('');

  const filteredColorItems = useMemo(
    () =>
      query.trim()
        ? ALL_COLOR_ITEMS.filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase()),
          )
        : ALL_COLOR_ITEMS,
    [query],
  );

  const renderColorRow = useCallback((item: ColorItem) => (
    <div key={item.id} style={{ ...rowBaseStyle, height: 48 }}>
      <div style={swatchStyle(item.color)} />
      <span style={rowLabelStyle}>{item.label}</span>
    </div>
  ), []);

  const renderVarRow = useCallback((item: VarItem, index: number) => {
    const h = varRowHeight(index);
    return (
      <div key={item.id} style={varRowStyle(h)}>
        <span style={varTextStyle}>{item.text}</span>
      </div>
    );
  }, []);

  const renderUserRow = useCallback((user: UserCard) => {
    const initials = user.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase();
    return (
      <div key={user.id} style={{ ...rowBaseStyle, height: 64 }}>
        <div style={avatarStyle(user.avatarColor)}>{initials}</div>
        <div style={userInfoStyle}>
          <span style={userNameStyle}>{user.name}</span>
          <span style={userEmailStyle}>{user.email}</span>
        </div>
      </div>
    );
  }, []);

  return (
    <Col gap="1.5rem">
      <Section label="10 000 Fixed-height Items – with live search filter">
        <div style={searchWrapStyle}>
          <input
            style={searchInputStyle}
            type="search"
            placeholder="Filter items…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span style={countStyle}>{filteredColorItems.length.toLocaleString()} items</span>
        </div>
        <VirtualList
          data={filteredColorItems}
          renderRow={renderColorRow}
          rowHeight={48}
          height={400}
          getRowKey={(item) => item.id}
          overscan={5}
        />
      </Section>

      <Section label="Variable-height Items – 500 rows with dynamic heights (48 or 72 px)">
        <VirtualList
          data={VAR_ITEMS}
          renderRow={renderVarRow}
          rowHeight={varRowHeight}
          height={400}
          getRowKey={(item) => item.id}
          overscan={4}
        />
      </Section>

      <Section label="Custom Rendered – 200 user cards with avatar, name, email (64 px rows)">
        <VirtualList
          data={USER_CARDS}
          renderRow={renderUserRow}
          rowHeight={64}
          height={400}
          getRowKey={(user) => user.id}
          overscan={4}
        />
      </Section>
    </Col>
  );
};
