import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select.component";
import { User, Mail, Phone, MapPin, Calendar, Heart } from "lucide-react";
import { useState } from "react";

const meta: Meta<typeof Select> = {
  title: "Components/Select",
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

// Options with string-based icons
const optionsWithStringIcons = [
  { id: "1", label: "Heart", value: "heart", icon: "heart" },
  { id: "2", label: "Star", value: "star", icon: "star" },
  { id: "3", label: "Circle", value: "circle", icon: "circle" },
  { id: "4", label: "Square", value: "square", icon: "square" },
  { id: "5", label: "Triangle", value: "triangle", icon: "triangle" },
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

export const WithStringIcons: Story = {
  args: {
    options: optionsWithStringIcons,
    placeholder: "Select a shape...",
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
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "400px" }}>
      {/* Basic Single Select */}
      <div>
        <h3 style={{ marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Basic Single Select
        </h3>
        <Select
          options={basicOptions}
          placeholder="Select a fruit..."
        />
      </div>

      {/* Multiple Select */}
      <div>
        <h3 style={{ marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Multiple Selection
        </h3>
        <Select
          options={basicOptions}
          multiple
          placeholder="Select multiple fruits..."
        />
      </div>

      {/* With Component Icons */}
      <div>
        <h3 style={{ marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          With Component Icons (Lucide)
        </h3>
        <Select
          options={optionsWithComponentIcons}
          placeholder="Select with icons..."
        />
      </div>

      {/* With String Icons */}
      <div>
        <h3 style={{ marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          With String Icons (Lucide names)
        </h3>
        <Select
          options={optionsWithStringIcons}
          placeholder="Select a shape..."
        />
      </div>

      {/* With Disabled Options */}
      <div>
        <h3 style={{ marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          With Disabled Options
        </h3>
        <Select
          options={optionsWithDisabled}
          placeholder="Some options are disabled..."
        />
      </div>

      {/* Required Field */}
      <div>
        <h3 style={{ marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Required Field
        </h3>
        <Select
          options={basicOptions}
          required
          placeholder="This field is required..."
        />
      </div>

      {/* Not Clearable */}
      <div>
        <h3 style={{ marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Not Clearable
        </h3>
        <Select
          options={basicOptions}
          clearable={false}
          placeholder="No clear button..."
        />
      </div>

      {/* Disabled */}
      <div>
        <h3 style={{ marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Disabled State
        </h3>
        <Select
          options={basicOptions}
          disabled
          placeholder="This select is disabled..."
        />
      </div>

      {/* With Custom Input Props */}
      <div>
        <h3 style={{ marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          With Custom Input Styling
        </h3>
        <Select
          options={optionsWithComponentIcons}
          placeholder="With custom input props..."
          inputProps={{
            variant: "filled",
            color: "success",
          }}
        />
      </div>
    </div>
  ),
};

