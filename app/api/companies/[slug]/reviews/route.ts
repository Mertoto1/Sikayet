import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { isSessionWithRole } from '@/lib/auth-utils'

export async function POST(request: Request, { params }: { params: any }) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug } = await params
    // In this case, we expect the frontend to send the ID in the 'slug' url segment for reviews
    // e.g. /api/companies/123/reviews
    const companyId = parseInt(slug)
    const body = await request.json()
    const { rating, message } = body

    if (!rating || rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
    }

    // Check if session has userId property
    if (!isSessionWithRole(session) || !session.userId) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    try {
        const existing = await prisma.review.findUnique({
            where: {
                userId_companyId: {
                    userId: session.userId,
                    companyId
                }
            }
        })

        if (existing) {
            return NextResponse.json({ error: 'Already reviewed' }, { status: 409 })
        }

        const review = await prisma.review.create({
            data: {
                userId: session.userId,
                companyId,
                rating,
                message
            }
        })

        return NextResponse.json({ success: true, review })
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(request: Request, { params }: { params: any }) {
    const { slug } = await params
    const companyId = parseInt(slug)

    try {
        const reviews = await prisma.review.findMany({
            where: { companyId },
            include: {
                user: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ reviews })
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}