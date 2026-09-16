import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Card,
  DataGrid,
  type DataGridColumn,
  type DataGridFilterField,
  Input,
  Modal,
  Pill,
  Select,
  useSnackbar,
} from 'eidos-ui';
import { Trash2, UserSearch } from 'lucide-react';
import { errorMessage } from '../api/client';
import { teamApi } from '../api/team';
import type { Role, TeamMember } from '../api/types';
import { usePageChrome } from '../layouts/page-chrome';
import { useAsync } from '../lib/use-async';
import { useRouter } from '../routes/router';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
];

const emptyInvite = { name: '', email: '', role: 'member' as Role };

export const TeamPage: React.FC = () => {
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

  // Annotated rather than inferred: the annotation is what contextually types
  // each entry against `DataGridColumn<TeamMember>`, so `key` is checked
  // against TeamMember's fields and `renderCell`'s `value` arrives typed. An
  // un-annotated array widens every `key` to `string` and loses both.
  const columns: DataGridColumn<TeamMember>[] = useMemo(
    () => [
      { key: 'name', header: 'Name', type: 'text', required: true, sortable: true },
      { key: 'email', header: 'Email', type: 'readonly', sortable: true },
      {
        key: 'role',
        header: 'Role',
        type: 'select',
        width: 140,
        options: ROLE_OPTIONS,
      },
      { key: 'active', header: 'Active', type: 'checkbox', width: 100 },
      {
        key: 'joinedAt',
        header: 'Joined',
        type: 'readonly',
        width: 130,
        // `value` is `string` here, straight from TeamMember['joinedAt'].
        renderCell: (value) => new Date(value).toLocaleDateString(),
      },
      {
        header: 'Actions',
        type: 'actions',
        actions: [
          {
            // An explicit action rather than a row click: the grid's cells
            // are inline-editable, so clicking a row already means "edit".
            label: 'View details',
            icon: UserSearch,
            onClick: (member: TeamMember) => navigate(`/app/team/${member.id}`),
          },
          {
            label: 'Remove',
            icon: Trash2,
            danger: true,
            onClick: (member: TeamMember) => void removeMember(member),
          },
        ],
      },
    ],
    [removeMember, navigate],
  );

  const filterConfig: DataGridFilterField<TeamMember>[] = useMemo(
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

  // Memoized because it is referenced by the page chrome below, which must
  // be a stable object - see the contract on `usePageChrome`.
  const saveChanges = useCallback(async () => {
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
  }, [rows, reload, showSuccess, showError]);

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

  // The unsaved-changes indicator now sits inline in the shell's header
  // title, which is what `title` accepting a ReactNode is for - it is page
  // status, not an action, so it does not belong in `actions`.
  usePageChrome(
    useMemo(
      () => ({
        title: (
          <>
            Team
            {dirty && (
              <Pill color="warning" variant="outlined" size="sm">
                Unsaved changes
              </Pill>
            )}
          </>
        ),
        actions: [
          {
            children: 'Discard',
            variant: 'outlined',
            disabled: !dirty || saving,
            onClick: () => setRows(data ?? []),
          },
          {
            children: 'Save changes',
            loading: saving,
            disabled: !dirty,
            onClick: () => void saveChanges(),
          },
          {
            children: 'Invite',
            preIcon: 'user-plus',
            onClick: () => setInviteOpen(true),
          },
        ],
      }),
      [dirty, saving, data, saveChanges],
    ),
  );

  return (
    <div className="mrd-page">
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
