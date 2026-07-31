import { useState } from 'react';
import { CircleCheck, CircleAlert, CircleX, Info } from 'lucide-react';
import { Modal } from '../../../src/components/Modal';
import { Button } from '../../../src/components/Button';
import { Section, Col, Row } from '../shared/Section';

export const ModalShowcase = () => {
  const [basicOpen, setBasicOpen] = useState<boolean>(false);
  const [infoOpen, setInfoOpen] = useState<boolean>(false);
  const [successOpen, setSuccessOpen] = useState<boolean>(false);
  const [warningOpen, setWarningOpen] = useState<boolean>(false);
  const [dangerOpen, setDangerOpen] = useState<boolean>(false);
  const [actionsOpen, setActionsOpen] = useState<boolean>(false);

  return (
    <Col gap="2rem">
      <Section label="Basic">
        <Row>
          <Button onClick={() => setBasicOpen(true)}>Open Modal</Button>
        </Row>
        <Modal
          isOpen={basicOpen}
          onClose={() => setBasicOpen(false)}
          title="Welcome"
        >
          <p>This is a basic modal.</p>
        </Modal>
      </Section>

      <Section label="Types">
        <Row>
          <Button onClick={() => setInfoOpen(true)}>Info</Button>
          <Button onClick={() => setSuccessOpen(true)}>Success</Button>
          <Button onClick={() => setWarningOpen(true)}>Warning</Button>
          <Button onClick={() => setDangerOpen(true)}>Danger</Button>
        </Row>

        <Modal
          isOpen={infoOpen}
          onClose={() => setInfoOpen(false)}
          title="Information"
          icon={Info}
          type="info"
        >
          <p>This is an informational modal with an info icon and type styling.</p>
        </Modal>

        <Modal
          isOpen={successOpen}
          onClose={() => setSuccessOpen(false)}
          title="Success"
          icon={CircleCheck}
          type="success"
        >
          <p>Your action was completed successfully.</p>
        </Modal>

        <Modal
          isOpen={warningOpen}
          onClose={() => setWarningOpen(false)}
          title="Warning"
          icon={CircleAlert}
          type="warning"
        >
          <p>Please review your changes before proceeding.</p>
        </Modal>

        <Modal
          isOpen={dangerOpen}
          onClose={() => setDangerOpen(false)}
          title="Danger"
          icon={CircleX}
          type="danger"
        >
          <p>This action is irreversible. Proceed with caution.</p>
        </Modal>
      </Section>

      <Section label="With Actions">
        <Row>
          <Button onClick={() => setActionsOpen(true)}>Open Modal with Actions</Button>
        </Row>
        <Modal
          isOpen={actionsOpen}
          onClose={() => setActionsOpen(false)}
          title="Confirm Action"
          icon={CircleAlert}
          type="warning"
          actions={[
            {
              id: 'cancel',
              label: 'Cancel',
              variant: 'outlined',
              onClick: () => setActionsOpen(false),
            },
            {
              id: 'confirm',
              label: 'Confirm',
              variant: 'filled',
              color: 'danger',
              onClick: () => setActionsOpen(false),
            },
          ]}
        >
          <p>Are you sure you want to proceed? This action cannot be undone.</p>
        </Modal>
      </Section>
    </Col>
  );
};
