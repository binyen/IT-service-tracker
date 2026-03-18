'use client';

import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Ticket, TicketCategory, TicketStatus } from '../types/ticket';

interface DashboardProps {
  tickets: Ticket[];
}

const COLORS = ['#6391ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

export default function Dashboard({ tickets }: DashboardProps) {
  // 1. Total Metrics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.itStatus === 'Open').length;
  const inProgressTickets = tickets.filter(t => t.itStatus === 'In Progress').length;
  const resolvedTickets = tickets.filter(t => t.itStatus === 'Resolved' || t.itStatus === 'Closed').length;

  // 2. Average Resolution Days
  const avgResolutionDays = useMemo(() => {
    const resolved = tickets.filter(t => (t.itStatus === 'Resolved' || t.itStatus === 'Closed') && t.latestUpdate !== t.timestamp);
    if (resolved.length === 0) return 0;
    const totalDays = resolved.reduce((acc, t) => {
      const start = new Date(t.timestamp).getTime();
      const end = new Date(t.latestUpdate).getTime();
      return acc + (end - start);
    }, 0);
    return Math.round(totalDays / resolved.length / (1000 * 60 * 60 * 24) * 10) / 10;
  }, [tickets]);

  // 3. Category Data (Bar & Pie)
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  // 4. Category Over Time (Stacked Bar)
  // Grouping by Date
  const timeData = useMemo(() => {
    const days: Record<string, any> = {};
    tickets.forEach(t => {
      const dateToken = new Date(t.timestamp).toISOString().split('T')[0];
      const displayDate = new Date(t.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      if (!days[dateToken]) days[dateToken] = { date: displayDate, sortTs: new Date(dateToken).getTime() };
      days[dateToken][t.category] = (days[dateToken][t.category] || 0) + 1;
    });
    return Object.values(days).sort((a: any, b: any) => a.sortTs - b.sortTs);
  }, [tickets]);

  // 5. Open cases by days active (Aging Distribution)
  const agingData = useMemo(() => {
    const bins = [
      { name: '0-2d', value: 0 },
      { name: '3-7d', value: 0 },
      { name: '8-14d', value: 0 },
      { name: '15d+', value: 0 },
    ];
    tickets.filter(t => t.itStatus === 'Open' || t.itStatus === 'In Progress').forEach(t => {
      const days = Math.floor((Date.now() - new Date(t.timestamp).getTime()) / 86_400_000);
      if (days <= 2) bins[0].value++;
      else if (days <= 7) bins[1].value++;
      else if (days <= 14) bins[2].value++;
      else bins[3].value++;
    });
    return bins;
  }, [tickets]);

  const CATEGORIES: TicketCategory[] = ['Hardware', 'Software', 'Network', 'Access Management', 'General Inquiry'];

  return (
    <div className="dashboard-grid">
      {/* Metrics Row */}
      <div className="metrics-row">
        <div className="dashboard-card metric-card">
          <span className="metric-val">{totalTickets}</span>
          <span className="metric-label">Total Requested</span>
        </div>
        <div className="dashboard-card metric-card highlight-metric">
          <span className="metric-val">{avgResolutionDays}d</span>
          <span className="metric-label">Avg. Resolution</span>
        </div>
        <div className="dashboard-card metric-card">
          <span className="metric-val text-open">{openTickets}</span>
          <span className="metric-label">Open Tickets</span>
        </div>
        <div className="dashboard-card metric-card">
          <span className="metric-val text-resolved">{resolvedTickets}</span>
          <span className="metric-label">Closed/Resolved</span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="charts-grid">
        {/* Tickets by Category - Bar Chart */}
        <div className="dashboard-card chart-container">
          <h3>Tickets by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="name" stroke="#8b95b0" fontSize={10} />
              <YAxis stroke="#8b95b0" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1b2236', border: '1px solid #2d3748', borderRadius: '8px' }}
                itemStyle={{ color: '#e8edf8' }}
              />
              <Bar dataKey="value" fill="#6391ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution - Pie Chart */}
        <div className="dashboard-card chart-container">
          <h3>Distribution by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1b2236', border: '1px solid #2d3748', borderRadius: '8px' }}
                itemStyle={{ color: '#e8edf8' }}
              />
              <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Over Time - Stacked Bar Chart */}
        <div className="dashboard-card chart-container col-span-2">
          <h3>Tickets by Category Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="date" stroke="#8b95b0" fontSize={12} />
              <YAxis stroke="#8b95b0" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1b2236', border: '1px solid #2d3748', borderRadius: '8px' }}
                itemStyle={{ color: '#e8edf8' }}
              />
              <Legend />
              {CATEGORIES.map((cat, idx) => (
                <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[idx % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Aging - Open cases by days active */}
        <div className="dashboard-card chart-container col-span-2">
          <h3>Open Cases by Active Days</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={agingData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis type="number" stroke="#8b95b0" fontSize={10} />
              <YAxis dataKey="name" type="category" stroke="#8b95b0" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1b2236', border: '1px solid #2d3748', borderRadius: '8px' }}
                itemStyle={{ color: '#e8edf8' }}
              />
              <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
