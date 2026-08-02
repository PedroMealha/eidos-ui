import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarGroup } from "./Avatar.component";
import type { AvatarColor } from "./Avatar.types";

const meta = {
  title: "Elements/Avatar",
  component: Avatar,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    src: {
      control: "text",
      description: "Image URL. Falls back to initials or fallback icon on error.",
      table: { type: { summary: "string" } },
    },
    alt: {
      control: "text",
      description: "Alt text for the image element.",
      table: { type: { summary: "string" } },
    },
    name: {
      control: "text",
      description: "Display name used to generate initials and auto-derive background colour.",
      table: { type: { summary: "string" } },
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "Avatar dimensions.",
      table: {
        type: { summary: '"xs" | "sm" | "md" | "lg" | "xl"' },
        defaultValue: { summary: "md" },
      },
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "danger", "warning", "info", "gray"],
      description: "Override the auto-derived background colour for the initials variant.",
      table: {
        type: {
          summary: '"primary" | "secondary" | "success" | "danger" | "warning" | "info" | "gray"',
        },
      },
    },
    shape: {
      control: "select",
      options: ["circle", "square"],
      description: "Border-radius shape.",
      table: {
        type: { summary: '"circle" | "square"' },
        defaultValue: { summary: "circle" },
      },
    },
    onClick: {
      control: false,
      description: "Click handler. When provided, the avatar gains button semantics and a focus ring.",
      table: { type: { summary: "() => void" } },
    },
    fallback: {
      control: false,
      description: "Custom content rendered when both src and name are absent.",
      table: { type: { summary: "React.ReactNode" } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT — image avatar
// ============================================================================

export const Default: Story = {
  args: {
    src: "https://picsum.photos/seed/avatar1/100/100",
    alt: "Sample avatar",
    size: "md",
    shape: "circle",
  },
};

// ============================================================================
// WITH INITIALS
// ============================================================================

export const WithInitials: Story = {
  args: {
    name: "John Doe",
    size: "md",
    shape: "circle",
  },
};

// ============================================================================
// WITH CUSTOM COLOR
// ============================================================================

export const WithCustomColor: Story = {
  args: {
    name: "Alice",
    color: "success",
    size: "md",
  },
};

// ============================================================================
// FALLBACK — no src, no name
// ============================================================================

export const Fallback: Story = {
  args: {
    size: "md",
    shape: "circle",
  },
};

// ============================================================================
// SHAPES — circle vs square
// ============================================================================

export const Shapes = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <div>
        <p style={labelStyle}>Circle</p>
        <Avatar name="John Doe" size="lg" shape="circle" />
      </div>
      <div>
        <p style={labelStyle}>Square</p>
        <Avatar name="John Doe" size="lg" shape="square" />
      </div>
    </div>
  ),
};

// ============================================================================
// SIZES — all five sizes in a row
// ============================================================================

export const Sizes = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <Avatar name="Jane Smith" size={size} />
          <span style={labelStyle}>{size}</span>
        </div>
      ))}
    </div>
  ),
};

// ============================================================================
// COLORS — all seven color variants
// ============================================================================

const avatarColors: AvatarColor[] = [
  "primary",
  "secondary",
  "success",
  "danger",
  "warning",
  "info",
  "gray",
];

export const Colors = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
      {avatarColors.map((color) => (
        <div key={color} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <Avatar name="AB" color={color} size="md" />
          <span style={labelStyle}>{color}</span>
        </div>
      ))}
    </div>
  ),
};

// ============================================================================
// CLICKABLE
// ============================================================================

export const Clickable: Story = {
  args: {
    name: "Jane Smith",
    size: "md",
    onClick: () => console.log("Avatar clicked"),
  },
};

// ============================================================================
// WITH ERROR — invalid src falls back to initials
// ============================================================================

export const WithError: Story = {
  args: {
    src: "invalid-url.jpg",
    name: "John Doe",
    size: "md",
  },
};

// ============================================================================
// GROUP — 6 avatars, max 4 visible
// ============================================================================

export const Group = {
  render: () => (
    <AvatarGroup max={4}>
      <Avatar name="Alice Johnson" />
      <Avatar name="Bob Smith" />
      <Avatar name="Carol White" />
      <Avatar name="David Brown" />
      <Avatar name="Eve Davis" />
      <Avatar name="Frank Wilson" />
    </AvatarGroup>
  ),
};

// ============================================================================
// GROUP SIZES
// ============================================================================

export const GroupSizes = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ ...labelStyle, minWidth: "2rem" }}>{size}</span>
          <AvatarGroup size={size} max={4}>
            <Avatar name="Alice Johnson" />
            <Avatar name="Bob Smith" />
            <Avatar name="Carol White" />
            <Avatar name="David Brown" />
            <Avatar name="Eve Davis" />
          </AvatarGroup>
        </div>
      ))}
    </div>
  ),
};

// ============================================================================
// Shared label style
// ============================================================================

const labelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "0.7rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: "#94a3b8",
};
