import React from 'react';
import { Alert, Card } from 'eidos-ui';

export const AdvancedPage: React.FC = () => (
  <Card variant="outlined" padding="lg">
    <Alert variant="warning" title="Demo environment">
      This example app keeps everything in memory. Reloading the page restores the original seed
      data, and no request ever leaves the browser.
    </Alert>
  </Card>
);
