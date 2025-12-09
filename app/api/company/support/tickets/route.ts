import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { isSessionWithRole, isCompany } from '@/lib/auth-utils'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    
    // Check if user is company
    if (!isCompany(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get company ID for this user
    const userId = isSessionWithRole(session) ? session.userId : null
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Get user with company info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    })

    if (!user || !user.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Check if company is approved
    const isPendingApproval = user.role === 'COMPANY_PENDING' || !user.company.isApproved
    if (isPendingApproval) {
      return NextResponse.json({ 
        error: 'Şirket onayı bekleniyor. Onaylandıktan sonra bu özelliği kullanabilirsiniz.' 
      }, { status: 403 })
    }

    const companyId = user.company.id

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Get support tickets for this company
    const tickets: any[] = await prisma.$queryRaw`
      SELECT 
        st.id,
        st.title,
        st.content,
        st.status,
        st.priority,
        st."createdAt",
        st."updatedAt",
        COUNT(sm.id) as messageCount,
        MAX(sm."createdAt") as lastMessageAt
      FROM "SupportTicket" st
      LEFT JOIN "SupportMessage" sm ON st.id = sm."ticketId"
      WHERE st."companyId" = ${companyId}
      GROUP BY st.id, st.title, st.content, st.status, st.priority, st."createdAt", st."updatedAt"
      ORDER BY st."createdAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    // Get total count
    const countResult: any[] = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "SupportTicket"
      WHERE "companyId" = ${companyId}
    `
    const total = Number(countResult[0].count)

    return NextResponse.json({
      tickets,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    })
  } catch (error) {
    console.error('Support tickets fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch support tickets' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    
    // Check if user is company
    if (!isCompany(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get company ID for this user
    const userId = isSessionWithRole(session) ? session.userId : null
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Get user with company info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    })

    if (!user || !user.company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Check if company is approved
    const isPendingApproval = user.role === 'COMPANY_PENDING' || !user.company.isApproved
    if (isPendingApproval) {
      return NextResponse.json({ 
        error: 'Şirket onayı bekleniyor. Onaylandıktan sonra bu özelliği kullanabilirsiniz.' 
      }, { status: 403 })
    }

    const companyId = user.company.id

    const body = await request.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Create support ticket using raw query with SQLite compatible date function
    const ticketResult: any[] = await prisma.$queryRaw`
      INSERT INTO "SupportTicket" ("title", "content", "companyId", "status", "priority", "createdAt", "updatedAt")
      VALUES (${title}, ${content}, ${companyId}, 'OPEN', 'MEDIUM', datetime('now'), datetime('now'))
      RETURNING id, "title", "content", "status", "priority", "companyId", "createdAt", "updatedAt"
    `

    const ticket = ticketResult[0]

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id.toString(),
        title: ticket.title,
        content: ticket.content,
        status: ticket.status,
        priority: ticket.priority,
        companyId: ticket.companyId,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      }
    })
  } catch (error) {
    console.error('Support ticket creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create support ticket' }, 
      { status: 500 }
    )
  }
}