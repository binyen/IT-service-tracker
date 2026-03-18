import { NextResponse } from 'next/server';
import { updateTicketRow, deleteTicketRow } from '@/lib/googleSheet';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await updateTicketRow(id, body);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteTicketRow(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
