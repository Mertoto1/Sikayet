import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract userId from session
    const userId = typeof session === 'object' && session !== null ? session.userId : null
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        surname: true,
        username: true,
        phone: true,
        avatar: true,
        bio: true,
        isVerified: true,
        twoFactorEnabled: true,
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            isApproved: true
          }
        }
      }
    })

    if (!user) {
      // If session exists but user not found, return 401 instead of 404
      // This indicates an authentication/authorization issue, not a missing resource
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}