import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { isAdmin } from '@/lib/auth-utils'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession()
    if (!isAdmin(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    try {
        const complaints = await prisma.complaint.findMany({
            where: { userId },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logoUrl: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        email: true
                    }
                },
                images: {
                    select: {
                        id: true,
                        url: true
                    }
                },
                _count: {
                    select: {
                        responses: true,
                        images: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ complaints })
    } catch (error) {
        console.error('Error fetching user complaints:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

