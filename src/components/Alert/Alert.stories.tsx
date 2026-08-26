import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "./Alert.component";

const meta = {
  title: "Feedback/Alert",
  component: Alert,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["info", "success", "warning", "danger"],
      description: "Semantic colour variant",
      table: {
        type: { summary: '"info" | "success" | "warning" | "danger"' },
        defaultValue: { summary: "info" },
      },
    },
    title: {
      control: "text",
      description: "Optional bold heading rendered above the body content",
      table: { type: { summary: "string" } },
    },
    children: {
      control: "text",
      description: "Body text / content of the alert",
      table: { type: { summary: "React.ReactNode" } },
    },
    icon: {
      control: "boolean",
      description:
        "true/omitted = default variant icon, false = no icon, or pass an IconType for a custom icon",
      table: {
        type: { summary: "boolean | IconType" },
        defaultValue: { summary: "true" },
      },
    },
    onDismiss: {
      control: false,
      description: "Callback fired when the × dismiss button is clicked",
      table: { type: { summary: "() => void" } },
    },
    action: {
      control: false,
      description: "Optional action button rendered inside the alert body",
      table: { type: { summary: "AlertAction" } },
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// DEFAULT
// ============================================================================

export const Default: Story = {
  args: {
    variant: "info",
    children: "Your session will expire in 10 minutes. Save your work to avoid losing progress.",
  },
};

// ============================================================================
// SUCCESS
// ============================================================================

export const Success: Story = {
  args: {
    variant: "success",
    children: "Your changes have been saved successfully.",
  },
};

// ============================================================================
// WARNING
// ============================================================================

export const Warning: Story = {
  args: {
    variant: "warning",
    children: "This action cannot be undone. Please review before continuing.",
  },
};

// ============================================================================
// DANGER
// ============================================================================

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "An unexpected error occurred. Please try again or contact support.",
  },
};

// ============================================================================
// WITH TITLE
// ============================================================================

export const WithTitle: Story = {
  args: {
    variant: "info",
    title: "Scheduled maintenance",
    children:
      "The platform will be unavailable on Saturday 15th between 02:00 – 04:00 UTC for scheduled maintenance.",
  },
};

// ============================================================================
// WITH ACTION
// ============================================================================

export const WithAction: Story = {
  args: {
    variant: "warning",
    title: "Storage limit reached",
    children:
      "You have used 95% of your available storage. Upgrade your plan to continue uploading files.",
    action: {
      label: "Upgrade plan",
      onClick: () => alert("Upgrade plan clicked"),
    },
  },
};

// ============================================================================
// DISMISSABLE - uses useState so needs a render function
// ============================================================================

export const Dismissable: Story = {
  render: (args) => {
    const [visible, setVisible] = React.useState(true);

    if (!visible) {
      return (
        <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
          Alert dismissed. Refresh the page to reset.
        </p>
      );
    }

    return (
      <Alert {...args} onDismiss={() => setVisible(false)} />
    );
  },
  args: {
    variant: "info",
    title: "Dismissable alert",
    children: "Click the × button on the right to dismiss this alert.",
  },
};

// ============================================================================
// NO ICON
// ============================================================================

export const NoIcon: Story = {
  args: {
    variant: "success",
    title: "No icon",
    children: "This alert renders without an icon - useful when screen real estate is tight.",
    icon: false,
  },
};

// ============================================================================
// ALL VARIANTS - visual reference of all four variants at once
// ============================================================================

export const AllVariants = {
  render: () => {
    const wrapper: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      maxWidth: "600px",
    };

    return (
      <div style={wrapper}>
        <Alert variant="info" title="Information">
          Here is some helpful context about this feature or action.
        </Alert>
        <Alert variant="success" title="Success">
          Everything went as expected. Your data has been saved.
        </Alert>
        <Alert variant="warning" title="Warning">
          Proceed carefully. This operation may have side effects.
        </Alert>
        <Alert variant="danger" title="Error">
          Something went wrong. Please try again or contact support.
        </Alert>
      </div>
    );
  },
};
