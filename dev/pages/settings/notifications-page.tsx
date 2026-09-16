import React, { useState } from 'react';
import { Button, Card, RadioGroup, Switch, useSnackbar } from 'eidos-ui';
import { SettingsLayout } from './settings-layout';

const DIGEST_OPTIONS = [
  { value: 'realtime', label: 'Real time' },
  { value: 'hourly', label: 'Hourly digest' },
  { value: 'daily', label: 'Daily digest' },
];

export const NotificationsPage: React.FC = () => {
  const { showSuccess } = useSnackbar();

  const [digest, setDigest] = useState('hourly');
  const [notifyAssigned, setNotifyAssigned] = useState(true);
  const [notifyMentions, setNotifyMentions] = useState(true);
  const [notifySla, setNotifySla] = useState(false);

  return (
    <SettingsLayout>
      <Card variant="outlined" padding="lg">
        <div className="mrd-form">
          <RadioGroup name="digest" options={DIGEST_OPTIONS} value={digest} onChange={setDigest} />

          <div className="mrd-switches">
            <Switch
              label="A ticket is assigned to me"
              checked={notifyAssigned}
              onChange={(event) => setNotifyAssigned(event.target.checked)}
            />
            <Switch
              label="I am mentioned in a reply"
              checked={notifyMentions}
              onChange={(event) => setNotifyMentions(event.target.checked)}
            />
            <Switch
              label="A ticket is about to breach its SLA"
              checked={notifySla}
              onChange={(event) => setNotifySla(event.target.checked)}
            />
          </div>

          <div className="mrd-form__actions">
            <Button
              variant="outlined"
              onClick={() => showSuccess('Notification preferences saved.')}
            >
              Save preferences
            </Button>
          </div>
        </div>
      </Card>
    </SettingsLayout>
  );
};
