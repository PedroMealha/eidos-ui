import { TagInput } from '../../../src/components/TagInput';
import { Section, Row, Grid } from '../shared/Section';

export const TagInputShowcase = () => (
  <Grid cols={3}>
    <Section label="Basic">
      <TagInput placeholder="Add tag…" />
    </Section>

    <Section label="With Initial Tags">
      <TagInput
        defaultValue={['React', 'TypeScript', 'Design Systems']}
        placeholder="Add tag…"
      />
    </Section>

    <Section label="Label & Hint">
      <TagInput
        label="Technologies"
        hint="Press Enter or comma to add a tag"
        placeholder="Add tag…"
      />
    </Section>

    <Section label="Validation">
      <TagInput
        label="Validated Tags"
        hint="Each tag must be at least 2 characters"
        placeholder="Add tag…"
        validate={(tag) => tag.length >= 2 || 'Tag must be at least 2 characters'}
      />
    </Section>

    <Section label="Max Tags">
      <TagInput
        label="Max 3 Tags"
        hint="You can add up to 3 tags"
        placeholder="Add tag…"
        maxTags={3}
        defaultValue={['React', 'TypeScript']}
      />
    </Section>

    <Section label="Disabled">
      <TagInput
        label="Disabled"
        defaultValue={['React', 'TypeScript']}
        placeholder="Add tag…"
        disabled
      />
    </Section>

    <div style={{ gridColumn: '1 / -1' }}>
      <Section label="Sizes">
        <Row wrap={false}>
          <TagInput size="small" placeholder="Small" />
          <TagInput size="medium" placeholder="Medium" />
          <TagInput size="large" placeholder="Large" />
        </Row>
      </Section>
    </div>
  </Grid>
);
