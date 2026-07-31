import { User, Mail, Phone } from 'lucide-react';
import { Select } from '../../../src/components/Select';
import type { SelectOption } from '../../../src/components/Select';
import { Section, Grid } from '../shared/Section';

const fruitOptions: SelectOption[] = [
  { id: '1', label: 'Apple', value: 'apple' },
  { id: '2', label: 'Banana', value: 'banana' },
  { id: '3', label: 'Orange', value: 'orange' },
  { id: '4', label: 'Grape', value: 'grape' },
];

const contactOptions: SelectOption[] = [
  { id: '1', label: 'User Profile', value: 'user', icon: User },
  { id: '2', label: 'Email Address', value: 'email', icon: Mail },
  { id: '3', label: 'Phone Number', value: 'phone', icon: Phone },
];

export const SelectShowcase = () => (
  <Grid cols={2}>
    <Section label="Single Select">
      <Select
        options={fruitOptions}
        placeholder="Select a fruit…"
        inputProps={{ label: 'Favorite Fruit' }}
        minWidth={240}
      />
    </Section>

    <Section label="Multiple Select">
      <Select
        options={fruitOptions}
        multiple
        placeholder="Select fruits…"
        inputProps={{ label: 'Favorite Fruits' }}
        minWidth={240}
      />
    </Section>

    <Section label="With Icons">
      <Select
        options={contactOptions}
        placeholder="Select contact type…"
        inputProps={{ label: 'Contact Method' }}
        minWidth={240}
      />
    </Section>

    <Section label="Disabled">
      <Select
        options={fruitOptions}
        placeholder="Cannot be changed"
        disabled
        inputProps={{ label: 'Disabled Select' }}
        minWidth={240}
      />
    </Section>

    <Section label="Required">
      <Select
        options={fruitOptions}
        placeholder="This field is required…"
        required
        inputProps={{ label: 'Required Select' }}
        minWidth={240}
      />
    </Section>
  </Grid>
);
