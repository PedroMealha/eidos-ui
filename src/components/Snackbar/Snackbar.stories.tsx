import type { Meta, StoryObj } from "@storybook/react";
import { SnackbarProvider, SnackbarContainer } from "./index";
import { useSnackbar } from "./Snackbar.hooks";
import { Button } from "../Button";
import { UserCircle } from "lucide-react";

// Wrapper component that uses the Snackbar hook
const SnackbarDemo = () => {
  const { showSuccess, showError, showWarning, showInfo, showSnackbar, clearAll } = useSnackbar();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "20px" }}>
      <h3 style={{ marginBottom: "8px" }}>Basic Notifications</h3>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Button onClick={() => showSuccess("Operation completed successfully!")}>
          Show Success
        </Button>
        <Button onClick={() => showError("An error occurred!")}>
          Show Error
        </Button>
        <Button onClick={() => showWarning("Warning: Please review your changes.")}>
          Show Warning
        </Button>
        <Button onClick={() => showInfo("Here's some useful information.")}>
          Show Info
        </Button>
      </div>

      <h3 style={{ marginBottom: "8px", marginTop: "16px" }}>With Custom Duration</h3>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Button onClick={() => showSuccess("This will stay for 10 seconds", { duration: 10000 })}>
          10 Second Success
        </Button>
        <Button onClick={() => showError("This will stay for 2 seconds", { duration: 2000 })}>
          2 Second Error
        </Button>
        <Button onClick={() => showInfo("This won't auto-close", { duration: 0 })}>
          No Auto-Close
        </Button>
      </div>

      <h3 style={{ marginBottom: "8px", marginTop: "16px" }}>With Actions</h3>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Button
          onClick={() =>
            showSuccess("File uploaded successfully", {
              action: {
                label: "View",
                onClick: () => alert("Viewing file..."),
              },
            })
          }
        >
          Success with Action
        </Button>
        <Button
          onClick={() =>
            showError("Failed to delete item", {
              action: {
                label: "Retry",
                onClick: () => alert("Retrying..."),
              },
            })
          }
        >
          Error with Retry
        </Button>
        <Button
          onClick={() =>
            showWarning("You have unsaved changes", {
              action: {
                label: "Save",
                onClick: () => alert("Saving..."),
              },
              duration: 0,
            })
          }
        >
          Warning with Save
        </Button>
      </div>

      <h3 style={{ marginBottom: "8px", marginTop: "16px" }}>Multiple Notifications</h3>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Button
          onClick={() => {
            showSuccess("First notification");
            setTimeout(() => showInfo("Second notification"), 300);
            setTimeout(() => showWarning("Third notification"), 600);
          }}
        >
          Show Multiple
        </Button>
        <Button onClick={clearAll} color="danger" variant="outlined">
          Clear All
        </Button>
      </div>

      <h3 style={{ marginBottom: "8px", marginTop: "16px" }}>Custom Component</h3>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Button
          onClick={() =>
            showSnackbar({
              component: () => (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <UserCircle size={40} style={{ color: "#667eea" }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px" }}>New Message</div>
                    <div style={{ fontSize: "13px", color: "#666" }}>
                      John Doe sent you a message
                    </div>
                  </div>
                </div>
              ),
              variant: "info",
              duration: 5000,
            })
          }
        >
          Show Custom Component
        </Button>
      </div>

      <h3 style={{ marginBottom: "8px", marginTop: "16px" }}>With onClose Callback</h3>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Button
          onClick={() =>
            showSuccess("This notification logs when closed", {
              onClose: (id) => {
                console.log("Snackbar closed:", id);
                alert(`Snackbar closed: ${id}`);
              },
            })
          }
        >
          Show with Callback
        </Button>
      </div>
    </div>
  );
};

