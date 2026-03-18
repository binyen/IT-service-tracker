'use client';

import { useState, useEffect, useCallback } from 'react';
import { Ticket, TicketStatus, TicketCategory } from '../types/ticket';

function generateId(): string {
  return `TKT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export type SyncState = 'synced' | 'syncing' | 'error';

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncState>('syncing');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      setSyncStatus('syncing');
      const res = await fetch('/api/tickets');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTickets(data);
        setSyncStatus('synced');
        setLastSync(new Date());
      } else {
        setSyncStatus('error');
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const addTicket = useCallback(
    async (data: { requesterEmail: string; serviceRequest: string; category: TicketCategory }) => {
      const now = new Date().toISOString();
      const newTicket: Ticket = {
        id: generateId(),
        timestamp: now,
        requesterEmail: data.requesterEmail,
        serviceRequest: data.serviceRequest,
        category: data.category,
        latestUpdate: now,
        itStatus: 'Open',
        itRemarks: '',
      };
      
      setSyncStatus('syncing');
      // Optimistic update
      setTickets(prev => [newTicket, ...prev]);

      try {
        const res = await fetch('/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTicket),
        });
        if (res.ok) {
          setSyncStatus('synced');
          setLastSync(new Date());
        } else {
          setSyncStatus('error');
        }
      } catch (err) {
        console.error('Failed to add ticket:', err);
        setSyncStatus('error');
        fetchTickets(); // rollback
      }
    },
    [fetchTickets]
  );

  const updateTicket = useCallback(
    async (
      id: string,
      data: Partial<Pick<Ticket, 'itStatus' | 'itRemarks' | 'serviceRequest' | 'requesterEmail' | 'category'>>
    ) => {
      setSyncStatus('syncing');
      // Optimistic update
      setTickets(prev => prev.map(t => 
        t.id === id ? { ...t, ...data, latestUpdate: new Date().toISOString() } : t
      ));

      try {
        const res = await fetch(`/api/tickets/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          setSyncStatus('synced');
          setLastSync(new Date());
        } else {
          setSyncStatus('error');
        }
      } catch (err) {
        console.error('Failed to update ticket:', err);
        setSyncStatus('error');
        fetchTickets(); // rollback
      }
    },
    [fetchTickets]
  );

  const deleteTicket = useCallback(async (id: string) => {
    setSyncStatus('syncing');
    // Optimistic update
    setTickets(prev => prev.filter(t => t.id !== id));

    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSyncStatus('synced');
        setLastSync(new Date());
      } else {
        setSyncStatus('error');
      }
    } catch (err) {
      console.error('Failed to delete ticket:', err);
      setSyncStatus('error');
      fetchTickets(); // rollback
    }
  }, [fetchTickets]);

  return { tickets, loading, syncStatus, lastSync, addTicket, updateTicket, deleteTicket, refresh: fetchTickets };
}
