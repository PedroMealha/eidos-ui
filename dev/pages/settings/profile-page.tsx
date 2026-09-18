import React, { useState } from 'react';
import { Avatar, Button, Card, FileUpload, Input, Textarea, useSnackbar } from 'eidos-ui';
import { useAuth } from '../../auth/auth-context';

export const ProfilePage: React.FC = () => {
  const { session } = useAuth();
  const { showSuccess, showInfo } = useSnackbar();

  const [name, setName] = useState(session?.name ?? '');
  const [signature, setSignature] = useState('Ana Ferreira\nCustomer Support - Meridian');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
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
  );
};
