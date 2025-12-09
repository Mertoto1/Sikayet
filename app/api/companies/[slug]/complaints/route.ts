import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request, { params }: { params: any }) {
    const { slug } = await params

    try {
        const company = await prisma.company.findUnique({ where: { slug } })
        if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        const complaints = await prisma.complaint.findMany({
            where: { companyId: company.id, status: 'PUBLISHED' },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ complaints })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
