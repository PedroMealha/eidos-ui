import { Home, Folder, FileText, ChevronRight } from 'lucide-react';
import { Breadcrumb } from '../../../src/components/Breadcrumb';
import { Section, Col } from '../shared/Section';

export const BreadcrumbShowcase = () => (
  <Col>
    <Section label="Default">
      <Breadcrumb
        items={[
          { label: 'Home', onClick: () => {} },
          { label: 'Documents', onClick: () => {} },
          { label: 'Projects', onClick: () => {} },
          { label: 'eidos-ui' },
        ]}
      />
    </Section>

    <Section label="With icons">
      <Breadcrumb
        items={[
          { label: 'Home', icon: <Home />, onClick: () => {} },
          { label: 'Projects', icon: <Folder />, onClick: () => {} },
          { label: 'README.md', icon: <FileText /> },
        ]}
      />
    </Section>

    <Section label="Custom separator (chevron)">
      <Breadcrumb
        separator={<ChevronRight size={12} />}
        items={[
          { label: 'Dashboard', onClick: () => {} },
          { label: 'Settings', onClick: () => {} },
          { label: 'Profile' },
        ]}
      />
    </Section>

    <Section label="Custom separator (›)">
      <Breadcrumb
        separator="›"
        items={[
          { label: 'Home', onClick: () => {} },
          { label: 'Library', onClick: () => {} },
          { label: 'Data', onClick: () => {} },
          { label: 'Uploads', onClick: () => {} },
          { label: 'January 2025' },
        ]}
      />
    </Section>

    <Section label="Short (2 items)">
      <Breadcrumb
        items={[
          { label: 'Home', onClick: () => {} },
          { label: 'Current page' },
        ]}
      />
    </Section>

    <Section label="With href links">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: 'How to build a design system' },
        ]}
      />
    </Section>
  </Col>
);
