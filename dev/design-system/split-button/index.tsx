import { Save, FileText, Clock, Send, Mail, Calendar, Download, Archive } from 'lucide-react';
import { SplitButton } from '../../../src/components/SplitButton';
import { Section, Grid, Col } from '../shared/Section';

const noop = () => {};

export const SplitButtonShowcase = () => (
  <Col>
    <Grid cols={3}>
      <Section label="Variants">
        <Col>
          <SplitButton
            label="Save"
            preIcon={Save}
            onClick={noop}
            options={[
              { id: 'draft',    label: 'Save as draft',    icon: FileText, onClick: noop },
              { id: 'schedule', label: 'Schedule publish', icon: Clock,    onClick: noop },
            ]}
          />
          <SplitButton
            variant="outlined"
            label="Save"
            preIcon={Save}
            onClick={noop}
            options={[
              { id: 'draft',    label: 'Save as draft',    icon: FileText, onClick: noop },
              { id: 'schedule', label: 'Schedule publish', icon: Clock,    onClick: noop },
            ]}
          />
        </Col>
      </Section>

      <Section label="Colors">
        <Col>
          {(['primary', 'secondary', 'success', 'danger'] as const).map((color) => (
            <SplitButton
              key={color}
              color={color}
              label={color.charAt(0).toUpperCase() + color.slice(1)}
              onClick={noop}
              options={[
                { id: 'a', label: 'Option A', onClick: noop },
                { id: 'b', label: 'Option B', onClick: noop },
              ]}
            />
          ))}
        </Col>
      </Section>

      <Section label="Sizes">
        <Col>
          <SplitButton size="sm"  label="Small"  onClick={noop} options={[{ id: 'a', label: 'Option', onClick: noop }]} />
          <SplitButton size="md" label="Medium" onClick={noop} options={[{ id: 'a', label: 'Option', onClick: noop }]} />
          <SplitButton size="lg"  label="Large"  onClick={noop} options={[{ id: 'a', label: 'Option', onClick: noop }]} />
        </Col>
      </Section>
    </Grid>

    <Grid cols={2}>
      <Section label="Loading">
        <SplitButton
          loading
          label="Sending"
          preIcon={Send}
          onClick={noop}
          options={[
            { id: 'schedule', label: 'Schedule', icon: Calendar, onClick: noop },
            { id: 'draft',    label: 'Save draft', icon: Mail,   onClick: noop },
          ]}
        />
      </Section>

      <Section label="Disabled options">
        <SplitButton
          label="Export"
          preIcon={Download}
          onClick={noop}
          options={[
            { id: 'csv',     label: 'Export as CSV',  icon: Download, onClick: noop },
            { id: 'archive', label: 'Archive (Pro)',   icon: Archive,  onClick: noop, disabled: true },
          ]}
        />
      </Section>
    </Grid>
  </Col>
);
