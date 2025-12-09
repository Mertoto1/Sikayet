import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/auth-utils';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Get all support tickets using raw query
    const tickets: any[] = await prisma.$queryRaw`
      SELECT 
        st.id,
        st.title,
        st.content,
        st.status,
        st.priority,
        st."companyId",
        st."adminId",
        st."createdAt",
        st."updatedAt",
        c.name as "companyName"
      FROM "SupportTicket" st
      LEFT JOIN "Company" c ON st."companyId" = c.id
      ORDER BY st."createdAt" DESC
    `;

    // Transform tickets to match the expected format
    const transformedTickets = tickets.map((ticket: any) => ({
      id: ticket.id,
      title: ticket.title,
      content: ticket.content,
      status: ticket.status,
      priority: ticket.priority,
      companyId: ticket.companyId,
      adminId: ticket.adminId,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      company: {
        name: ticket.companyName
      }
    }));

    return NextResponse.json({ tickets: transformedTickets });
  } catch (error) {
    console.error('Support tickets fetch error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{}> }) {
  try {
    const session = await getSession();
    
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Unwrap the params promise and get the id
    const params = await context.params;
    const { id } = params as { id: string };
    const { status } = await request.json();

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