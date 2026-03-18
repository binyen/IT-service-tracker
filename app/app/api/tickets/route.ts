import { NextResponse } from 'next/server';
import { getAllTickets, addTicketRow } from '@/lib/googleSheet';
import { Ticket } from '@/app/types/ticket';

export async function GET() {
  try {
    const tickets = await getAllTickets();
    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await addTicketRow(body);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error adding ticket:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
