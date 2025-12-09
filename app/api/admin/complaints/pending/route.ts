import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { isAdmin } from '@/lib/auth-utils'

export async function GET() {
    try {
        const session = await getSession()
        
        if (!isAdmin(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const complaints = await prisma.complaint.findMany({
            where: { status: 'PENDING_MODERATION' },
            orderBy: { createdAt: 'desc' },
            include: {
                user: { 
                    select: { 
                        name: true, 
                        email: true,
                        avatar: true
                    } 
                },
                company: { select: { name: true, slug: true } }
            }
        })

        return NextResponse.json({ complaints })
    } catch (error) {
        console.error('Pending complaints fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch pending complaints' }, 
            { status: 500 }
        )
    }
}