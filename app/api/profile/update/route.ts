import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { isSessionWithRole } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Check if session has userId property
        if (!isSessionWithRole(session) || !session.userId) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
        }

        const formData = await request.formData()

        const name = formData.get('name') as string
        const surname = formData.get('surname') as string | null
        const username = formData.get('username') as string | null
        const phone = formData.get('phone') as string | null
        const avatar = formData.get('avatar') as string | null
        const bio = formData.get('bio') as string | null

        // Validate required fields
        if (!name || name.trim() === '') {
            return NextResponse.json(
                { error: 'Ad alanı zorunludur' },
                { status: 400 }
            )
        }

        // Update user
        await prisma.user.update({
            where: { id: session.userId },
            data: {
                name: name.trim(),
                surname: surname?.trim() || null,
                username: username?.trim() || null,
                phone: phone?.trim() || null,
                // @ts-ignore - Prisma client will be regenerated
                avatar: avatar?.trim() || null,
                // @ts-ignore - Prisma client will be regenerated
                bio: bio?.trim() || null,
            } as any
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Profile update error:', error)

        // Handle unique constraint violations
        if (error.code === 'P2002') {
            const field = error.meta?.target?.[0]
            const message = field === 'username'
                ? 'Bu kullanıcı adı zaten kullanılıyor'
                : field === 'phone'
                    ? 'Bu telefon numarası zaten kullanılıyor'
                    : 'Bu bilgi zaten kullanılıyor'

            return NextResponse.json(
                { error: message },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Profil güncellenirken bir hata oluştu' },
            { status: 500 }
        )
    }
}