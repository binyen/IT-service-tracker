'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import { useTickets } from './hooks/useTickets';
import TicketTable from './components/TicketTable';
import AddTicketModal from './components/AddTicketModal';
import Dashboard from './components/Dashboard';
import SyncStatus from './components/SyncStatus';
import ThemeToggle from './components/ThemeToggle';
import { LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const { tickets, loading: ticketsLoading, syncStatus, lastSync, addTicket, updateTicket, deleteTicket } = useTickets();
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'Table' | 'Dashboard'>('Table');
  const router = useRouter();

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Filter tickets for regular users
  const filteredTickets = useMemo(() => {
    if (!user) return [];
    if (user.role === 'Admin') return tickets;
    return tickets.filter(t => t.requesterEmail.toLowerCase() === user.email.toLowerCase());
  }, [tickets, user]);

  if (authLoading || !user) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
      </div>
    );
  }

  const isAdmin = user.role === 'Admin';

  return (
    <main className="app-root">
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-brand">
            <div className="header-icon">🛠</div>
            <div>
              <h1>IT Service Tracker</h1>
              <p className="header-sub">Internal helpdesk &amp; request analytics</p>
            </div>
          </div>
          
          <div className="header-controls">
            {isAdmin && (
              <div className="view-switcher">
                <button 
                  className={`switcher-btn ${view === 'Table' ? 'active' : ''}`} 
                  onClick={() => setView('Table')}
                >
                  📋 Tickets
                </button>
                <button 
                  className={`switcher-btn ${view === 'Dashboard' ? 'active' : ''}`} 
                  onClick={() => setView('Dashboard')}
                >
                  📊 Dashboard
                </button>
              </div>
            )}
            
            <div className="user-profile">
              <div className="user-info">
                <span className="user-role-badge">
                  {isAdmin ? <ShieldCheck size={12} /> : <UserIcon size={12} />}
                  {user.role}
                </span>
                <span className="user-email">{user.email}</span>
              </div>
              <button onClick={logout} className="btn-icon-only logout-btn" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
            
            <ThemeToggle />
          </div>
        </header>

        {ticketsLoading && view === 'Table' && (
          <div className="loading-overlay">
            <div className="loader"></div>
            <p>Syncing with Google Sheets...</p>
          </div>
        )}

        {view === 'Table' ? (
          <>
            {/* Action bar */}
            <div className="action-bar">
              <div className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder={isAdmin ? "Search all tickets..." : "Search my tickets..."}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  id="search-tickets"
                />
              </div>
              <button className="btn-primary btn-add" onClick={() => setShowAdd(true)} id="btn-add-ticket">
                + New Request
              </button>
            </div>

            {/* Table */}
            <section className="table-section">
              <TicketTable
                tickets={filteredTickets}
                searchQuery={query}
                onUpdate={isAdmin ? updateTicket : undefined} // Only Admin can update/edit
                onDelete={isAdmin ? deleteTicket : undefined} // Only Admin can delete
              />
            </section>
          </>
        ) : (
          isAdmin && (
            <section className="dashboard-section">
              <Dashboard tickets={tickets} />
            </section>
          )
        )}

        <footer className="app-footer">
          <p>IT Service Tracker · {new Date().getFullYear()} · Powered by Google Sheets</p>
        </footer>
      </div>

      {showAdd && (
        <AddTicketModal
          onClose={() => setShowAdd(false)}
          onAdd={addTicket}
          defaultEmail={user.email}
        />
      )}

      {/* Persistent Sync Status */}
      <SyncStatus status={syncStatus} lastSync={lastSync} />
    </main>
  );
}
