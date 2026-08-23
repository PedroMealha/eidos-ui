import { useState } from 'react';
import { List, LayoutGrid, Table2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { SegmentedControl } from '../../../src/components/SegmentedControl';
import { Section, Grid, Col } from '../shared/Section';

export const SegmentedControlShowcase = () => {
  const [view, setView] = useState('list');
  const [align, setAlign] = useState('left');

  return (
    <Col>
      <Grid cols={3}>
        <Section label="Text labels">
          <SegmentedControl
            options={[
              { value: 'day',   label: 'Day' },
              { value: 'week',  label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
            defaultValue="week"
          />
        </Section>

        <Section label="Icon-only (with tooltips)">
          <SegmentedControl
            value={view}
            onChange={setView}
            options={[
              { value: 'list',  icon: List,       tooltip: 'List view' },
              { value: 'grid',  icon: LayoutGrid, tooltip: 'Grid view' },
              { value: 'table', icon: Table2,     tooltip: 'Table view' },
            ]}
          />
        </Section>

        <Section label="Icons + labels">
          <SegmentedControl
            options={[
              { value: 'b', icon: Bold,      label: 'Bold' },
              { value: 'i', icon: Italic,    label: 'Italic' },
              { value: 'u', icon: Underline, label: 'Underline' },
            ]}
            defaultValue="b"
          />
        </Section>
      </Grid>

      <Grid cols={3}>
        <Section label="Sizes">
          <Col>
            <SegmentedControl size="small"  options={[{ value: 'a', label: 'Small' }, { value: 'b', label: 'Group' }]} defaultValue="a" />
            <SegmentedControl size="medium" options={[{ value: 'a', label: 'Medium' }, { value: 'b', label: 'Group' }]} defaultValue="a" />
            <SegmentedControl size="large"  options={[{ value: 'a', label: 'Large' }, { value: 'b', label: 'Group' }]} defaultValue="a" />
          </Col>
        </Section>

        <Section label="Colors">
          <Col>
            <SegmentedControl color="primary"   options={[{ value: 'a', label: 'Primary' }, { value: 'b', label: 'B' }]} defaultValue="a" />
            <SegmentedControl color="secondary" options={[{ value: 'a', label: 'Secondary' }, { value: 'b', label: 'B' }]} defaultValue="a" />
            <SegmentedControl color="success"   options={[{ value: 'a', label: 'Success' }, { value: 'b', label: 'B' }]} defaultValue="a" />
            <SegmentedControl color="danger"    options={[{ value: 'a', label: 'Danger' }, { value: 'b', label: 'B' }]} defaultValue="a" />
          </Col>
        </Section>

        <Section label="Disabled segment + full control disabled">
          <Col>
            <SegmentedControl
              options={[
                { value: 'a', label: 'Active' },
                { value: 'b', label: 'Disabled', disabled: true },
                { value: 'c', label: 'Active' },
              ]}
              defaultValue="a"
            />
            <SegmentedControl
              disabled
              options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]}
              defaultValue="a"
            />
          </Col>
        </Section>
      </Grid>

      <Section label="Full width - alignment picker">
        <SegmentedControl
          fullWidth
          value={align}
          onChange={setAlign}
          options={[
            { value: 'left',    icon: AlignLeft,    tooltip: 'Left' },
            { value: 'center',  icon: AlignCenter,  tooltip: 'Center' },
            { value: 'right',   icon: AlignRight,   tooltip: 'Right' },
            { value: 'justify', icon: AlignJustify, tooltip: 'Justify' },
          ]}
        />
      </Section>
    </Col>
  );
};
