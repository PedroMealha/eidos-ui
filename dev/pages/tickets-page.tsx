import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Chip,
  Input,
  Menu,
  Modal,
  Table,
  useSnackbar,
} from '@pmealha/eidos-ui';
import type { BulkAction, FilterValue, MenuItemType, TableColumn, TableFilters } from '@pmealha/eidos-ui';
import { CircleCheck, Clock, Lock } from 'lucide-react';
import { errorMessage } from '../api/client';
import { ticketsApi } from '../api/tickets';
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from '../api/types';
import { useAsync } from '../lib/use-async';
import { TicketDetailDrawer } from './ticket-detail-drawer';

const STATUS_FILTER_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  id: value,
  value,
  label,
}));

const PRIORITY_FILTER_OPTIONS = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
  id: value,
  value,
  label,
}));

/**
 * `Table` only renders its filter control when `onFiltersChange` is supplied,
 * which puts it in server-side mode - so the filter values are forwarded to the
 * API rather than applied locally. This normalises whatever the dropdown emits
 * (a single string or a list) into the array shape the API expects.
 */
const toFilterList = <T extends string>(value: FilterValue): T[] | undefined => {
  if (Array.isArray(value)) return value.length > 0 ? (value as T[]) : undefined;
  if (typeof value === 'string' && value.length > 0) return [value as T];
  return undefined;
};

