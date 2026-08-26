import { useState } from 'react';
import { InlineEdit } from '../../../src/components/InlineEdit';
import { Section, Row, Col, Grid } from '../shared/Section';

export const InlineEditShowcase = () => {
  const [title, setTitle] = useState('Untitled document');
  const [price, setPrice] = useState('42.00');
  const [deadline, setDeadline] = useState('2025-12-31');

  return (
    <Col>
      <Grid cols={2}>
        <Section label="Uncontrolled (click to edit)">
          <Col>
            <InlineEdit value="Page title" size="md" />
            <InlineEdit value="Subtitle text" size="sm" />
          </Col>
        </Section>

        <Section label="Sizes">
          <Col>
            <InlineEdit value="Small" size="sm" />
            <InlineEdit value="Medium" size="md" />
            <InlineEdit value="Large" size="lg" />
          </Col>
        </Section>

        <Section label="Double-click trigger">
          <InlineEdit
            value="Double-click me to edit"
            trigger="doubleClick"
            size="md"
          />
        </Section>

        <Section label="With placeholder">
          <Col>
            <InlineEdit value="" placeholder="Add a title…" size="md" />
            <InlineEdit value="" placeholder="Add a description…" size="sm" />
          </Col>
        </Section>
      </Grid>

      <Grid cols={2}>
        <Section label="Controlled - title editor">
          <Col>
            <InlineEdit
              value={title}
              onChange={setTitle}
              onConfirm={setTitle}
              size="lg"
              fullWidth
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
              Current: "{title}"
            </span>
          </Col>
        </Section>

        <Section label="Number and date inputs">
          <Row>
            <InlineEdit
              type="number"
              value={price}
              onChange={setPrice}
              onConfirm={setPrice}
              size="md"
            />
            <InlineEdit
              type="date"
              value={deadline}
              onChange={setDeadline}
              onConfirm={setDeadline}
              size="md"
            />
          </Row>
        </Section>
      </Grid>

      <Section label="Custom display - renderDisplay">
        <InlineEdit
          value="Click to rename"
          renderDisplay={(v) => (
            <span style={{ fontStyle: 'italic', fontWeight: 700, color: 'var(--primary-600, #2563eb)' }}>
              {v}
            </span>
          )}
          size="md"
        />
      </Section>

      <Section label="Disabled">
        <Row>
          <InlineEdit value="Read-only value" disabled size="sm" />
          <InlineEdit value="Also read-only" disabled size="md" />
        </Row>
      </Section>
    </Col>
  );
};
