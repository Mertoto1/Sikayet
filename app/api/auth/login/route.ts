import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, generateToken } from '@/lib/auth'
import { withRateLimit, sanitizeRequestBody } from '@/lib/middleware-helpers'
import { authRateLimit } from '@/lib/rate-limit'

async function handleLogin(request: Request) {
  try {
    const body = await request.json()
    const sanitizedBody = sanitizeRequestBody(body)
    const { email, password } = sanitizedBody

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı' },
        { status: 401 }
      )
    }

    if (!user.password) {
      return NextResponse.json(
        { error: 'Hesap şifresi ayarlanmamış. Lütfen şifre sıfırlama işlemi yapın' },
        { status: 401 }
      )
    }

    // Check password
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Girdiğiniz şifre yanlış. Lütfen kontrol edip tekrar deneyin' },
        { status: 401 }
      )
    }

    // Check if user has 2FA enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      // Create response first
      const response = NextResponse.json({
        success: true,
        requires2FA: true,
        message: '2FA doğrulaması gerekiyor'
      })
      
      // Set a temporary cookie to store user ID for 2FA verification
      // Use response.cookies.set() to ensure cookie is in response headers
      response.cookies.set('pending2FAUserId', user.id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 5 // 5 minutes
      })
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Login API] 2FA required for user ${user.id}, pending cookie set`)
      }

      return response
    }

    // Create session token
    const token = generateToken({ 
      userId: user.id, 
      role: user.role 
    })

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

    // Set cookie in response header - CRITICAL: Use response.cookies.set() for API routes
    // Make sure to set cookie with proper attributes
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    }
    
    response.cookies.set('session', token, cookieOptions)

    // Debug log
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Login API] Cookie set for user ${user.id} with role ${user.role}`)
      console.log(`[Login API] Cookie options:`, cookieOptions)
      console.log(`[Login API] Response headers:`, Object.fromEntries(response.headers.entries()))
    }

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Giriş yapılırken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// Export with rate limiting
export const POST = withRateLimit(handleLogin, authRateLimit)