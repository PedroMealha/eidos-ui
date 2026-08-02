import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress } from "./Progress.component";

const meta = {
  title: "Feedback/Progress",
  component: Progress,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Progress value (0–100). Omit to show the indeterminate animation.",
      table: {
        type: { summary: "number" },
      },
    },
    max: {
      control: "number",
      description: "Denominator for percentage calculation.",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "100" },
      },
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "danger", "warning", "info"],
      description: "Color theme applied to the fill.",
      table: {
        type: { summary: '"primary" | "secondary" | "success" | "danger" | "warning" | "info"' },
        defaultValue: { summary: "primary" },
      },
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
      description: "Track height — small (4 px), medium (8 px), large (12 px).",
      table: {
        type: { summary: '"small" | "medium" | "large"' },
        defaultValue: { summary: "medium" },
      },
    },
    showLabel: {
      control: "boolean",
      description: "Render the percentage (or custom label) to the right of the track.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    striped: {
      control: "boolean",
      description: "Overlay a diagonal stripe texture on the fill.",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    label: {
      control: "text",
      description: "Custom label text. Overrides the auto-computed percentage string.",
      table: {
        type: { summary: "string" },
      },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT
// ============================================================================

export const Default: Story = {
  args: {
    value: 65,
    size: "medium",
    color: "primary",
  },
};

// ============================================================================
// INDETERMINATE
// ============================================================================

export const Indeterminate: Story = {
  args: {
    size: "medium",
    color: "primary",
  },
};

// ============================================================================
// COLORS — all six colours at 60 %
// ============================================================================

const labelStyle: React.CSSProperties = {
  margin: "0 0 0.25rem",
  fontSize: "0.7rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: "#94a3b8",
};

const colors = ["primary", "secondary", "success", "danger", "warning", "info"] as const;

export const Colors = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "520px" }}>
      {colors.map((color) => (
        <div key={color}>
          <p style={labelStyle}>{color}</p>
          <Progress value={60} color={color} />
        </div>
      ))}
    </div>
  ),
};

// ============================================================================
// SIZES
// ============================================================================

export const Sizes = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "520px" }}>
      {(["small", "medium", "large"] as const).map((size) => (
        <div key={size}>
          <p style={labelStyle}>{size}</p>
          <Progress value={70} size={size} />
        </div>
      ))}
    </div>
  ),
};

// ============================================================================
// WITH LABEL
// ============================================================================

export const WithLabel: Story = {
  args: {
    value: 48,
    showLabel: true,
    size: "medium",
    color: "primary",
  },
};

// ============================================================================
// STRIPED
// ============================================================================

export const Striped: Story = {
  args: {
    value: 55,
    striped: true,
    size: "large",
    color: "primary",
  },
};

// ============================================================================
// STATES — 0 / 25 / 50 / 75 / 100 %
// ============================================================================

export const States = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "520px" }}>
      {[0, 25, 50, 75, 100].map((value) => (
        <Progress key={value} value={value} showLabel />
      ))}
    </div>
  ),
};
