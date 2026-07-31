import { useState } from 'react';
import { Alert } from '../../../src/components/Alert';
import { Section, Col } from '../shared/Section';

export const AlertShowcase = () => {
  const [dismissed, setDismissed] = useState(false);

  return (
    <Col>
      <Section label="Variants">
        <Col gap="0.75rem">
          <Alert variant="info">This is an informational message.</Alert>
          <Alert variant="success">Operation completed successfully.</Alert>
          <Alert variant="warning">Please review the changes before proceeding.</Alert>
          <Alert variant="danger">An error occurred. Please try again.</Alert>
        </Col>
      </Section>

      <Section label="With Title">
        <Col gap="0.75rem">
          <Alert variant="info" title="Did you know?">
            You can use the Tab key to navigate between form fields without using your mouse.
          </Alert>
          <Alert variant="success" title="File uploaded">
            Your file has been uploaded and is being processed. This may take a few minutes.
          </Alert>
          <Alert variant="warning" title="Session expiring">
            Your session will expire in 5 minutes. Save your work to avoid losing changes.
          </Alert>
          <Alert variant="danger" title="Payment failed">
            We couldn't charge your card. Please update your payment method and try again.
          </Alert>
        </Col>
      </Section>

      <Section label="With Actions">
        <Col gap="0.75rem">
          <Alert
            variant="info"
            title="Update available"
            action={{ label: 'Update now', onClick: () => {} }}
          >
            A new version of the app is available with performance improvements.
          </Alert>
          <Alert
            variant="danger"
            title="Failed to save"
            action={{ label: 'Retry', onClick: () => {} }}
          >
            Changes could not be saved due to a network error.
          </Alert>
        </Col>
      </Section>

      <Section label="Dismissable">
        {dismissed ? (
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            Alert dismissed.{' '}
            <button
              onClick={() => setDismissed(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6d28d9', fontSize: 'inherit', padding: 0 }}
            >
              Show again
            </button>
          </p>
        ) : (
          <Alert
            variant="warning"
            title="Unsaved changes"
            onDismiss={() => setDismissed(true)}
          >
            You have unsaved changes. They will be lost if you navigate away.
          </Alert>
        )}
      </Section>

      <Section label="Without Icon">
        <Col gap="0.75rem">
          <Alert variant="info" icon={false}>An alert without an icon for a more minimal style.</Alert>
          <Alert variant="success" icon={false} title="Done">All tasks completed.</Alert>
        </Col>
      </Section>
    </Col>
  );
};
