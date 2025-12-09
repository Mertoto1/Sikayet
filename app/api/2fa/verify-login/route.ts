import { NextResponse } from 'next/server'
import { verify2FAToken, getUser2FASecret } from '@/lib/2fa'
import { prisma } from '@/lib/db'
import { generateToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token || token === 'check') {
      // Just checking if verification is pending
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      const pendingUserId = cookieStore.get('pending2FAUserId')?.value
      
    if (!pendingUserId) {
      return NextResponse.json({ error: '2FA doğrulaması beklenmiyor' }, { status: 400 })
    }
      return NextResponse.json({ pending: true })
    }

    // Get the pending user ID from cookies
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const pendingUserId = cookieStore.get('pending2FAUserId')?.value

    if (!pendingUserId) {
      return NextResponse.json({ error: '2FA doğrulaması beklenmiyor' }, { status: 400 })
    }

    const userId = parseInt(pendingUserId)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı ID' }, { status: 400 })
    }

    // Get user's 2FA secret
    const secret = await getUser2FASecret(userId)
    
    if (!secret) {
      return NextResponse.json({ error: 'Bu kullanıcı için 2FA etkin değil' }, { status: 400 })
    }

    // Verify the token
    const isValid = verify2FAToken(secret, token)
    
    if (!isValid) {
      return NextResponse.json({ error: 'Hatalı kod girdiniz. Lütfen doğru 6 haneli kodu girin.' }, { status: 400 })
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Create session token
    const sessionToken = generateToken({ userId: user.id, role: user.role })

    // Set session cookie
    await setAuthCookie(sessionToken)

    // Clear pending 2FA cookie
    cookieStore.delete('pending2FAUserId')

    // Create response with cookie in header
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

    // Ensure cookie is set in response header
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })
    
    // For development, also log cookie setting
    if (process.env.NODE_ENV === 'development') {
      console.log('2FA verify-login: Session cookie set for user', user.id, 'role:', user.role)
    }

    // Clear pending 2FA cookie in response
    response.cookies.delete('pending2FAUserId')

    return response
  } catch (error) {
    console.error('2FA login verification error:', error)
    return NextResponse.json(
      { error: '2FA doğrulaması sırasında bir hata oluştu' }, 
      { status: 500 }
    )
  }
}