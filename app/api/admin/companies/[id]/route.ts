import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getSession()
    if (!session || (typeof session === 'object' && session !== null && (session as any).role !== 'ADMIN')) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const body = await request.json()
    const { name, description, logoUrl, sectorId } = body

    if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 })

    try {
        const company = await prisma.company.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                logoUrl,
                sectorId: sectorId ? parseInt(sectorId) : null
            }
        })
        return NextResponse.json({ success: true, company })
    } catch (error) {
        return NextResponse.json({ error: 'Company update failed' }, { status: 400 })
    }
}