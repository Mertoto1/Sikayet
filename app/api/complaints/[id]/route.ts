import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: any }) {
    const { id } = await params

    try {
        const complaint = await prisma.complaint.findUnique({
            where: { id },
            include: {
                user: { select: { name: true } },
                company: { select: { name: true, slug: true, logoUrl: true } },
                images: true,
                responses: {
                    include: { company: { select: { name: true, logoUrl: true } } }
                }
            }
        })

        if (!complaint) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        return NextResponse.json({ complaint })
    } catch (error: any) {
        return NextResponse.json({ error: 'Error' }, { status: 500 })
    }
}

export async function PATCH(request: Request, { params }: { params: any }) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { status } = body

    // simple update without complex auth check for MVP
    const complaint = await prisma.complaint.update({
        where: { id },
        data: { status }
    })

    return NextResponse.json({ success: true, complaint })
}
