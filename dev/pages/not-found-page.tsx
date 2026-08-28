import React from 'react';
import { Button, EmptyState } from '@pmealha/eidos-ui';
import { Compass } from 'lucide-react';
import { useRouter } from '../routes/router';

export const NotFoundPage: React.FC<{ homePath: string }> = ({ homePath }) => {
  const { path, navigate } = useRouter();

  return (
    <div className="mrd-page">
      <EmptyState
        icon={<Compass />}
        title="Nothing lives here"
        description={`No route matches "${path}".`}
        action={<Button onClick={() => navigate(homePath)}>Take me back</Button>}
      />
    </div>
  );
};
