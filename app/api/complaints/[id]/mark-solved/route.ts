import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { isSessionWithRole } from '@/lib/auth-utils'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if session has userId property
        if (!isSessionWithRole(session) || !session.userId) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
        }

        const { id } = await params

        // Get the complaint
        const complaint = await prisma.complaint.findUnique({
            where: { id }
        })

        if (!complaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
        }

        // Check if the user owns this complaint
        if (complaint.userId !== session.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Update complaint status to SOLVED
        const updatedComplaint = await prisma.complaint.update({
            where: { id },
            data: { status: 'SOLVED' }
        })

        return NextResponse.json({ success: true, complaint: updatedComplaint })
    } catch (error) {
        console.error('Mark complaint as solved error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}