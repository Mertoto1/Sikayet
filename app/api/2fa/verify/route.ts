import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { verify2FAToken, enable2FA } from '@/lib/2fa'
import { prisma } from '@/lib/db'
import { isSessionWithRole } from '@/lib/auth-utils'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract userId from session payload
    const userId = isSessionWithRole(session) ? session.userId : null
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const body = await request.json()
    const { token, secret } = body

    if (!token || !secret) {
      return NextResponse.json({ error: 'Token and secret are required' }, { status: 400 })
    }

    // Verify the token
    const isValid = verify2FAToken(secret, token)
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    // Enable 2FA for the user
    await enable2FA(userId, secret)

    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully'
    })
  } catch (error) {
    console.error('2FA verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify 2FA' }, 
      { status: 500 }
    )
  }
}