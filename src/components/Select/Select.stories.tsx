import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select.component";
import { User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { useState } from "react";

const meta: Meta<typeof Select> = {
  title: "Forms/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    options: {
      control: "object",
      description: "Array of options to display in the select dropdown",
      table: {
        type: { summary: "SelectOption[]" },
      },
    },
    value: {
      control: "text",
      description: "Selected value(s). Can be a string or array of strings for multiple selection",
      table: {
        type: { summary: "string | string[]" },
      },
    },
    onChange: {
      action: "changed",
      description: "Callback fired when the selection changes",
      table: {
        type: { summary: "(value: string | string[]) => void" },
      },
    },
    multiple: {
      control: "boolean",
      description: "Enable multiple selection",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    placeholder: {
      control: "text",
      description: "Placeholder text when no value is selected",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "Select an option..." },
      },
    },
    disabled: {
      control: "boolean",
      description: "Disable the select input",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    clearable: {
      control: "boolean",
      description: "Show a clear button when a value is selected",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    fullWidth: {
      control: "boolean",
      description: "Make the select take full width of its container",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    autoWidth: {
      control: "boolean",
      description: "Automatically match dropdown width to trigger width",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
      table: {
        type: { summary: "string" },
      },
    },
    name: {
      control: "text",
      description: "Name attribute for form submission",
      table: {
        type: { summary: "string" },
      },
    },
    id: {
      control: "text",
      description: "ID attribute for the select",
      table: {
        type: { summary: "string" },
      },
    },
    required: {
      control: "boolean",
      description: "Mark the select as required in a form",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    minWidth: {
      control: "text",
      description: "Minimum width of the dropdown",
      table: {
        type: { summary: "number | string" },
      },
    },
    maxWidth: {
      control: "text",
      description: "Maximum width of the dropdown",
      table: {
        type: { summary: "number | string" },
      },
    },
    maxHeight: {
      control: "text",
      description: "Maximum height of the dropdown (enables scrolling)",
      table: {
        type: { summary: "number | string" },
        defaultValue: { summary: "300px" },
      },
    },
    inputProps: {
      control: "object",
      description: "Additional props to pass to the underlying Input component",
      table: {
        type: { summary: "Partial<InputProps>" },
      },
    },
    dropdownProps: {
      control: "object",
      description: "Additional props to pass to the underlying Dropdown component",
      table: {
        type: { summary: "object" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic options without icons
const basicOptions = [
  { id: "1", label: "Apple", value: "apple" },
  { id: "2", label: "Banana", value: "banana" },
  { id: "3", label: "Cherry", value: "cherry" },
  { id: "4", label: "Date", value: "date" },
  { id: "5", label: "Elderberry", value: "elderberry" },
];

// Options with component-based icons
const optionsWithComponentIcons = [
  { id: "1", label: "John Doe", value: "john", icon: User },
  { id: "2", label: "jane@example.com", value: "jane", icon: Mail },
  { id: "3", label: "+1 234 567 890", value: "phone", icon: Phone },
  { id: "4", label: "New York, USA", value: "ny", icon: MapPin },
  { id: "5", label: "2025-10-12", value: "date", icon: Calendar },
];


// Options with disabled state
const optionsWithDisabled = [
  { id: "1", label: "Available Option", value: "available" },
  { id: "2", label: "Disabled Option", value: "disabled", disabled: true },
  { id: "3", label: "Another Available", value: "available2" },
  { id: "4", label: "Also Disabled", value: "disabled2", disabled: true },
];

export const SingleSelect: Story = {
  args: {
    options: basicOptions,
    placeholder: "Select a fruit...",
  },
};

export const WithComponentIcons: Story = {
  args: {
    options: optionsWithComponentIcons,
    placeholder: "Select an option...",
  },
};

export const MultipleSelect: Story = {
  args: {
    options: basicOptions,
    multiple: true,
    placeholder: "Select multiple fruits...",
  },
};

export const WithDisabledOptions: Story = {
  args: {
    options: optionsWithDisabled,
    placeholder: "Some options are disabled...",
  },
};

export const Disabled: Story = {
  args: {
    options: basicOptions,
    disabled: true,
    placeholder: "This select is disabled...",
  },
};

export const NotClearable: Story = {
  args: {
    options: basicOptions,
    clearable: false,
    placeholder: "Select without clear button...",
  },
};

export const FullWidth: Story = {
  args: {
    options: basicOptions,
    fullWidth: true,
    placeholder: "Full width select...",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
};

export const ControlledExample: Story = {
  render: (args) => {
    const [value, setValue] = useState<string>("");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Select
          {...args}
          options={basicOptions}
          value={value}
          onChange={(newValue) => setValue(newValue as string)}
          placeholder="Select a fruit..."
        />
        <div style={{ fontSize: "14px", color: "#666" }}>
          Selected value: <strong>{value || "None"}</strong>
        </div>
      </div>
    );
  },
};

export const MultipleControlled: Story = {
  render: (args) => {
    const [values, setValues] = useState<string[]>([]);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Select
          {...args}
          options={basicOptions}
          multiple
          value={values}
          onChange={(newValues) => setValues(newValues as string[])}
          placeholder="Select multiple fruits..."
        />
        <div style={{ fontSize: "14px", color: "#666" }}>
          Selected values: <strong>{values.length > 0 ? values.join(", ") : "None"}</strong>
        </div>
      </div>
    );
  },
};

export const Examples: Story = {
  render: () => {
    const label: React.CSSProperties = {
      marginBottom: "0.625rem",
      fontSize: "0.7rem",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      color: "#94a3b8",
    };

    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "2rem 3rem",
        padding: "1.5rem",
      }}>
        <div>
          <p style={label}>Single Select</p>
          <Select options={basicOptions} placeholder="Select a fruit..." />
        </div>

        <div>
          <p style={label}>Multiple Selection</p>
          <Select options={basicOptions} multiple placeholder="Select multiple fruits..." />
        </div>

        <div>
          <p style={label}>With Icons</p>
          <Select options={optionsWithComponentIcons} placeholder="Select with icons..." />
        </div>

        <div>
          <p style={label}>With Disabled Options</p>
          <Select options={optionsWithDisabled} placeholder="Some options are disabled..." />
        </div>

        <div>
          <p style={label}>Required</p>
          <Select options={basicOptions} required placeholder="This field is required..." />
        </div>

        <div>
          <p style={label}>Not Clearable</p>
          <Select options={basicOptions} clearable={false} placeholder="No clear button..." />
        </div>

        <div>
          <p style={label}>Disabled</p>
          <Select options={basicOptions} disabled placeholder="This select is disabled..." />
        </div>

        <div>
          <p style={label}>Custom Input Styling</p>
          <Select
            options={optionsWithComponentIcons}
            placeholder="Success variant..."
            inputProps={{ variant: "filled", color: "success" }}
          />
        </div>
      </div>
    );
  },
};

