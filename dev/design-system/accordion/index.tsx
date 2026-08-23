import { Accordion, AccordionItem } from '../../../src/components/Accordion';
import { Section, Grid, Col } from '../shared/Section';

const ITEMS = [
  {
    value: 'what',
    label: 'What is eidos-ui?',
    content:
      'eidos-ui is a React component library built with accessibility and design consistency in mind. Every component follows a shared set of conventions for props, theming, and interaction patterns.',
  },
  {
    value: 'why',
    label: 'Why build a custom component library?',
    content:
      'Custom libraries let you encode your design decisions once and reuse them everywhere - consistent spacing, colour, motion, and ARIA patterns without fighting a third-party API.',
  },
  {
    value: 'how',
    label: 'How do I install it?',
    content:
      'Run `npm install @pmealha/eidos-ui` and import the components you need. All styles are bundled and should be imported once at the root of your application.',
  },
];

export const AccordionShowcase = () => (
  <Col>
    <Grid cols={2}>
      <Section label="Default">
        <Accordion defaultValue="what">
          {ITEMS.map((item) => (
            <AccordionItem key={item.value} value={item.value} label={item.label}>
              {item.content}
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <Section label="Multiple open">
        <Accordion multiple defaultValue={['what', 'how']}>
          {ITEMS.map((item) => (
            <AccordionItem key={item.value} value={item.value} label={item.label}>
              {item.content}
            </AccordionItem>
          ))}
        </Accordion>
      </Section>
    </Grid>

    <Grid cols={2}>
      <Section label="Bordered">
        <Accordion variant="bordered" defaultValue="why">
          {ITEMS.map((item) => (
            <AccordionItem key={item.value} value={item.value} label={item.label}>
              {item.content}
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <Section label="Separated">
        <Accordion variant="separated" defaultValue="what">
          {ITEMS.map((item) => (
            <AccordionItem key={item.value} value={item.value} label={item.label}>
              {item.content}
            </AccordionItem>
          ))}
        </Accordion>
      </Section>
    </Grid>

    <Section label="Colors">
      <Grid cols={2}>
        {(['primary', 'secondary', 'success', 'danger'] as const).map((color) => (
          <div key={color}>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>{color}</p>
            <Accordion defaultValue="a" color={color} variant="bordered">
              <AccordionItem value="a" label="First item">Content for the first item.</AccordionItem>
              <AccordionItem value="b" label="Second item">Content for the second item.</AccordionItem>
            </Accordion>
          </div>
        ))}
      </Grid>
    </Section>

    <Section label="Sizes">
      <Col gap="1.5rem">
        {(['small', 'medium', 'large'] as const).map((size) => (
          <div key={size}>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>{size}</p>
            <Accordion size={size} variant="bordered">
              <AccordionItem value="a" label="Item one">Content for item one.</AccordionItem>
              <AccordionItem value="b" label="Item two">Content for item two.</AccordionItem>
            </Accordion>
          </div>
        ))}
      </Col>
    </Section>

    <Grid cols={2}>
      <Section label="With disabled item">
        <Accordion defaultValue="a">
          <AccordionItem value="a" label="Active item">This item is active and can be toggled.</AccordionItem>
          <AccordionItem value="b" label="Disabled item" disabled>This item cannot be toggled.</AccordionItem>
          <AccordionItem value="c" label="Another active">This item is also active.</AccordionItem>
        </Accordion>
      </Section>

      <Section label="Deeply nested content">
        <Accordion variant="separated" defaultValue="nested">
          <AccordionItem value="nested" label="Rich content">
            <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.8 }}>
              <li>Support for any React node as children</li>
              <li>Lists, images, forms - anything goes</li>
              <li>Height animates based on real scrollHeight</li>
            </ul>
          </AccordionItem>
          <AccordionItem value="plain" label="Plain text">
            Just a paragraph of text inside the panel.
          </AccordionItem>
        </Accordion>
      </Section>
    </Grid>
  </Col>
);
