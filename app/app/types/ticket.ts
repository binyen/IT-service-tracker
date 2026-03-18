export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export type TicketCategory = 'Hardware' | 'Software' | 'Network' | 'Access Management' | 'General Inquiry';

export interface Ticket {
  id: string;
  timestamp: string;       // ISO string — set on creation
  requesterEmail: string;
  serviceRequest: string;
  category: TicketCategory;
  latestUpdate: string;    // ISO string — updated on edit
  itStatus: TicketStatus;
  itRemarks: string;
  // aging is derived: Math.floor((now - timestamp) / 86_400_000) days
}
