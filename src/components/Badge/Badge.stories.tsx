import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge.component";
import { Chip } from "../Chip/Chip.component";

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
      description: "Badge content. When a number and `max` is set, shows `max+` if exceeded.",
      table: { type: { summary: "React.ReactNode" } },
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "danger", "warning", "info"],
      description: "Color theme",
      table: {
        type: { summary: '"primary" | "secondary" | "success" | "danger" | "warning" | "info"' },
        defaultValue: { summary: "primary" },
      },
    },
    variant: {
      control: "select",
      options: ["filled", "outlined", "soft"],
      description: "Visual style variant",
      table: {
        type: { summary: '"filled" | "outlined" | "soft"' },
        defaultValue: { summary: "filled" },
      },
    },
    size: {
      control: "select",
      options: ["small", "medium"],
      description: "Badge size",
      table: {
        type: { summary: '"small" | "medium"' },
        defaultValue: { summary: "medium" },
      },
    },
    dot: {
      control: "boolean",
      description: "Render a coloured dot with no text content",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    max: {
      control: "number",
      description: "When children is a number, display `max+` if the value exceeds this threshold",
      table: { type: { summary: "number" } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT
// ============================================================================

export const Default: Story = {
  args: {
    children: "New",
    color: "primary",
    variant: "filled",
    size: "medium",
  },
};

// ============================================================================
// VARIANTS
// ============================================================================

export const Variants = {
  render: () => {
    const label: React.CSSProperties = {
      marginBottom: "0.5rem",
      fontSize: "0.7rem",
      fontWeight: 600,
      textTransform: "uppercase" as const,
      letterSpacing: "0.07em",
      color: "#94a3b8",
    };
    const row: React.CSSProperties = { display: "flex", gap: "0.5rem", alignItems: "center" };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1rem" }}>
        <div>
          <p style={label}>Filled</p>
          <div style={row}>
            <Badge variant="filled" color="primary">Filled</Badge>
            <Badge variant="filled" color="success">Filled</Badge>
            <Badge variant="filled" color="danger">Filled</Badge>
          </div>
        </div>
        <div>
          <p style={label}>Outlined</p>
          <div style={row}>
            <Badge variant="outlined" color="primary">Outlined</Badge>
            <Badge variant="outlined" color="success">Outlined</Badge>
            <Badge variant="outlined" color="danger">Outlined</Badge>
          </div>
        </div>
        <div>
          <p style={label}>Soft</p>
          <div style={row}>
            <Badge variant="soft" color="primary">Soft</Badge>
            <Badge variant="soft" color="success">Soft</Badge>
            <Badge variant="soft" color="danger">Soft</Badge>
          </div>
        </div>
      </div>
    );
  },
};

// ============================================================================
// COLORS
// ============================================================================

export const Colors = {
  render: () => {
    const row: React.CSSProperties = { display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" };

    return (
      <div style={{ padding: "1rem" }}>
        <div style={row}>
          <Badge color="primary">Primary</Badge>
          <Badge color="secondary">Secondary</Badge>
          <Badge color="success">Success</Badge>
          <Badge color="danger">Danger</Badge>
          <Badge color="warning">Warning</Badge>
          <Badge color="info">Info</Badge>
        </div>
      </div>
    );
  },
};

// ============================================================================
// DOT
// ============================================================================

export const Dot = {
  render: () => {
    const row: React.CSSProperties = { display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" };

    return (
      <div style={{ padding: "1rem" }}>
        <div style={row}>
          <Badge dot color="primary" />
          <Badge dot color="secondary" />
          <Badge dot color="success" />
          <Badge dot color="danger" />
          <Badge dot color="warning" />
          <Badge dot color="info" />
        </div>
      </div>
    );
  },
};

// ============================================================================
// SIZES
// ============================================================================

export const Sizes = {
  render: () => {
    const label: React.CSSProperties = {
      marginBottom: "0.5rem",
      fontSize: "0.7rem",
      fontWeight: 600,
      textTransform: "uppercase" as const,
      letterSpacing: "0.07em",
      color: "#94a3b8",
    };
    const row: React.CSSProperties = { display: "flex", gap: "0.75rem", alignItems: "center" };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1rem" }}>
        <div>
          <p style={label}>Small</p>
          <div style={row}>
            <Badge size="small">Small</Badge>
            <Badge size="small" variant="outlined">Small</Badge>
            <Badge size="small" variant="soft">Small</Badge>
            <Badge size="small" dot color="success" />
          </div>
        </div>
        <div>
          <p style={label}>Medium</p>
          <div style={row}>
            <Badge size="medium">Medium</Badge>
            <Badge size="medium" variant="outlined">Medium</Badge>
            <Badge size="medium" variant="soft">Medium</Badge>
            <Badge size="medium" dot color="success" />
          </div>
        </div>
      </div>
    );
  },
};

// ============================================================================
// NUMBERS — with max clamping
// ============================================================================

export const Numbers = {
  render: () => {
    const label: React.CSSProperties = {
      fontSize: "0.7rem",
      fontWeight: 600,
      textTransform: "uppercase" as const,
      letterSpacing: "0.07em",
      color: "#94a3b8",
      marginBottom: "0.5rem",
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem" }}>
        <p style={label}>With max=99 — value 150 is clamped to &ldquo;99+&rdquo;</p>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Badge color="primary" max={99}>{1}</Badge>
          <Badge color="primary" max={99}>{5}</Badge>
          <Badge color="primary" max={99}>{99}</Badge>
          <Badge color="danger" max={99}>{150}</Badge>
        </div>
      </div>
    );
  },
};

// ============================================================================
// WITH CHIP — common UI composition pattern
// ============================================================================

export const WithChip = {
  render: () => {
    const label: React.CSSProperties = {
      marginBottom: "0.5rem",
      fontSize: "0.7rem",
      fontWeight: 600,
      textTransform: "uppercase" as const,
      letterSpacing: "0.07em",
      color: "#94a3b8",
    };
    const row: React.CSSProperties = { display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", padding: "1rem" }}>
        <div>
          <p style={label}>Status label + badge count</p>
          <div style={row}>
            <Chip color="primary" variant="soft">In Progress</Chip>
            <Badge color="primary">4</Badge>
          </div>
        </div>
        <div>
          <p style={label}>Category chip + soft badge</p>
          <div style={row}>
            <Chip color="success" variant="soft">Completed</Chip>
            <Badge color="success" variant="soft">12</Badge>
          </div>
        </div>
        <div>
          <p style={label}>Alert chip + danger badge</p>
          <div style={row}>
            <Chip color="danger" variant="soft">Errors</Chip>
            <Badge color="danger" max={9}>{15}</Badge>
          </div>
        </div>
        <div>
          <p style={label}>Dot indicator alongside chip</p>
          <div style={row}>
            <Badge dot color="success" />
            <Chip color="success" variant="outlined">Online</Chip>
            <Badge dot color="danger" />
            <Chip color="danger" variant="outlined">Offline</Chip>
            <Badge dot color="warning" />
            <Chip color="warning" variant="outlined">Away</Chip>
          </div>
        </div>
      </div>
    );
  },
};
