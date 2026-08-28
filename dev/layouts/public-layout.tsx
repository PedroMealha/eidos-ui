import React from 'react';
import { Button } from '@pmealha/eidos-ui';
import { useRouter } from '../routes/router';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { path, navigate } = useRouter();

  return (
    <div className="mrd-public">
      <header className="mrd-public__header">
        <button className="mrd-brand" type="button" onClick={() => navigate('/')}>
          <span className="mrd-brand__mark">M</span>
          <span className="mrd-brand__name">Meridian</span>
        </button>

        {path !== '/sign-in' && (
          <Button size="sm" posIcon="arrow-right" onClick={() => navigate('/sign-in')}>
            Sign in
          </Button>
        )}
      </header>

      <main className="mrd-public__main">{children}</main>

      <footer className="mrd-public__footer">
        Built with <strong>eidos-ui</strong> - this is the library&apos;s local example app.
      </footer>
    </div>
  );
};
