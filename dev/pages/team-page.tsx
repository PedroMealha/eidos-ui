import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  DataGrid,
  type DataGridFilterField,
  EmptyState,
  Input,
  Modal,
  Pill,
  Select,
  useSnackbar,
} from '@pmealha/eidos-ui';
import { ShieldOff, Trash2 } from 'lucide-react';
import { errorMessage } from '../api/client';
import { teamApi } from '../api/team';
import type { Role, TeamMember } from '../api/types';
import { useAuth } from '../auth/auth-context';
import { useAsync } from '../lib/use-async';
import { useRouter } from '../routes/router';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
];

const emptyInvite = { name: '', email: '', role: 'member' as Role };

export const TeamPage: React.FC = () => {
  const { session } = useAuth();
  const { navigate } = useRouter();
  const { showSuccess, showError } = useSnackbar();

  const loadTeam = useCallback(() => teamApi.list(), []);
  const { data, loading, error, reload } = useAsync<TeamMember[]>(loadTeam);

  const [rows, setRows] = useState<TeamMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState(emptyInvite);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    setRows(data ?? []);
  }, [data]);

  const dirty = useMemo(() => JSON.stringify(rows) !== JSON.stringify(data ?? []), [rows, data]);

  const removeMember = useCallback(
    async (member: TeamMember) => {
      try {
        const result = await teamApi.remove(member.id);
        showSuccess(`${result.name} was removed from the team.`);
        reload();
      } catch (removeError) {
        showError(errorMessage(removeError));
        reload();
      }
    },
    [showSuccess, showError, reload],
  );

  const columns = useMemo(
    () => [
      { key: 'name', header: 'Name', type: 'text' as const, required: true, sortable: true },
      { key: 'email', header: 'Email', type: 'readonly' as const, sortable: true },
      {
        key: 'role',
        header: 'Role',
        type: 'select' as const,
        width: 140,
        options: ROLE_OPTIONS,
      },
      { key: 'active', header: 'Active', type: 'checkbox' as const, width: 100 },
      {
        key: 'joinedAt',
        header: 'Joined',
        type: 'readonly' as const,
        width: 130,
        renderCell: (value: unknown) => new Date(String(value)).toLocaleDateString(),
      },
      {
        key: 'actions',
        header: 'Actions',
        type: 'actions' as const,
        actions: [
          {
            label: 'Remove',
            icon: Trash2,
            danger: true,
            onClick: (member: TeamMember) => void removeMember(member),
          },
        ],
      },
    ],
    [removeMember],
  );

  const filterConfig: DataGridFilterField[] = useMemo(
    () => [
      {
        key: 'role',
        label: 'Role',
        filterType: 'select',
        filterOptions: ROLE_OPTIONS.map((option) => ({ id: option.value, ...option })),
      },
      { key: 'joinedAt', label: 'Joined', filterType: 'date', dateFilterMode: 'range' },
    ],
    [],
  );

  const saveChanges = async () => {
    setSaving(true);
    try {
      await teamApi.saveAll(rows);
      showSuccess('Team changes saved.');
      reload();
    } catch (saveError) {
      showError(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const sendInvite = async () => {
    setInviting(true);
    try {
      const member = await teamApi.invite(invite);
      showSuccess(`Invitation sent to ${member.email}.`);
      setInvite(emptyInvite);
      setInviteOpen(false);
      reload();
    } catch (inviteError) {
      showError(errorMessage(inviteError));
    } finally {
      setInviting(false);
    }
  };

  // The sidebar hides this page for members, but a pasted URL must still be guarded.
  if (session?.role !== 'admin') {
    return (
      <div className="mrd-page">
        <EmptyState
          icon={<ShieldOff />}
          title="Admins only"
          description="Your account has the member role, which cannot manage the team. Switch to the admin role by signing in again."
          action={
            <Button variant="outlined" onClick={() => navigate('/app/dashboard')}>
              Back to dashboard
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mrd-page">
      <div className="mrd-page__head">
        <div>
          <h1 className="mrd-page__title">Team</h1>
          <p className="mrd-page__subtitle">
            Edit cells directly, then save. At least one active admin must remain.
          </p>
        </div>
        <div className="mrd-page__actions">
          {dirty && (
            <Pill color="warning" variant="outlined" size="sm">
              Unsaved changes
            </Pill>
          )}
          <Button
            variant="outlined"
            disabled={!dirty || saving}
            onClick={() => setRows(data ?? [])}
          >
            Discard
          </Button>
          <Button
            loading={saving}
            loadingText="Saving"
            disabled={!dirty}
            onClick={() => void saveChanges()}
          >
            Save changes
          </Button>
          <Button preIcon="user-plus" onClick={() => setInviteOpen(true)}>
            Invite
          </Button>
        </div>
      </div>

      {error && (
        <Alert
          variant="danger"
          title="Could not load the team"
          action={{ label: 'Retry', onClick: reload }}
        >
          {error}
        </Alert>
      )}

      <Card variant="outlined" padding="none">
        <DataGrid<TeamMember>
          columns={columns}
          data={rows}
          rowKey="id"
          loading={loading}
          onChange={setRows}
          emptyText="Nobody on the team yet."
          showFilters
          filterConfig={filterConfig}
          stickyHeader
        />
      </Card>

      <Modal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite a teammate"
        size="sm"
        actions={[
          {
            id: 'cancel',
            label: 'Cancel',
            variant: 'text',
            color: 'secondary',
            disabled: inviting,
            onClick: () => setInviteOpen(false),
          },
          {
            id: 'send',
            label: 'Send invitation',
            loading: inviting,
            onClick: () => void sendInvite(),
          },
        ]}
      >
        <div className="mrd-form">
          <Input
            label="Full name"
            value={invite.name}
            onChange={(event) => setInvite({ ...invite, name: event.target.value })}
            fullWidth
            required
          />
          <Input
            type="email"
            label="Email"
            value={invite.email}
            onChange={(event) => setInvite({ ...invite, email: event.target.value })}
            placeholder="name@company.com"
            fullWidth
            required
          />
          <label className="mrd-field">
            <span className="mrd-field__label">Role</span>
            <Select
              options={ROLE_OPTIONS.map((option) => ({ id: option.value, ...option }))}
              value={invite.role}
              onChange={(value) => setInvite({ ...invite, role: value as Role })}
              fullWidth
            />
          </label>
        </div>
      </Modal>
    </div>
  );
};
