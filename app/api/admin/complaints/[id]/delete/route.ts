import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { isAdmin } from '@/lib/auth-utils'

export async function POST(request: Request, { params }: { params: any }) {
    const session = await getSession()
    if (!isAdmin(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params

    // First delete related images
    await prisma.complaintImage.deleteMany({
        where: { complaintId: id }
    })

    // Delete related responses
    await prisma.complaintResponse.deleteMany({
        where: { complaintId: id }
    })

    // Delete the complaint
    await prisma.complaint.delete({
        where: { id }
    })

    return NextResponse.json({ success: true })
}