// Meta configuration for Storybook
const meta: Meta = {
  title: "Components/Snackbar",
  decorators: [
    (Story) => (
      <SnackbarProvider>
        <Story />
        <SnackbarContainer />
      </SnackbarProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A notification system (toast/snackbar) that displays temporary messages to users. Supports multiple variants, custom durations, actions, and custom components. Built with Context API and Portal rendering for optimal positioning.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: () => <SnackbarDemo />,
};

export const SuccessVariant: Story = {
  render: () => {
    const { showSuccess } = useSnackbar();

    return (
      <div style={{ padding: "20px" }}>
        <Button onClick={() => showSuccess("Operation completed successfully!")}>
          Show Success Notification
        </Button>
      </div>
    );
  },
};

export const ErrorVariant: Story = {
  render: () => {
    const { showError } = useSnackbar();

    return (
      <div style={{ padding: "20px" }}>
        <Button onClick={() => showError("An error occurred while processing your request.")}>
          Show Error Notification
        </Button>
      </div>
    );
  },
};

export const WarningVariant: Story = {
  render: () => {
    const { showWarning } = useSnackbar();

    return (
      <div style={{ padding: "20px" }}>
        <Button onClick={() => showWarning("Warning: Please review your changes before saving.")}>
          Show Warning Notification
        </Button>
      </div>
    );
  },
};

export const InfoVariant: Story = {
  render: () => {
    const { showInfo } = useSnackbar();

    return (
      <div style={{ padding: "20px" }}>
        <Button onClick={() => showInfo("Here's some useful information for you.")}>
          Show Info Notification
        </Button>
      </div>
    );
  },
};

export const WithAction: Story = {
  render: () => {
    const { showSuccess } = useSnackbar();

    return (
      <div style={{ padding: "20px" }}>
        <Button
          onClick={() =>
            showSuccess("File uploaded successfully", {
              action: {
                label: "View",
                onClick: () => alert("Opening file..."),
              },
            })
          }
        >
          Show with Action
        </Button>
      </div>
    );
  },
};

export const PersistentNotification: Story = {
  render: () => {
    const { showWarning } = useSnackbar();

    return (
      <div style={{ padding: "20px" }}>
        <Button
          onClick={() =>
            showWarning("This notification won't auto-close. You must close it manually.", {
              duration: 0,
            })
          }
        >
          Show Persistent Notification
        </Button>
      </div>
    );
  },
};

export const MultipleNotifications: Story = {
  render: () => {
    const { showSuccess, showInfo, showWarning, showError } = useSnackbar();

    return (
      <div style={{ padding: "20px" }}>
        <Button
          onClick={() => {
            showSuccess("First notification");
            setTimeout(() => showInfo("Second notification"), 300);
            setTimeout(() => showWarning("Third notification"), 600);
            setTimeout(() => showError("Fourth notification"), 900);
          }}
        >
          Show Multiple Notifications
        </Button>
      </div>
    );
  },
};

export const CustomComponent: Story = {
  render: () => {
    const { showSnackbar } = useSnackbar();

    return (
      <div style={{ padding: "20px" }}>
        <Button
          onClick={() =>
            showSnackbar({
              component: () => (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <UserCircle size={40} style={{ color: "#667eea" }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "2px" }}>
                      New Message
                    </div>
                    <div style={{ fontSize: "13px", color: "#666" }}>
                      John Doe: "Hey, can we schedule a meeting?"
                    </div>
                  </div>
                </div>
              ),
              variant: "info",
              duration: 8000,
              action: {
                label: "Reply",
                onClick: () => alert("Opening chat..."),
              },
            })
          }
        >
          Show Custom Component
        </Button>
      </div>
    );
  },
};

export const UsageExample: Story = {
  render: () => (
    <div style={{ padding: "20px", maxWidth: "800px" }}>
      <h2 style={{ marginBottom: "16px" }}>Snackbar Usage Example</h2>
      <p style={{ marginBottom: "16px", color: "#666" }}>
        The Snackbar component requires two main parts:
      </p>
      <ol style={{ marginLeft: "20px", marginBottom: "24px", color: "#666" }}>
        <li style={{ marginBottom: "8px" }}>
          <strong>SnackbarProvider:</strong> Wrap your app (or a section) with the provider
        </li>
        <li style={{ marginBottom: "8px" }}>
          <strong>SnackbarContainer:</strong> Add once to render notifications (typically at the root)
        </li>
        <li style={{ marginBottom: "8px" }}>
          <strong>useSnackbar hook:</strong> Use in components to show notifications
        </li>
      </ol>

      <pre
        style={{
          background: "#f5f5f5",
          padding: "16px",
          borderRadius: "8px",
          overflow: "auto",
          fontSize: "13px",
          lineHeight: "1.6",
        }}
      >
        {`// 1. Wrap your app with SnackbarProvider
import { SnackbarProvider, SnackbarContainer } from '@pmealha/eidos-ui';

function App() {
  return (
    <SnackbarProvider>
      <YourApp />
      <SnackbarContainer />
    </SnackbarProvider>
  );
}

// 2. Use in your components
import { useSnackbar } from '@pmealha/eidos-ui';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useSnackbar();

  const handleSave = async () => {
    try {
      await saveData();
      showSuccess('Data saved successfully!');
    } catch (error) {
      showError('Failed to save data', {
        action: {
          label: 'Retry',
          onClick: () => handleSave()
        }
      });
    }
  };

  return <button onClick={handleSave}>Save</button>;
}`}
      </pre>

      <div style={{ marginTop: "24px" }}>
        <SnackbarDemo />
      </div>
    </div>
  ),
};

