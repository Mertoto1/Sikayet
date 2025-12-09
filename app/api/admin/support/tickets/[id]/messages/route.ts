import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { type NextRequest } from 'next/server';
import { isAdmin } from '@/lib/auth-utils';

export async function GET(request: NextRequest, context: { params: Promise<{}> }) {
  try {
    const session = await getSession();
    
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Unwrap the params promise and get the id
    const params = await context.params;
    const { id } = params as { id: string };

    // Execute raw query to get messages for this ticket
    const messages: any[] = await prisma.$queryRaw`
      SELECT 
        sm.id,
        sm."senderId",
        sm."senderRole",
        sm.content,
        sm."createdAt",
        u.name as "senderName"
      FROM "SupportMessage" sm
      LEFT JOIN "User" u ON sm."senderId" = u.id
      WHERE sm."ticketId" = ${parseInt(id)}
      ORDER BY sm."createdAt" ASC
    `;

    // Transform messages to match the client-side interface
    const transformedMessages = messages.map((message: any) => ({
      id: message.id.toString(),
      senderId: message.senderId.toString(),
      senderRole: message.senderRole,
      senderName: message.senderName || 'Bilinmeyen Kullanıcı',
      content: message.content,
      timestamp: message.createdAt,
    }));

    return NextResponse.json({ messages: transformedMessages });
  } catch (error) {
    console.error('Support messages fetch error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
  }
}