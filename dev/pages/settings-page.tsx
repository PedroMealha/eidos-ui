import React, { useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  FileUpload,
  Input,
  RadioGroup,
  Switch,
  Tab,
  TabPanel,
  Tabs,
  Textarea,
  useSnackbar,
} from 'eidos-ui';
import { useAuth } from '../auth/auth-context';

const DIGEST_OPTIONS = [
  { value: 'realtime', label: 'Real time' },
  { value: 'hourly', label: 'Hourly digest' },
  { value: 'daily', label: 'Daily digest' },
];

export const SettingsPage: React.FC = () => {
  const { session } = useAuth();
  const { showSuccess, showInfo } = useSnackbar();

  const [name, setName] = useState(session?.name ?? '');
  const [signature, setSignature] = useState('Ana Ferreira\nCustomer Support - Meridian');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [digest, setDigest] = useState('hourly');
  const [notifyAssigned, setNotifyAssigned] = useState(true);
  const [notifyMentions, setNotifyMentions] = useState(true);
  const [notifySla, setNotifySla] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveProfile = () => {
    setSaving(true);
    // Local-only preferences - no endpoint needed, but keep the pending state honest.
    setTimeout(() => {
      setSaving(false);
      showSuccess('Profile updated.');
    }, 450);
  };

  return (
    <div className="mrd-page">
      <div className="mrd-page__head">
        <div>
          <h1 className="mrd-page__title">Settings</h1>
          <p className="mrd-page__subtitle">Your profile and notification preferences.</p>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <Tab value="profile" icon="user">
          Profile
        </Tab>
        <Tab value="notifications" icon="bell">
          Notifications
        </Tab>
        <Tab value="danger" icon="triangle-alert">
          Advanced
        </Tab>

        <TabPanel value="profile">
          <Card variant="outlined" padding="lg">
            <div className="mrd-profile">
              <div className="mrd-profile__avatar">
                <Avatar src={avatar} name={name} size="lg" color="primary" />
                <FileUpload
                  accept="image/*"
                  maxSize={2 * 1024 * 1024}
                  hint="Drop a square image (max 2 MB)"
                  onFilesAccepted={(files) => {
                    const [file] = files;
                    if (!file) return;
                    setAvatar(URL.createObjectURL(file));
                    showSuccess(`${file.name} set as your avatar.`);
                  }}
                  onFilesRejected={(_files, reason) =>
                    showInfo(
                      reason === 'size'
                        ? 'That image is larger than 2 MB.'
                        : 'That file type is not supported.',
                    )
                  }
                />
              </div>

              <div className="mrd-form">
                <Input
                  label="Display name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  fullWidth
                />
                <Input
                  type="email"
                  label="Email"
                  value={session?.email ?? ''}
                  disclaimerIcon="info"
                  disclaimerContent="Your email is tied to the sign-in code and cannot be changed here."
                  disabled
                  clearable={false}
                  fullWidth
                />
                <Textarea
                  label="Email signature"
                  value={signature}
                  onChange={(event) => setSignature(event.target.value)}
                  rows={4}
                  maxLength={200}
                  showCount
                  fullWidth
                />
                <div className="mrd-form__actions">
                  <Button loading={saving} loadingText="Saving" onClick={saveProfile}>
                    Save profile
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabPanel>

        <TabPanel value="notifications">
          <Card variant="outlined" padding="lg">
            <div className="mrd-form">
              <RadioGroup
                name="digest"
                options={DIGEST_OPTIONS}
                value={digest}
                onChange={setDigest}
              />

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
        </TabPanel>

        <TabPanel value="danger">
          <Card variant="outlined" padding="lg">
            <Alert variant="warning" title="Demo environment">
              This example app keeps everything in memory. Reloading the page restores the original
              seed data, and no request ever leaves the browser.
            </Alert>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
};
