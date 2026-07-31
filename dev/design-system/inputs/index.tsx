import { Mail, User, Search, Calendar, HelpCircle, DollarSign } from 'lucide-react';
import { Input } from '../../../src/components/Input';
import { Section, Col, Row, Grid } from '../shared/Section';

export const InputShowcase = () => (
  <Grid cols={3}>
    <Section label="Basic">
      <Col>
        <Input type="email" label="Email" placeholder="you@example.com" preIcon={Mail} />
        <Input type="password" label="Password" placeholder="••••••••" />
        <Input type="text" label="Username" placeholder="johndoe" preIcon={User} />
      </Col>
    </Section>

    <Section label="Variants">
      <Col>
        <Input variant="filled" label="Filled" placeholder="Filled variant" />
        <Input variant="outlined" label="Outlined" placeholder="Outlined variant" />
        <Input variant="text" label="Text" placeholder="Text variant" />
      </Col>
    </Section>

    <Section label="Colors">
      <Col>
        <Input color="primary" label="Primary" placeholder="Primary color" />
        <Input color="secondary" label="Secondary" placeholder="Secondary color" />
        <Input color="success" label="Success" placeholder="Success color" />
        <Input color="danger" label="Danger" placeholder="Danger color" />
      </Col>
    </Section>

    <Section label="Sizes">
      <Col>
        <Input size="small" label="Small" placeholder="Small size" />
        <Input size="medium" label="Medium" placeholder="Medium size" />
        <Input size="large" label="Large" placeholder="Large size" />
      </Col>
    </Section>

    <Section label="States">
      <Col>
        <Input label="Required" placeholder="This field is required" required />
        <Input label="Disabled" placeholder="Cannot be edited" disabled />
        <Input label="Loading" placeholder="Fetching data…" loading />
        <Input
          label="Error"
          placeholder="Enter a valid email"
          defaultValue="bad@val"
          error="Please enter a valid email address."
        />
      </Col>
    </Section>

    <Section label="Icons & Actions">
      <Col>
        <Input label="Search" placeholder="Search…" preIcon={Search} />
        <Input label="Due Date" placeholder="Pick a date" posIcon={Calendar} />
        <Input
          label="Search Action"
          placeholder="Type and press the icon"
          posIcon={Search}
          posIconButton
          onPosIconClick={() => alert('Search triggered!')}
        />
      </Col>
    </Section>

    <div style={{ gridColumn: '1 / -1' }}>
      <Section label="Disclaimer">
        <Row>
          <Input
            label="Annual Revenue"
            placeholder="0.00"
            preIcon={DollarSign}
            disclaimerIcon={HelpCircle}
            disclaimerContent="Used for tax calculations. Must reflect your total gross annual revenue before deductions."
          />
        </Row>
      </Section>
    </div>

    <div style={{ gridColumn: '1 / -1' }}>
      <Section label="Full Width">
        <Input
          label="Full Width Input"
          placeholder="This input spans the full container width"
          fullWidth
        />
      </Section>
    </div>
  </Grid>
);
