import React from 'react';
import { TicketStatus } from '../types/ticket';

interface StatusBadgeProps {
  status: TicketStatus;
}

const STATUS_CONFIG: Record<TicketStatus, { label: string; className: string }> = {
  Open: { label: 'Open', className: 'badge-open' },
  'In Progress': { label: 'In Progress', className: 'badge-inprogress' },
  Resolved: { label: 'Resolved', className: 'badge-resolved' },
  Closed: { label: 'Closed', className: 'badge-closed' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return <span className={`badge ${cfg.className}`}>{cfg.label}</span>;
}
