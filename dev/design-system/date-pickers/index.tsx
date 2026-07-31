import { useState } from 'react';
import { DatePicker } from '../../../src/components/DatePicker';
import type { DateTimeValue } from '../../../src/components/DatePicker';
import { Section, Grid } from '../shared/Section';

export const DatePickerShowcase = () => {
  const [singleDate, setSingleDate] = useState<DateTimeValue<'single'> | undefined>(undefined);
  const [range, setRange] = useState<DateTimeValue<'range'> | undefined>(undefined);
  const [dateWithTime, setDateWithTime] = useState<DateTimeValue<'single'> | undefined>(undefined);

  return (
    <Grid cols={2}>
      <Section label="Single Date">
        <DatePicker
          mode="single"
          value={singleDate}
          onChange={(v) => setSingleDate(v as DateTimeValue<'single'>)}
          placeholder="Pick a date"
        />
      </Section>

      <Section label="Date Range">
        <DatePicker
          mode="range"
          value={range}
          onChange={(v) => setRange(v as DateTimeValue<'range'>)}
          placeholder="Pick a range"
        />
      </Section>

      <Section label="With Time">
        <DatePicker
          mode="single"
          value={dateWithTime}
          onChange={(v) => setDateWithTime(v as DateTimeValue<'single'>)}
          time={{ enabled: true }}
          placeholder="Pick a date and time"
        />
      </Section>
    </Grid>
  );
};
