'use client';

import React, { useState } from 'react';
import { Ticket, TicketStatus, TicketCategory } from '../types/ticket';
import StatusBadge from './StatusBadge';

interface EditTicketModalProps {
  ticket: Ticket;
  onClose: () => void;
  onSave: (
    id: string,
    data: Partial<Pick<Ticket, 'itStatus' | 'itRemarks' | 'serviceRequest' | 'requesterEmail' | 'category'>>
  ) => void;
  onDelete: (id: string) => void;
}

const STATUS_OPTIONS: TicketStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];
const CATEGORIES: TicketCategory[] = ['Hardware', 'Software', 'Network', 'Access Management', 'General Inquiry'];

export default function EditTicketModal({ ticket, onClose, onSave, onDelete }: EditTicketModalProps) {
  const [email, setEmail] = useState(ticket.requesterEmail);
  const [request, setRequest] = useState(ticket.serviceRequest);
  const [category, setCategory] = useState<TicketCategory>(ticket.category);
  const [status, setStatus] = useState<TicketStatus>(ticket.itStatus);
  const [remarks, setRemarks] = useState(ticket.itRemarks);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(ticket.id, {
      requesterEmail: email.trim(),
      serviceRequest: request.trim(),
      category: category,
      itStatus: status,
      itRemarks: remarks.trim(),
    });
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete(ticket.id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Edit Ticket</h2>
            <span className="ticket-id-label">{ticket.id}</span>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <form onSubmit={handleSave} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-email">Requester Email</label>
              <input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-status">IT Status</label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TicketStatus)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="badge-preview">
                <StatusBadge status={status} />
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-category">Category</label>
              <select
                id="edit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="edit-request">Service Request</label>
            <textarea
              id="edit-request"
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-remarks">IT Remarks</label>
            <textarea
              id="edit-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add internal IT notes here…"
              rows={3}
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className={confirmDelete ? 'btn-danger-confirm' : 'btn-danger'}
              onClick={handleDelete}
            >
              {confirmDelete ? '⚠ Confirm Delete' : 'Delete'}
            </button>
            <div className="modal-footer-right">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary">Save Changes</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
