import { useSnackbar } from '../../../src/components/Snackbar';
import { Button } from '../../../src/components/Button';
import { Section, Col, Row } from '../shared/Section';

export const SnackbarShowcase = () => {
  const { showSuccess, showError, showWarning, showInfo, clearAll } = useSnackbar();

  return (
    <Col gap="2rem">
      <Section label="Variants">
        <Row>
          <Button onClick={() => showSuccess('Operation completed successfully!')}>
            Success
          </Button>
          <Button onClick={() => showError('An error occurred. Please try again.')}>
            Error
          </Button>
          <Button onClick={() => showWarning('Warning: Please review your changes.')}>
            Warning
          </Button>
          <Button onClick={() => showInfo("Here's some useful information.")}>
            Info
          </Button>
        </Row>
      </Section>

      <Section label="With Actions">
        <Row>
          <Button
            onClick={() =>
              showSuccess('File uploaded successfully.', {
                action: { label: 'View', onClick: () => {} },
              })
            }
          >
            Success + View Action
          </Button>
          <Button
            onClick={() =>
              showError('Upload failed. Please try again.', {
                action: { label: 'Retry', onClick: () => {} },
              })
            }
          >
            Error + Retry Action
          </Button>
        </Row>
      </Section>

      <Section label="Duration">
        <Row>
          <Button onClick={() => showInfo('This notification lasts 10 seconds.', { duration: 10000 })}>
            10 Seconds
          </Button>
          <Button onClick={() => showSuccess('This closes in 2 seconds.', { duration: 2000 })}>
            2 Seconds
          </Button>
          <Button
            onClick={() =>
              showWarning('This notification will not auto-dismiss.', { duration: 0 })
            }
          >
            Persistent
          </Button>
        </Row>
      </Section>

      <Section label="Advanced">
        <Row>
          <Button
            onClick={() => {
              showSuccess('First notification');
              setTimeout(() => showInfo('Second notification'), 200);
              setTimeout(() => showWarning('Third notification'), 400);
            }}
          >
            Stack Multiple
          </Button>
          <Button
            variant="outlined"
            onClick={() => clearAll()}
          >
            Clear All
          </Button>
        </Row>
      </Section>
    </Col>
  );
};
