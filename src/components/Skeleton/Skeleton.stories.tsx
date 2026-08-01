import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./Skeleton.component";

// ============================================================================
// Shared style constants
// ============================================================================

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  maxWidth: "400px",
  padding: "1.25rem",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
};

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
  alignItems: "center",
  paddingBottom: "0.5rem",
  borderBottom: "1px solid #e2e8f0",
};

const meta = {
  title: "Feedback/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["text", "circular", "rectangular", "rounded"],
      description: "Shape of the skeleton placeholder.",
      table: {
        type: { summary: '"text" | "circular" | "rectangular" | "rounded"' },
        defaultValue: { summary: "text" },
      },
    },
    animation: {
      control: "select",
      options: ["pulse", "wave"],
      description: "Loading animation style.",
      table: {
        type: { summary: '"pulse" | "wave"' },
        defaultValue: { summary: "wave" },
      },
    },
    lines: {
      control: "number",
      description: "Number of stacked text lines (text variant only). Last line is 60 % wide.",
      table: {
        type: { summary: "number" },
        defaultValue: { summary: "1" },
      },
    },
    width: {
      control: "text",
      description: "Explicit width — number (px) or any CSS string (e.g. \"200px\", \"50%\").",
      table: { type: { summary: "number | string" } },
    },
    height: {
      control: "text",
      description: "Explicit height — number (px) or any CSS string.",
      table: { type: { summary: "number | string" } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT — single text line
// ============================================================================

export const Default: Story = {
  args: {
    variant: "text",
    animation: "wave",
  },
};

// ============================================================================
// MULTI-LINE — stacked text lines
// ============================================================================

export const MultiLine: Story = {
  args: {
    variant: "text",
    lines: 4,
    animation: "wave",
  },
};

// ============================================================================
// CIRCULAR
// ============================================================================

export const Circular: Story = {
  args: {
    variant: "circular",
    width: 48,
    height: 48,
  },
};

// ============================================================================
// RECTANGULAR
// ============================================================================

export const Rectangular: Story = {
  args: {
    variant: "rectangular",
  },
};

// ============================================================================
// ROUNDED
// ============================================================================

export const Rounded: Story = {
  args: {
    variant: "rounded",
  },
};

// ============================================================================
// PULSE animation
// ============================================================================

export const Pulse: Story = {
  args: {
    variant: "text",
    lines: 3,
    animation: "pulse",
  },
};

// ============================================================================
// CARD PLACEHOLDER — composite skeleton mimicking a content card
// ============================================================================

export const CardPlaceholder = {
  render: () => (
    <div style={cardStyle}>
      {/* Hero image */}
      <Skeleton variant="rectangular" height={160} />

      {/* Author row */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Skeleton variant="circular" width={40} height={40} />
        <div style={{ flex: 1 }}>
          <Skeleton variant="text" lines={2} />
        </div>
      </div>

      {/* Body text */}
      <Skeleton variant="text" lines={3} />
    </div>
  ),
};

// ============================================================================
// TABLE PLACEHOLDER — composite skeleton mimicking a data table
// ============================================================================

export const TablePlaceholder = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "640px" }}>
      {/* Header row */}
      <div style={headerRowStyle}>
        <Skeleton variant="text" width={120} animation="pulse" />
        <Skeleton variant="text" width={200} animation="pulse" />
        <Skeleton variant="text" width={100} animation="pulse" />
        <Skeleton variant="text" width={60} animation="pulse" />
      </div>

      {/* Data rows */}
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} style={{ display: "flex", gap: "1rem", alignItems: "center", padding: "0.25rem 0" }}>
          <Skeleton variant="text" width={120} />
          <Skeleton variant="text" width={200} />
          <Skeleton variant="text" width={100} />
          <Skeleton variant="circular" width={24} height={24} />
        </div>
      ))}
    </div>
  ),
};
