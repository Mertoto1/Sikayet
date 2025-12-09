import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { isAdmin } from '@/lib/auth-utils';

export async function PATCH(request: Request, { params }: { params: any }) {
  try {
    const session = await getSession();
    
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Update ticket status using raw query with SQLite compatible date function
    const result: any[] = await prisma.$queryRaw`
      UPDATE "SupportTicket"
      SET status = ${status}, "updatedAt" = datetime('now')
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Ticket bulunamadı' }, { status: 404 });
    }

    const ticket = result[0];

    return NextResponse.json({ 
      success: true, 
      ticket: {
        id: ticket.id,
        title: ticket.title,
        content: ticket.content,
        status: ticket.status,
        priority: ticket.priority,
        companyId: ticket.companyId,
        adminId: ticket.adminId,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      }
    });
  } catch (error) {
    console.error('Support ticket update error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}