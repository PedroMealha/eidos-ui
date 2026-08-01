
import { GitCommit, GitMerge, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { Timeline } from '../../../src/components/Timeline';
import { Section, Col, Grid } from '../shared/Section';

const ITEMS_DEFAULT = [
  {
    id: '1',
    title: 'Pull request opened',
    description: 'Pedro opened PR #42: "Add Stepper component"',
    timestamp: '2 hours ago',
    color: 'primary' as const,
  },
  {
    id: '2',
    title: 'Review requested',
    description: 'Review requested from the design team.',
    timestamp: '1 hour ago',
    color: 'secondary' as const,
  },
  {
    id: '3',
    title: 'Tests failed',
    description: 'CI pipeline failed on the type-check step.',
    timestamp: '45 min ago',
    color: 'danger' as const,
  },
  {
    id: '4',
    title: 'Tests passed',
    description: 'All 42 checks passed. Ready to merge.',
    timestamp: 'Just now',
    color: 'success' as const,
  },
];

const ITEMS_WITH_ICONS = [
  { id: '1', title: 'Commit pushed',       timestamp: '9:00 AM', icon: <GitCommit size={14} />,  color: 'primary' as const },
  { id: '2', title: 'Branch merged',       timestamp: '9:15 AM', icon: <GitMerge size={14} />,   color: 'success' as const },
  { id: '3', title: 'Issue reported',      timestamp: '10:30 AM', icon: <AlertCircle size={14} />, color: 'danger' as const },
  { id: '4', title: 'Issue resolved',      timestamp: '11:00 AM', icon: <CheckCircle2 size={14} />, color: 'success' as const },
  { id: '5', title: 'Assigned to Pedro',   timestamp: '11:05 AM', icon: <User size={14} />,       color: 'default' as const },
];

export const TimelineShowcase = () => (
  <Col>
    <Section label="Default">
      <Timeline items={ITEMS_DEFAULT} />
    </Section>

    <Section label="With icons">
      <Timeline items={ITEMS_WITH_ICONS} />
    </Section>

    <Section label="Simple (no timestamps)">
      <Timeline
        items={[
          { id: '1', title: 'Account created' },
          { id: '2', title: 'Profile updated',    description: 'Name and avatar changed.' },
          { id: '3', title: 'Subscription started', description: 'Pro plan activated.' },
        ]}
      />
    </Section>

    <Section label="All colors">
      <Grid cols={2}>
        {(['default', 'primary', 'secondary', 'success', 'danger'] as const).map((color) => (
          <Timeline
            key={color}
            items={[
              { id: '1', title: color, description: 'Example timeline item', color },
              { id: '2', title: 'Next step', color },
            ]}
          />
        ))}
      </Grid>
    </Section>
  </Col>
);
