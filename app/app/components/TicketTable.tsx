'use client';

import React, { useState, useMemo } from 'react';
import { Ticket, TicketStatus } from '../types/ticket';
import StatusBadge from './StatusBadge';
import EditTicketModal from './EditTicketModal';

interface TicketTableProps {
  tickets: Ticket[];
  searchQuery: string;
  onUpdate?: (
    id: string,
    data: Partial<Pick<Ticket, 'itStatus' | 'itRemarks' | 'serviceRequest' | 'requesterEmail' | 'category'>>
  ) => void;
  onDelete?: (id: string) => void;
}

type SortKey = keyof Ticket | 'aging';
type SortDir = 'asc' | 'desc';

function calcAging(timestamp: string): number {
  return Math.floor((Date.now() - new Date(timestamp).getTime()) / 86_400_000);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TicketTable({ tickets, searchQuery, onUpdate, onDelete }: TicketTableProps) {
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'All'>('All');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return tickets.filter((t) => {
      const matchesSearch =
        !q ||
        t.requesterEmail.toLowerCase().includes(q) ||
        t.serviceRequest.toLowerCase().includes(q) ||
        t.itRemarks.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.itStatus.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || t.itStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchQuery, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      if (sortKey === 'aging') {
        aVal = calcAging(a.timestamp);
        bVal = calcAging(b.timestamp);
      } else {
        aVal = (a[sortKey] as string) ?? '';
        bVal = (b[sortKey] as string) ?? '';
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      <span className="sort-icon">{sortDir === 'asc' ? '↑' : '↓'}</span>
    ) : (
      <span className="sort-icon sort-icon-inactive">↕</span>
    );

  const canEdit = !!onUpdate;

  return (
    <>
      <div className="table-toolbar">
        <div className="status-filters">
          {(['All', 'Open', 'In Progress', 'Resolved', 'Closed'] as const).map((s) => (
            <button
              key={s}
              className={`filter-pill ${statusFilter === s ? 'filter-pill-active' : ''} ${s !== 'All' ? `filter-pill-${s.toLowerCase().replace(' ', '-')}` : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="table-count">{sorted.length} ticket{sorted.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="table-wrapper">
        <table className="ticket-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('timestamp')} className="sortable">
                Timestamp <SortIcon col="timestamp" />
              </th>
              <th onClick={() => handleSort('requesterEmail')} className="sortable">
                Email <SortIcon col="requesterEmail" />
              </th>
              <th onClick={() => handleSort('category')} className="sortable">
                Category <SortIcon col="category" />
              </th>
              <th>Service Request</th>
              <th onClick={() => handleSort('aging')} className="sortable th-narrow">
                Aging <SortIcon col="aging" />
              </th>
              <th onClick={() => handleSort('latestUpdate')} className="sortable">
                Updated <SortIcon col="latestUpdate" />
              </th>
              <th onClick={() => handleSort('itStatus')} className="sortable th-narrow">
                Status <SortIcon col="itStatus" />
              </th>
              <th>Remarks</th>
              {canEdit && <th className="th-action">Action</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 9 : 8} className="empty-state">
                  <div className="empty-icon">📋</div>
                  <p>No tickets found.</p>
                </td>
              </tr>
            ) : (
              sorted.map((ticket) => {
                const aging = calcAging(ticket.timestamp);
                return (
                  <tr key={ticket.id} className={aging >= 7 ? 'row-aged' : ''}>
                    <td className="td-nowrap">
                      <div className="ticket-id">{ticket.id}</div>
                      <div className="td-secondary">{formatDate(ticket.timestamp)}</div>
                    </td>
                    <td>
                      <a href={`mailto:${ticket.requesterEmail}`} className="email-link">
                        {ticket.requesterEmail}
                      </a>
                    </td>
                    <td>
                      <span className="category-tag">{ticket.category}</span>
                    </td>
                    <td>
                      <div className="td-truncate" title={ticket.serviceRequest}>
                        {ticket.serviceRequest}
                      </div>
                    </td>
                    <td className="td-center">
                      <span className={`aging-badge ${aging >= 14 ? 'aging-critical' : aging >= 7 ? 'aging-warning' : 'aging-ok'}`}>
                        {aging}d
                      </span>
                    </td>
                    <td className="td-nowrap td-secondary">{formatDate(ticket.latestUpdate)}</td>
                    <td className="td-center">
                      <StatusBadge status={ticket.itStatus} />
                    </td>
                    <td>
                      <div className="td-truncate td-remarks" title={ticket.itRemarks}>
                        {ticket.itRemarks || <span className="td-muted">—</span>}
                      </div>
                    </td>
                    {canEdit && (
                      <td className="td-center">
                        <button
                          className="btn-edit"
                          onClick={() => setEditTicket(ticket)}
                          aria-label={`Edit ticket ${ticket.id}`}
                        >
                          ✏ Edit
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editTicket && onUpdate && onDelete && (
        <EditTicketModal
          ticket={editTicket}
          onClose={() => setEditTicket(null)}
          onSave={onUpdate}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
