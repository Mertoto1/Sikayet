import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { isAdmin } from '@/lib/auth-utils'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getSession()
    if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const body = await request.json()
    const { name } = body

    if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 })

    try {
        const sector = await prisma.sector.update({
            where: { id: parseInt(id) },
            data: { name },
            include: {
                _count: {
                    select: {
                        companies: true
                    }
                }
            }
        })
        return NextResponse.json({ success: true, sector })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update sector' }, { status: 400 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const sectorId = parseInt(id)
        
        if (isNaN(sectorId)) {
            return NextResponse.json({ error: 'Geçersiz sektör ID' }, { status: 400 })
        }

        const session = await getSession()
        if (!isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // First delete all companies in this sector (as per requirement)
        await prisma.company.deleteMany({
            where: { sectorId: sectorId }
        })

        // Then delete the sector
        await prisma.sector.delete({
            where: { id: sectorId }
        })

        return NextResponse.json({ success: true, message: 'Sektör başarıyla silindi' })
    } catch (error: any) {
        console.error('Delete sector error:', error)
        return NextResponse.json({ 
            error: error.message || 'Sektör silinirken bir hata oluştu' 
        }, { status: 500 })
    }
}