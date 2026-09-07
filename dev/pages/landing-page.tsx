import React from 'react';
import { Badge, Button, Card, Chip } from '@pmealha/eidos-ui';
import { Gauge, Inbox, ShieldCheck } from 'lucide-react';
import { useRouter } from '../routes/router';

const FEATURES = [
  {
    icon: Inbox,
    title: 'One shared queue',
    body: 'Filter, sort and triage in a single table with bulk actions and saved views.',
  },
  {
    icon: Gauge,
    title: 'SLA you can see',
    body: 'Attainment and first-response time on the dashboard, not buried in a report.',
  },
  {
    icon: ShieldCheck,
    title: 'Roles that mean something',
    body: 'Admins manage the team; members stay focused on tickets.',
  },
];

export const LandingPage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="mrd-landing">
      <section className="mrd-hero">
        <Badge color="primary" variant="outlined" size="md">
          eidos-ui example app
        </Badge>
        <h1 className="mrd-hero__title">The support desk your team stops fighting</h1>
        <p className="mrd-hero__body">
          Meridian is a fictional B2B support desk built to exercise this component library the way
          a real product would - simulated API latency, real loading and error states, and a
          public/authenticated split.
        </p>
        <div className="mrd-hero__actions">
          <Button posIcon="arrow-right" onClick={() => navigate('/sign-in')}>
            Try the demo
          </Button>
          <Chip variant="outlined" color="secondary" preIcon="key-round">
            Code 123456
          </Chip>
        </div>
      </section>

      <section className="mrd-features">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <Card key={title} variant="outlined" padding="lg" className="mrd-feature">
            <span className="mrd-feature__icon">
              <Icon size={18} />
            </span>
            <h2 className="mrd-feature__title">{title}</h2>
            <p className="mrd-feature__body">{body}</p>
          </Card>
        ))}
      </section>
    </div>
  );
};
