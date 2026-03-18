'use client';

import React from 'react';
import { SyncState } from '../hooks/useTickets';

interface SyncStatusProps {
  status: SyncState;
  lastSync: Date | null;
}

export default function SyncStatus({ status, lastSync }: SyncStatusProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className={`sync-indicator sync-${status}`}>
      <div className="sync-dot" />
      <div className="sync-info">
        <span className="sync-text">
          {status === 'synced' && 'Synced'}
          {status === 'syncing' && 'Syncing...'}
          {status === 'error' && 'Sync Error'}
        </span>
        {lastSync && status !== 'syncing' && (
          <span className="sync-time">Last: {formatTime(lastSync)}</span>
        )}
      </div>
    </div>
  );
}
