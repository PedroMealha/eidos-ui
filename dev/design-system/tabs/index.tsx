import { Tabs, Tab, TabPanel } from '../../../src/components/Tabs';
import { Section, Grid, Col } from '../shared/Section';

const PANEL_CONTENT = (label: string) => (
  <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
    Content for the <strong>{label}</strong> tab. Replace with your component or page section.
  </p>
);

export const TabsShowcase = () => (
  <Col>
    <Section label="Line (default)">
      <Tabs defaultValue="overview" variant="line">
        <Tab value="overview">Overview</Tab>
        <Tab value="details">Details</Tab>
        <Tab value="settings">Settings</Tab>
        <TabPanel value="overview">{PANEL_CONTENT('Overview')}</TabPanel>
        <TabPanel value="details">{PANEL_CONTENT('Details')}</TabPanel>
        <TabPanel value="settings">{PANEL_CONTENT('Settings')}</TabPanel>
      </Tabs>
    </Section>

    <Grid cols={2}>
      <Section label="Enclosed">
        <Tabs defaultValue="a" variant="enclosed">
          <Tab value="a">Tab A</Tab>
          <Tab value="b">Tab B</Tab>
          <Tab value="c">Tab C</Tab>
          <TabPanel value="a">{PANEL_CONTENT('Tab A')}</TabPanel>
          <TabPanel value="b">{PANEL_CONTENT('Tab B')}</TabPanel>
          <TabPanel value="c">{PANEL_CONTENT('Tab C')}</TabPanel>
        </Tabs>
      </Section>

      <Section label="Pills">
        <Tabs defaultValue="x" variant="pills">
          <Tab value="x">Tab X</Tab>
          <Tab value="y">Tab Y</Tab>
          <Tab value="z">Tab Z</Tab>
          <TabPanel value="x">{PANEL_CONTENT('Tab X')}</TabPanel>
          <TabPanel value="y">{PANEL_CONTENT('Tab Y')}</TabPanel>
          <TabPanel value="z">{PANEL_CONTENT('Tab Z')}</TabPanel>
        </Tabs>
      </Section>
    </Grid>

    <Grid cols={2}>
      <Section label="With disabled tab">
        <Tabs defaultValue="active1" variant="line">
          <Tab value="active1">Active</Tab>
          <Tab value="disabled" disabled>Disabled</Tab>
          <Tab value="active2">Also Active</Tab>
          <TabPanel value="active1">{PANEL_CONTENT('Active')}</TabPanel>
          <TabPanel value="disabled">{PANEL_CONTENT('Disabled')}</TabPanel>
          <TabPanel value="active2">{PANEL_CONTENT('Also Active')}</TabPanel>
        </Tabs>
      </Section>

      <Section label="Colors">
        <Col gap="1rem">
          {(['primary', 'secondary', 'success', 'danger'] as const).map((color) => (
            <Tabs key={color} defaultValue="t1" variant="line" color={color}>
              <Tab value="t1">First</Tab>
              <Tab value="t2">Second</Tab>
              <TabPanel value="t1" />
              <TabPanel value="t2" />
            </Tabs>
          ))}
        </Col>
      </Section>
    </Grid>

    <Section label="Sizes">
      <Col gap="1.5rem">
        {(['small', 'medium', 'large'] as const).map((size) => (
          <Tabs key={size} defaultValue="s1" variant="enclosed" size={size}>
            <Tab value="s1">{size} - Tab 1</Tab>
            <Tab value="s2">{size} - Tab 2</Tab>
            <TabPanel value="s1" />
            <TabPanel value="s2" />
          </Tabs>
        ))}
      </Col>
    </Section>

    <Section label="Full width">
      <Tabs defaultValue="fw1" variant="enclosed" fullWidth>
        <Tab value="fw1">Overview</Tab>
        <Tab value="fw2">Analytics</Tab>
        <Tab value="fw3">Reports</Tab>
        <TabPanel value="fw1">{PANEL_CONTENT('Overview')}</TabPanel>
        <TabPanel value="fw2">{PANEL_CONTENT('Analytics')}</TabPanel>
        <TabPanel value="fw3">{PANEL_CONTENT('Reports')}</TabPanel>
      </Tabs>
    </Section>
  </Col>
);
