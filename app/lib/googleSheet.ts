import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { Ticket, TicketCategory, TicketStatus } from '../app/types/ticket';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const jwt = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  scopes: SCOPES,
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID || '', jwt);

export async function getDoc() {
  try {
    await doc.loadInfo();
    return doc;
  } catch (err: any) {
    console.error('--- GOOGLE SHEETS ERROR ---');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Message:', err.message);
    }
    throw err;
  }
}

export async function getTicketsSheet() {
  const d = await getDoc();
  return d.sheetsByIndex[0];
}

/**
 * Resiliently find a value in a row by checking multiple likely column names
 */
function getVal(row: any, keys: string[]): string {
  for (const key of keys) {
    const val = row.get(key);
    if (val !== undefined && val !== null) return String(val);
  }
  // Try case-insensitive fallback if headers available
  try {
    const headers = row._sheet.headerValues as string[];
    const lowerKeys = keys.map(k => k.toLowerCase());
    for (const header of headers) {
      if (lowerKeys.includes(header.toLowerCase())) {
        return String(row.get(header));
      }
    }
  } catch (e) {}
  return '';
}

export function rowToTicket(row: any): Ticket {
  return {
    id: getVal(row, ['ID', 'id', 'Id', 'Ticket ID']),
    timestamp: getVal(row, ['Timestamp', 'timestamp', 'Date']),
    requesterEmail: getVal(row, ['Requester Email', 'Email', 'Requester', 'requesterEmail']),
    serviceRequest: getVal(row, ['Service Request', 'Request', 'Issue', 'serviceRequest']),
    category: getVal(row, ['Category', 'category']) as TicketCategory || 'General Inquiry',
    latestUpdate: getVal(row, ['Latest Update', 'Updated', 'latestUpdate']),
    itStatus: (getVal(row, ['IT Status', 'Status', 'itStatus']) as TicketStatus) || 'Open',
    itRemarks: getVal(row, ['IT Remarks', 'Remarks', 'Notes', 'itRemarks']),
  };
}

export async function getAllTickets(): Promise<Ticket[]> {
  const sheet = await getTicketsSheet();
  const rows = await sheet.getRows();
  return rows.map(rowToTicket);
}

export async function addTicketRow(ticket: Ticket) {
  const sheet = await getTicketsSheet();
  // Ensure we use the exact headers the sheet expects while maintaining our data
  // We'll try to match sheet headers to our data keys
  await sheet.loadHeaderRow();
  const headers = sheet.headerValues;
  
  const rowData: Record<string, any> = {};
  
  const mapping: Record<string, keyof Ticket> = {
    'ID': 'id',
    'Timestamp': 'timestamp',
    'Requester Email': 'requesterEmail',
    'Service Request': 'serviceRequest',
    'Category': 'category',
    'Latest Update': 'latestUpdate',
    'IT Status': 'itStatus',
    'IT Remarks': 'itRemarks'
  };

  headers.forEach(header => {
    // Exact match
    if (mapping[header]) {
      rowData[header] = ticket[mapping[header]];
    } else {
      // Fuzzy match for headers not in mapping
      const lowerHeader = header.toLowerCase().replace(/[^a-z]/g, '');
      for (const [mHeader, mKey] of Object.entries(mapping)) {
        const lowerMHeader = mHeader.toLowerCase().replace(/[^a-z]/g, '');
        if (lowerHeader.includes(lowerMHeader) || lowerMHeader.includes(lowerHeader)) {
          rowData[header] = ticket[mKey];
          break;
        }
      }
    }
  });

  await sheet.addRow(rowData);
}

export async function updateTicketRow(id: string, updates: Partial<Ticket>) {
  const sheet = await getTicketsSheet();
  const rows = await sheet.getRows();
  
  // Find row by ID using resilient lookup
  const row = rows.find(r => getVal(r, ['ID', 'id', 'Id', 'Ticket ID']) === id);
  
  if (row) {
    await sheet.loadHeaderRow();
    const headers = sheet.headerValues;
    
    const mapping: Record<string, keyof Ticket> = {
      'IT Status': 'itStatus',
      'IT Remarks': 'itRemarks',
      'Service Request': 'serviceRequest',
      'Requester Email': 'requesterEmail',
      'Category': 'category',
      'Latest Update': 'latestUpdate'
    };

    headers.forEach(header => {
      // Find which update field matches this header
      for (const [mHeader, mKey] of Object.entries(mapping)) {
        if (updates[mKey] !== undefined) {
          const lowerHeader = header.toLowerCase().replace(/[^a-z]/g, '');
          const lowerMHeader = mHeader.toLowerCase().replace(/[^a-z]/g, '');
          if (lowerHeader === lowerMHeader || header === mHeader) {
            row.set(header, updates[mKey]);
          }
        }
      }
    });

    row.set('Latest Update', new Date().toISOString());
    await row.save();
  }
}

export async function deleteTicketRow(id: string) {
  const sheet = await getTicketsSheet();
  const rows = await sheet.getRows();
  const row = rows.find(r => getVal(r, ['ID', 'id', 'Id', 'Ticket ID']) === id);
  if (row) {
    await row.delete();
  }
}
