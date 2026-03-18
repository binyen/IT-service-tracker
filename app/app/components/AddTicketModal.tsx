'use client';

import React, { useState, useEffect } from 'react';
import { TicketCategory, TicketStatus } from '../types/ticket';

interface AddTicketModalProps {
  onClose: () => void;
  onAdd: (data: { requesterEmail: string; serviceRequest: string; category: TicketCategory }) => void;
  defaultEmail?: string;
}

const CATEGORIES: TicketCategory[] = ['Hardware', 'Software', 'Network', 'Access Management', 'General Inquiry'];

export default function AddTicketModal({ onClose, onAdd, defaultEmail }: AddTicketModalProps) {
  const [email, setEmail] = useState(defaultEmail || '');
  const [request, setRequest] = useState('');
  const [category, setCategory] = useState<TicketCategory>('General Inquiry');
  const [emailError, setEmailError] = useState('');
  const [requestError, setRequestError] = useState('');

  // Sync email with defaultEmail prop
  useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [defaultEmail]);

  const validate = () => {
    let valid = true;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
    }
    if (!request.trim()) {
      setRequestError('Service request cannot be empty.');
      valid = false;
    } else {
      setRequestError('');
    }
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onAdd({
      requesterEmail: email.trim(),
      serviceRequest: request.trim(),
      category: category
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Service Request</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="add-email">Requester Email</label>
            <input
              id="add-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@company.com"
              disabled={!!defaultEmail}
              className={emailError ? 'input-error' : ''}
            />
            {emailError && <span className="error-text">{emailError}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="add-category">Category</label>
            <select
              id="add-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="add-request">Service Request</label>
            <textarea
              id="add-request"
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="Describe the issue or request in detail…"
              rows={4}
              className={requestError ? 'input-error' : ''}
            />
            {requestError && <span className="error-text">{requestError}</span>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Submit Request</button>
          </div>
        </form>
      </div>
    </div>
  );
}
