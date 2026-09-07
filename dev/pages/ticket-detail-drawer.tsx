import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Divider,
  Drawer,
  InlineEdit,
  Pill,
  Select,
  TagInput,
  useSnackbar,
} from '@pmealha/eidos-ui';
import { errorMessage } from '../api/client';
import { ticketsApi } from '../api/tickets';
import {
  PRIORITY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from '../api/types';

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  id: value,
  value,
  label,
}));

const PRIORITY_OPTIONS = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
  id: value,
  value,
  label,
}));

const ASSIGNEE_OPTIONS = [
  'Ana Ferreira',
  'Bruno Costa',
  'Chiara Ricci',
  'Diego Marín',
  'Unassigned',
].map((name) => ({ id: name, value: name, label: name }));

type Draft = {
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  tags: string[];
};

const toDraft = (ticket: Ticket): Draft => ({
  subject: ticket.subject,
  status: ticket.status,
  priority: ticket.priority,
  assignee: ticket.assignee,
  tags: [...ticket.tags],
});

type Props = {
  ticket: Ticket | null;
  /** Tags already used across other tickets - shown as autocomplete suggestions on the tag picker. */
  knownTags: string[];
  onClose: () => void;
  onSaved: () => void;
  onRequestDelete: (ticket: Ticket) => void;
};

export const TicketDetailDrawer: React.FC<Props> = ({
  ticket,
  knownTags,
  onClose,
  onSaved,
  onRequestDelete,
}) => {
  const { showSuccess, showError } = useSnackbar();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset the draft whenever a different ticket is opened.
  useEffect(() => {
    setDraft(ticket ? toDraft(ticket) : null);
  }, [ticket]);

  const dirty =
    ticket !== null && draft !== null && JSON.stringify(draft) !== JSON.stringify(toDraft(ticket));

  const save = async () => {
    if (!ticket || !draft) return;
    setSaving(true);
    try {
      await ticketsApi.update(ticket.id, draft);
      showSuccess(`${ticket.reference} saved.`);
      onSaved();
      onClose();
    } catch (error) {
      showError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      isOpen={ticket !== null}
      onClose={onClose}
      size="lg"
      title={ticket ? `${ticket.reference} · ${ticket.customer}` : ''}
      actions={[
        {
          id: 'delete',
          label: 'Delete',
          variant: 'text',
          color: 'danger',
          disabled: saving,
          onClick: () => ticket && onRequestDelete(ticket),
        },
        {
          id: 'save',
          label: 'Save changes',
          color: 'primary',
          loading: saving,
          disabled: !dirty,
          onClick: () => void save(),
        },
      ]}
    >
      {ticket && draft && (
        <div className="mrd-detail">
          {ticket.locked && (
            <Alert variant="warning" title="Compliance hold">
              This ticket is locked. Saving will be rejected by the API - a deliberate way to see
              the error path.
            </Alert>
          )}

          <label className="mrd-field">
            <span className="mrd-field__label">Subject</span>
            <InlineEdit
              value={draft.subject}
              onConfirm={(value) => setDraft({ ...draft, subject: value })}
              fullWidth
            />
          </label>

          <div className="mrd-field-row">
            <label className="mrd-field">
              <span className="mrd-field__label">Status</span>
              <Select
                options={STATUS_OPTIONS}
                value={draft.status}
                onChange={(value) => setDraft({ ...draft, status: value as TicketStatus })}
                fullWidth
              />
            </label>

            <label className="mrd-field">
              <span className="mrd-field__label">Priority</span>
              <Select
                options={PRIORITY_OPTIONS}
                value={draft.priority}
                onChange={(value) => setDraft({ ...draft, priority: value as TicketPriority })}
                fullWidth
              />
            </label>
          </div>

          <label className="mrd-field">
            <span className="mrd-field__label">Assignee</span>
            <Select
              options={ASSIGNEE_OPTIONS}
              value={draft.assignee}
              onChange={(value) => setDraft({ ...draft, assignee: value as string })}
              fullWidth
            />
          </label>

          <TagInput
            label="Tags"
            value={draft.tags}
            onChange={(tags) => setDraft({ ...draft, tags })}
            placeholder="Add a tag and press Enter"
            suggestions={knownTags}
            fullWidth
          />

          <Divider />

          <div className="mrd-detail__thread">
            <div className="mrd-card__head">
              <h3 className="mrd-card__title">Conversation</h3>
              <Pill color={STATUS_COLORS[ticket.status]} variant="outlined" size="sm">
                {STATUS_LABELS[ticket.status]}
              </Pill>
            </div>

            {ticket.messages.map((message) => (
              <article key={message.id} className="mrd-message">
                <Avatar name={message.author} size="sm" color="gray" />
                <div className="mrd-message__body">
                  <div className="mrd-message__meta">
                    <strong>{message.author}</strong>
                    <span>{new Date(message.sentAt).toLocaleDateString()}</span>
                  </div>
                  <p>{message.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </Drawer>
  );
};
