import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { ticketId } = await request.json();
    
    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID gerekli' }, { status: 400 });
    }

    // Mark ticket as read in database
    await prisma.supportTicket.update({
      where: { id: parseInt(ticketId) },
      data: { isReadByAdmin: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}