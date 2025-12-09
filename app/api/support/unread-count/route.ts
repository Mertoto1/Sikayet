import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { isSessionWithRole, isAdmin, isCompany } from '@/lib/auth-utils'

export async function GET() {
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

    let unreadCount = 0

    if (userRole === 'ADMIN') {
      // Count unread tickets for admin (tickets not read by admin with new messages from company)
      const result: any[] = await prisma.$queryRaw`
        SELECT COUNT(*) as unreadCount
        FROM "SupportTicket" st
        JOIN "SupportMessage" sm ON st.id = sm."ticketId"
        WHERE sm.id = (
          SELECT id 
          FROM "SupportMessage" 
          WHERE "ticketId" = st.id 
          ORDER BY "createdAt" DESC 
          LIMIT 1
        )
        AND sm."senderRole" != 'ADMIN'
        AND st."isReadByAdmin" = false
      `
      
      unreadCount = Number(result[0]?.unreadCount) || 0
    } else if (userRole === 'COMPANY') {
      // For company, get company ID first
      const userResult: any[] = await prisma.$queryRaw`
        SELECT "companyId" 
        FROM "User" 
        WHERE id = ${userId}
      `
      
      if (userResult.length && userResult[0].companyId) {
        const companyId = userResult[0].companyId
        
        // Count messages in company's tickets where the last message is not from company
        const result: any[] = await prisma.$queryRaw`
          SELECT COUNT(*) as unreadCount
          FROM "SupportTicket" st
          JOIN "SupportMessage" sm ON st.id = sm."ticketId"
          WHERE st."companyId" = ${companyId}
          AND sm.id = (
            SELECT id 
            FROM "SupportMessage" 
            WHERE "ticketId" = st.id 
            ORDER BY "createdAt" DESC 
            LIMIT 1
          )
          AND sm."senderRole" != 'COMPANY'
        `
        // Convert BigInt to number
        unreadCount = Number(result[0]?.unreadCount) || 0
      }
    }

    return NextResponse.json({ unreadCount })
  } catch (error) {
    console.error('Unread count fetch error:', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}

// POST method to reset unread count (mark as read)
export async function POST(request: Request) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    // Extract role from session
    const userRole = isSessionWithRole(session) ? session.role : null
    
    if (!userRole || (userRole !== 'ADMIN' && userRole !== 'COMPANY')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    // For now, we just return success as we're resetting client-side
    // In a more advanced implementation, we might store read status in the database
    // For this implementation, we'll rely on client-side tracking with socket updates
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unread count reset error:', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}