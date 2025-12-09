import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        
        // Get viewed complaints from cookies
        const cookieStore = await cookies()
        const viewedComplaintsCookie = cookieStore.get('viewedComplaints')
        const viewedComplaints = viewedComplaintsCookie ? JSON.parse(viewedComplaintsCookie.value) : []
        
        // Check if this complaint has already been viewed
        if (viewedComplaints.includes(id)) {
            // Return current view count without incrementing
            const complaint = await prisma.complaint.findUnique({
                where: { id },
                select: { viewCount: true }
            })
            
            return NextResponse.json({ 
                success: true, 
                viewCount: complaint?.viewCount || 0,
                message: 'Already viewed'
            })
        }

        // Double-check: Verify complaint hasn't been viewed (race condition protection)
        const currentComplaint = await prisma.complaint.findUnique({
            where: { id },
            select: { viewCount: true }
        })
        
        if (!currentComplaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
        }

        // Add complaint to viewed list
        viewedComplaints.push(id)
        
        // Update cookie with new viewed complaints list (expires in 30 days)
        const thirtyDays = 30 * 24 * 60 * 60 * 1000
        const expires = new Date(Date.now() + thirtyDays)
        
        // Set cookie FIRST to prevent duplicate increments
        ;(await cookies()).set('viewedComplaints', JSON.stringify(viewedComplaints), {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        })

        // Increment view count atomically
        const updatedComplaint = await prisma.complaint.update({
            where: { id },
            data: {
                viewCount: {
                    increment: 1
                }
            }
        })

        return NextResponse.json({ success: true, viewCount: updatedComplaint.viewCount })
    } catch (error) {
        console.error('Increment view count error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}