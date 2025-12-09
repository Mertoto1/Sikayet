import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { disable2FA } from '@/lib/2fa'
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

    // Disable 2FA for the user
    await disable2FA(userId)

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully'
    })
  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json(
      { error: 'Failed to disable 2FA' }, 
      { status: 500 }
    )
  }
}