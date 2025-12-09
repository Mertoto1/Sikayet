import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { isAdmin } from '@/lib/auth-utils'
import { generate2FASecret, generateQRCodeDataURL, enable2FA, disable2FA } from '@/lib/2fa'
import { getSiteSettings } from '@/lib/settings'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const userId = parseInt(id)
    
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı ID' }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Generate 2FA secret and QR code
    const secret = generate2FASecret(user.email)
    const siteSettings = await getSiteSettings()
    const siteName = siteSettings.siteName
    
    const qrCode = await generateQRCodeDataURL(secret, user.email, siteName)

    return NextResponse.json({
      success: true,
      secret,
      qrCode,
      message: '2FA secret oluşturuldu'
    })
  } catch (error) {
    console.error('2FA generate error:', error)
    return NextResponse.json(
      { error: '2FA secret oluşturulamadı' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const userId = parseInt(id)
    
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı ID' }, { status: 400 })
    }

    const body = await request.json()
    const { action, secret } = body

    if (action === 'enable') {
      if (!secret) {
        return NextResponse.json({ error: 'Secret gereklidir' }, { status: 400 })
      }
      
      await enable2FA(userId, secret)
      
      return NextResponse.json({
        success: true,
        message: '2FA başarıyla etkinleştirildi'
      })
    } else if (action === 'disable') {
      await disable2FA(userId)
      
      return NextResponse.json({
        success: true,
        message: '2FA başarıyla devre dışı bırakıldı'
      })
    } else {
      return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 })
    }
  } catch (error) {
    console.error('2FA update error:', error)
    return NextResponse.json(
      { error: '2FA güncellenemedi' },
      { status: 500 }
    )
  }
}

