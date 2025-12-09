import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { isSessionWithRole, isAdmin, isCompany } from '@/lib/auth-utils'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    // Extract userId and role from session
    const userId = isSessionWithRole(session) ? session.userId : null
    const userRole = isSessionWithRole(session) ? session.role : null
    
    if (!userId || !userRole) {
      return NextResponse.json({ error: 'Geçersiz oturum' }, { status: 401 })
    }

    const { content, ticketId } = await request.json()

    // Validate input
    if (!content || !ticketId) {
      return NextResponse.json({ error: 'Eksik alanlar' }, { status: 400 })
    }

    // Check if user has permission to send message to this ticket
    let senderRole = ''
    if (isAdmin(session)) {
      senderRole = 'ADMIN'
    } else if (isCompany(session)) {
      // Get company ID for this user
      const userResult: any[] = await prisma.$queryRaw`
        SELECT "companyId" 
        FROM "User" 
        WHERE id = ${userId}
      `
      
      if (!userResult.length || !userResult[0].companyId) {
        return NextResponse.json({ error: 'Şirket hesabı bulunamadı' }, { status: 403 })
      }
      
      const userCompanyId = userResult[0].companyId
      
      // Verify the company owns this ticket using raw query
      const ticketResult: any[] = await prisma.$queryRaw`
        SELECT "companyId" 
        FROM "SupportTicket" 
        WHERE id = ${ticketId}
      `
      
      if (!ticketResult.length || ticketResult[0].companyId !== userCompanyId) {
        return NextResponse.json({ error: 'Bu talebe mesaj gönderme izniniz yok' }, { status: 403 })
      }
      
      senderRole = 'COMPANY'
    } else {
      return NextResponse.json({ error: 'Bu işlemi yapma izniniz yok' }, { status: 403 })
    }

    // Create the message using raw query with SQLite compatible date function
    const messageResult: any[] = await prisma.$queryRaw`
      INSERT INTO "SupportMessage" ("content", "senderId", "senderRole", "ticketId", "createdAt")
      VALUES (${content}, ${userId}, ${senderRole}, ${ticketId}, datetime('now'))
      RETURNING id, "senderId", "senderRole", "content", "ticketId", "createdAt"
    `

    // If company is sending message, mark ticket as unread for admin
    if (senderRole === 'COMPANY') {
      await prisma.$queryRaw`
        UPDATE "SupportTicket" 
        SET "isReadByAdmin" = false 
        WHERE id = ${ticketId}
      `
    }

    // Get sender name
    const userResult: any[] = await prisma.$queryRaw`
      SELECT name 
      FROM "User" 
      WHERE id = ${userId}
    `

    const message = messageResult[0]
    const senderName = userResult.length > 0 ? userResult[0].name : 'Bilinmeyen Kullanıcı'

    return NextResponse.json({ 
      success: true, 
      message: {
        id: message.id.toString(),
        senderId: message.senderId.toString(),
        senderRole: message.senderRole,
        senderName: senderName,
        content: message.content,
        timestamp: message.createdAt,
        ticketId: message.ticketId,
        roomId: message.ticketId.toString(), // Add roomId for socket communication
      }
    })
  } catch (error) {
    console.error('Support message creation error:', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}