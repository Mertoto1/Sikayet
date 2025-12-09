import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { type NextRequest } from 'next/server'
import { isAdmin } from '@/lib/auth-utils'

export async function PUT(request: NextRequest, context: { params: Promise<{}> }) {
    const params = await context.params;
    const { id } = params as { id: string };
    const session = await getSession()
    if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const body = await request.json()
    const { name, email, role, isVerified } = body

    try {
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                name,
                email,
                role,
                isVerified
            }
        })
        return NextResponse.json({ success: true, user })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update user' }, { status: 400 })
    }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{}> }) {
    const params = await context.params;
    const { id } = params as { id: string };
    const session = await getSession()
    if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    try {
        const userId = parseInt(id)
        
        // Delete all related data in correct order to avoid foreign key constraints
        
        // 1. Delete complaint images (through complaints)
        const complaints = await prisma.complaint.findMany({
            where: { userId }
        })
        const complaintIds = complaints.map(c => c.id)
        
        if (complaintIds.length > 0) {
            await prisma.complaintImage.deleteMany({
                where: { complaintId: { in: complaintIds } }
            })
            
            // 2. Delete complaint responses
            await prisma.complaintResponse.deleteMany({
                where: { complaintId: { in: complaintIds } }
            })
        }
        
        // 3. Delete complaints
        await prisma.complaint.deleteMany({
            where: { userId }
        })
        
        // 4. Delete reviews
        await prisma.review.deleteMany({
            where: { userId }
        })
        
        // 5. Delete verification requests
        await prisma.companyVerificationRequest.deleteMany({
            where: { userId }
        })
        
        // 6. Delete support messages
        await prisma.supportMessage.deleteMany({
            where: { senderId: userId }
        })
        
        // 7. Unassign support tickets (set adminId to null)
        await prisma.supportTicket.updateMany({
            where: { adminId: userId },
            data: { adminId: null }
        })
        
        // 8. Delete moderator record if exists
        await prisma.moderator.deleteMany({
            where: { userId }
        })
        
        // 9. Finally delete the user
        await prisma.user.delete({
            where: { id: userId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete user error:', error)
        return NextResponse.json({ error: 'Failed to delete user', details: error }, { status: 400 })
    }
}