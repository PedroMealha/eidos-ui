import { Inbox, SearchX, FolderOpen, AlertCircle, FileText } from 'lucide-react';
import { EmptyState } from '../../../src/components/EmptyState';
import { Button } from '../../../src/components/Button';
import { Section, Grid, Col } from '../shared/Section';

export const EmptyStateShowcase = () => (
  <Col>
    <Grid cols={2}>
      <Section label="No data">
        <EmptyState
          icon={<Inbox />}
          title="No messages yet"
          description="When you receive messages, they'll show up here."
          action={<Button size="sm">Compose message</Button>}
        />
      </Section>

      <Section label="No search results">
        <EmptyState
          icon={<SearchX />}
          title="No results found"
          description="Try adjusting your search or filters to find what you're looking for."
          action={<Button size="sm" variant="outlined">Clear filters</Button>}
        />
      </Section>
    </Grid>

    <Grid cols={2}>
      <Section label="Error state">
        <EmptyState
          icon={<AlertCircle />}
          title="Something went wrong"
          description="We couldn't load your data. Please try again."
          action={<Button size="sm" color="danger">Try again</Button>}
        />
      </Section>

      <Section label="Empty folder">
        <EmptyState
          icon={<FolderOpen />}
          title="This folder is empty"
          description="Create your first document to get started."
          action={<Button size="sm" preIcon={FileText}>New document</Button>}
        />
      </Section>
    </Grid>

    <Section label="Sizes">
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <EmptyState
            key={size}
            icon={<Inbox />}
            title={`${size} - Empty state`}
            description="Supporting text goes here."
            size={size}
          />
        ))}
      </div>
    </Section>

    <Section label="Without icon">
      <EmptyState
        title="No notifications"
        description="You're all caught up! Check back later for new updates."
      />
    </Section>
  </Col>
);