export const TicketsPage: React.FC = () => {
  const { showSuccess, showError, showWarning } = useSnackbar();

  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [filters, setFilters] = useState<TableFilters>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Ticket | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce so typing does not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setAppliedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const loadTickets = useCallback(
    () =>
      ticketsApi.list({
        search: appliedSearch,
        status: toFilterList<TicketStatus>(filters.status),
        priority: toFilterList<TicketPriority>(filters.priority),
      }),
    [appliedSearch, filters.status, filters.priority],
  );
  const { data, loading, error, reload } = useAsync<Ticket[]>(loadTickets);

  const tickets = data ?? [];
  const activeTicket = tickets.find((ticket) => ticket.id === activeId) ?? null;

  const rowMenu = useCallback(
    (ticket: Ticket): MenuItemType[] => [
      { type: 'item', id: 'open', label: 'Open details', icon: 'panel-right-open', onClick: () => setActiveId(ticket.id) },
      {
        type: 'item',
        id: 'copy',
        label: 'Copy reference',
        icon: 'copy',
        onClick: () => {
          void navigator.clipboard?.writeText(ticket.reference);
          showSuccess(`${ticket.reference} copied to your clipboard.`);
        },
      },
      { type: 'separator', id: 'sep' },
      {
        type: 'item',
        id: 'delete',
        label: 'Delete ticket',
        icon: 'trash-2',
        color: 'danger',
        onClick: () => setPendingDelete(ticket),
      },
    ],
    [showSuccess],
  );

  const columns = useMemo<TableColumn<Ticket>[]>(
    () => [
      {
        key: 'reference',
        label: 'Ref',
        width: '108px',
        sortable: true,
        render: (_value, ticket) => (
          <span className="mrd-ref">
            {ticket.reference}
            {ticket.locked && <Lock size={12} aria-label="Locked by compliance hold" />}
          </span>
        ),
      },
      {
        key: 'subject',
        label: 'Subject',
        sortable: true,
        render: (_value, ticket) => (
          <div className="mrd-subject">
            <span className="mrd-subject__text">{ticket.subject}</span>
            <span className="mrd-subject__meta">{ticket.customer}</span>
          </div>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        width: '160px',
        sortable: true,
        filterable: true,
        filterType: 'select',
        filterOptions: STATUS_FILTER_OPTIONS,
        render: (_value, ticket) => (
          <Badge color={STATUS_COLORS[ticket.status]} variant="outlined" size="sm">
            {STATUS_LABELS[ticket.status]}
          </Badge>
        ),
      },
      {
        key: 'priority',
        label: 'Priority',
        width: '110px',
        sortable: true,
        filterable: true,
        filterType: 'select',
        filterOptions: PRIORITY_FILTER_OPTIONS,
        render: (_value, ticket) => (
          <Chip color={PRIORITY_COLORS[ticket.priority]} variant="text" size="sm">
            {PRIORITY_LABELS[ticket.priority]}
          </Chip>
        ),
      },
      { key: 'assignee', label: 'Assignee', width: '150px', sortable: true },
      {
        key: 'actions',
        label: '',
        type: 'action',
        width: '56px',
        align: 'right',
        render: (_value, ticket) => (
          <Menu trigger={<Button variant="text" color="secondary" size="sm" icon="ellipsis-vertical" />} items={rowMenu(ticket)} minWidth={190} />
        ),
      },
    ],
    [rowMenu],
  );

  const applyBulkStatus = useCallback(
    async (rows: Ticket[], status: Ticket['status'], verb: string) => {
      try {
        const result = await ticketsApi.bulkSetStatus(
          rows.map((row) => row.id),
          status,
        );
        if (result.updated > 0) showSuccess(`${result.updated} ticket(s) marked as ${verb}.`);
        if (result.skipped.length > 0) {
          showWarning(`Skipped ${result.skipped.join(', ')} - locked by a compliance hold.`);
        }
        reload();
      } catch (bulkError) {
        showError(errorMessage(bulkError));
      }
    },
    [reload, showError, showSuccess, showWarning],
  );

  const bulkActions = useMemo<BulkAction<Ticket>[]>(
    () => [
      {
        id: 'resolve',
        label: 'Mark resolved',
        icon: CircleCheck,
        color: 'success',
        onClick: (rows) => void applyBulkStatus(rows, 'resolved', 'resolved'),
      },
      {
        id: 'progress',
        label: 'Mark in progress',
        icon: Clock,
        variant: 'outlined',
        color: 'primary',
        onClick: (rows) => void applyBulkStatus(rows, 'in_progress', 'in progress'),
      },
    ],
    [applyBulkStatus],
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const result = await ticketsApi.remove(pendingDelete.id);
      showSuccess(`${result.reference} was deleted.`);
      setPendingDelete(null);
      setActiveId(null);
      reload();
    } catch (deleteError) {
      showError(errorMessage(deleteError));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mrd-page">
      <div className="mrd-page__head">
        <div>
          <h1 className="mrd-page__title">Tickets</h1>
          <p className="mrd-page__subtitle">
            {loading ? 'Loading the queue…' : `${tickets.length} ticket(s) in the queue.`}
          </p>
        </div>
        <Input
          type="search"
          placeholder="Search reference, subject, customer…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          preIcon="search"
          clearable
          width={320}
        />
      </div>

      {error && (
        <Alert variant="danger" title="Could not load tickets" action={{ label: 'Retry', onClick: reload }}>
          {error}
        </Alert>
      )}

      <Card variant="outlined" padding="none">
        <Table<Ticket>
          data={tickets}
          columns={columns}
          rowKey="id"
          loading={loading}
          emptyMessage={appliedSearch ? `No tickets match "${appliedSearch}".` : 'The queue is empty.'}
          onRowClick={(ticket) => setActiveId(ticket.id)}
          selectable
          bulkActions={bulkActions}
          showFilters
          filters={filters}
          onFiltersChange={setFilters}
          showPagination
          pageSize={8}
          pageSizeOptions={[8, 16, 32]}
          showDensity
          showExport
        />
      </Card>

      <TicketDetailDrawer
        ticket={activeTicket}
        onClose={() => setActiveId(null)}
        onSaved={reload}
        onRequestDelete={setPendingDelete}
      />

      <Modal
        isOpen={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        type="danger"
        title="Delete this ticket?"
        size="sm"
        actions={[
          {
            id: 'cancel',
            label: 'Cancel',
            variant: 'text',
            color: 'secondary',
            disabled: deleting,
            onClick: () => setPendingDelete(null),
          },
          {
            id: 'confirm',
            label: 'Delete',
            color: 'danger',
            loading: deleting,
            onClick: () => void confirmDelete(),
          },
        ]}
      >
        <p>
          {pendingDelete?.reference} - {pendingDelete?.subject}
        </p>
        <p className="mrd-muted">This cannot be undone.</p>
      </Modal>
    </div>
  );
};
