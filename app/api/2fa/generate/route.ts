import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { generate2FASecret, generateQRCodeDataURL } from '@/lib/2fa'
import { prisma } from '@/lib/db'
import { isSessionWithRole } from '@/lib/auth-utils'
import { getSiteSettings } from '@/lib/settings'

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

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate a new 2FA secret
    const secret = generate2FASecret(user.email)
    
    // Get site name from settings
    const siteSettings = await getSiteSettings()
    const siteName = siteSettings.siteName
    
    // Generate QR code data URL
    const qrCode = await generateQRCodeDataURL(
      secret, 
      user.email, 
      siteName
    )

    return NextResponse.json({
      secret,
      qrCode
    })
  } catch (error) {
    console.error('2FA generate error:', error)
    return NextResponse.json(
      { error: 'Failed to generate 2FA secret' }, 
      { status: 500 }
    )
  }
}

