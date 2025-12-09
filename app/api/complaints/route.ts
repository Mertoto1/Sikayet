import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { isSessionWithRole } from '@/lib/auth-utils'
import { withRateLimit, sanitizeRequestBody } from '@/lib/middleware-helpers'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'PUBLISHED'
    const companyId = searchParams.get('companyId')

    // If status is PUBLISHED, include SOLVED and ANSWERED complaints (they remain published)
    const where: any = {
        status: status === 'PUBLISHED' 
            ? { in: ['PUBLISHED', 'SOLVED', 'ANSWERED'] }
            : status === 'SOLVED'
            ? { in: ['SOLVED', 'ANSWERED'] }
            : status
    }
    if (companyId) {
        where.companyId = parseInt(companyId)
    }

    try {
        const complaints = await prisma.complaint.findMany({
            where,
            include: {
                user: { select: { name: true } },
                company: { select: { name: true, slug: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        })

        const total = await prisma.complaint.count({ where })

        return NextResponse.json({ complaints, total, page, limit })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if session has userId property
    if (!isSessionWithRole(session) || !session.userId) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const sanitizedBody = sanitizeRequestBody(body)
        const { title, content, companyId, images } = sanitizedBody

        // Check if user already submitted a complaint for this company today
        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)
        
        const endOfDay = new Date()
        endOfDay.setHours(23, 59, 59, 999)

        const existingComplaint = await prisma.complaint.findFirst({
            where: {
                userId: session.userId,
                companyId: parseInt(companyId),
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        })

        if (existingComplaint) {
            return NextResponse.json({ 
                error: 'Bu firmaya bugün zaten bir şikayet oluşturmuşsunuz. Lütfen yarın tekrar deneyin.' 
            }, { status: 400 })
        }

        const complaint = await prisma.complaint.create({
            data: {
                title,
                content,
                companyId: parseInt(companyId),
                userId: session.userId,
                status: 'PUBLISHED',
                publishedAt: new Date(),
                images: {
                    create: images?.map((url: string) => ({ url })) || []
                }
            },
            include: {
                user: { select: { name: true } },
                company: { select: { name: true } }
            }
        })

        return NextResponse.json({ success: true, complaint })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}