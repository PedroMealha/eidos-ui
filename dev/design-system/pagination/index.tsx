import { useState } from 'react';
import { Pagination } from '../../../src/components/Pagination';
import { Section, Col } from '../shared/Section';

export const PaginationShowcase = () => {
  const [page, setPage] = useState(1);
  const [page2, setPage2] = useState(5);
  const [page3, setPage3] = useState(3);

  return (
    <Col>
      <Section label="Default (10 pages)">
        <Pagination page={page} totalPages={10} onChange={setPage} />
      </Section>

      <Section label="Many pages - ellipsis (50 pages)">
        <Pagination page={page2} totalPages={50} onChange={setPage2} />
      </Section>

      <Section label="No first/last buttons">
        <Pagination page={page3} totalPages={15} onChange={setPage3} showFirstLast={false} />
      </Section>

      <Section label="Colors">
        <Col>
          <Pagination page={3} totalPages={8} onChange={() => {}} color="primary" />
          <Pagination page={3} totalPages={8} onChange={() => {}} color="secondary" />
          <Pagination page={3} totalPages={8} onChange={() => {}} color="success" />
          <Pagination page={3} totalPages={8} onChange={() => {}} color="danger" />
        </Col>
      </Section>

      <Section label="Sizes">
        <Col>
          <Pagination page={3} totalPages={8} onChange={() => {}} size="sm" />
          <Pagination page={3} totalPages={8} onChange={() => {}} size="md" />
          <Pagination page={3} totalPages={8} onChange={() => {}} size="lg" />
        </Col>
      </Section>

      <Section label="Disabled">
        <Pagination page={3} totalPages={10} onChange={() => {}} disabled />
      </Section>
    </Col>
  );
};
