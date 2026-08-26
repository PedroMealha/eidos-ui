import { Radio, RadioGroup } from '../../../src/components/Radio';
import { Section, Grid, Col } from '../shared/Section';

const options = [
  { value: 'opt1', label: 'Option one' },
  { value: 'opt2', label: 'Option two' },
  { value: 'opt3', label: 'Option three' },
];

const optionsWithDisabled = [
  { value: 'opt1', label: 'Option one' },
  { value: 'opt2', label: 'Option two (disabled)', disabled: true },
  { value: 'opt3', label: 'Option three' },
];

export const RadioShowcase = () => (
  <Col>
    <Grid cols={3}>
      <Section label="Single Radio">
        <Col gap="0.75rem">
          <Radio label="Unchecked" name="single1" value="a" />
          <Radio label="Checked" name="single2" value="b" defaultChecked />
          <Radio label="Disabled" name="single3" value="c" disabled />
          <Radio label="Disabled checked" name="single4" value="d" disabled defaultChecked />
        </Col>
      </Section>

      <Section label="Vertical Group">
        <RadioGroup
          name="group-vertical"
          options={options}
          defaultValue="opt1"
          direction="vertical"
        />
      </Section>

      <Section label="With Error">
        <RadioGroup
          name="group-error"
          options={options}
          direction="vertical"
          error="Please select an option"
        />
      </Section>
    </Grid>

    <Grid cols={2}>
      <Section label="Horizontal Group">
        <RadioGroup
          name="group-horizontal"
          options={options}
          defaultValue="opt2"
          direction="horizontal"
        />
      </Section>

      <Section label="With Disabled Option">
        <RadioGroup
          name="group-disabled-opt"
          options={optionsWithDisabled}
          defaultValue="opt1"
          direction="vertical"
        />
      </Section>
    </Grid>

    <Grid cols={2}>
      <Section label="Sizes">
        <Col gap="1.25rem">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <RadioGroup
              key={size}
              name={`size-${size}`}
              options={[{ value: 'a', label: size }, { value: 'b', label: size }]}
              defaultValue="a"
              direction="horizontal"
              size={size}
            />
          ))}
        </Col>
      </Section>

      <Section label="Colors">
        <Col gap="0.75rem">
          {(['primary', 'secondary', 'success', 'danger'] as const).map((color) => (
            <Radio key={color} name={`color-${color}`} value={color} label={color} color={color} defaultChecked />
          ))}
        </Col>
      </Section>
    </Grid>
  </Col>
);
