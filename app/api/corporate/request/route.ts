import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { z } from 'zod'
import { isSessionWithRole } from '@/lib/auth-utils'

const requestSchema = z.object({
    companyId: z.number(),
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    title: z.string().optional(),
})

export async function POST(req: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 })
        }

        // Check if session has userId property
        if (!isSessionWithRole(session) || !session.userId) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
        }

        const body = await req.json()
        const data = requestSchema.parse(body)

        // Log user ID
        console.log('User requesting verification:', session.userId)

        // Find user to check if already rep
        const user = await prisma.user.findUnique({ where: { id: session.userId } })
        if (user?.role === 'COMPANY') {
            return NextResponse.json({ error: 'Zaten bir şirket hesabısınız.' }, { status: 400 })
        }

        // Check pending requests
        const existing = await prisma.companyVerificationRequest.findFirst({
            where: {
                userId: session.userId,
                status: 'PENDING'
            }
        })

        if (existing) {
            return NextResponse.json({ error: 'Zaten bekleyen bir başvurunuz var.' }, { status: 400 })
        }

        const request = await prisma.companyVerificationRequest.create({
            data: {
                userId: session.userId,
                companyId: data.companyId,
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                title: data.title
            }
        })

        return NextResponse.json({ success: true, request })

    } catch (error: any) {
        console.error('Corporate request error:', error)
        return NextResponse.json({ error: error.message || 'Bir hata oluştu' }, { status: 500 })
    }
}