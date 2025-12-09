import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { isAdmin } from '@/lib/auth-utils'

export async function POST(request: Request, { params }: { params: any }) {
    const session = await getSession()
    if (!isAdmin(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params

    await prisma.complaint.update({
        where: { id },
        data: { status: 'PUBLISHED' }
    })

    return NextResponse.json({ success: true })
}