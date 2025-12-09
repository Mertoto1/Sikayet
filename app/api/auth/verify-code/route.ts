import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateToken } from '@/lib/auth'
import { setAuthCookie } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, code } = body

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'Kullanıcı ID ve doğrulama kodu gereklidir' },
        { status: 400 }
      )
    }

    // Find user with verification code
    const user = await prisma.user.findUnique({
      where: { 
        id: parseInt(userId),
        emailVerificationToken: code,
        emailVerificationTokenExpiry: {
          gte: new Date()
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş doğrulama kodu' },
        { status: 400 }
      )
    }

    // Update user as verified and clear verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null
      }
    })

    // Create session token
    const token = generateToken({ 
      userId: user.id, 
      role: user.role 
    })

    // Set auth cookie
    await setAuthCookie(token)

    // Create response with cookie in header
    const response = NextResponse.json({
      success: true,
      message: 'Email adresiniz başarıyla doğrulandı',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

    // Ensure cookie is set in response header
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Doğrulama işlemi sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}