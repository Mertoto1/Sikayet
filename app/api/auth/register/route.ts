import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { generateVerificationCode, saveVerificationCode, sendVerificationEmail } from '@/lib/verification'
import { isEmailVerificationEnabled } from '@/lib/settings'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, surname, username, phone } = body

    // Validate input
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'İsim, email, telefon ve şifre alanları zorunludur' },
        { status: 400 }
      )
    }

    if (phone.length < 10) {
      return NextResponse.json(
        { error: 'Geçerli bir telefon numarası giriniz' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Bu email adresiyle zaten bir hesap var' },
        { status: 409 }
      )
    }

    // Check if username already exists (if provided)
    if (username) {
      const existingUserByUsername = await prisma.user.findUnique({
        where: { username }
      })

      if (existingUserByUsername) {
        return NextResponse.json(
          { error: 'Bu kullanıcı adı zaten kullanılıyor' },
          { status: 409 }
        )
      }
    }

    // Check if phone already exists
    const existingUserByPhone = await prisma.user.findFirst({
      where: { phone }
    })

    if (existingUserByPhone) {
      return NextResponse.json(
        { error: 'Bu telefon numarasıyla zaten bir hesap var' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        surname: surname || null,
        username: username || null,
        email,
        phone: phone,
        password: hashedPassword,
        role: 'USER',
        isVerified: false,
      }
    })

    // Check if email verification is enabled
    const emailVerificationEnabled = await isEmailVerificationEnabled()
    
    let emailSent = false
    let emailError: any = null
    let requiresVerification = false

    if (emailVerificationEnabled) {
      // Generate and save verification code
      const verificationCode = generateVerificationCode()
      await saveVerificationCode(user.id, verificationCode)

      // Send verification email
      console.log(`[REGISTER] ========== START EMAIL SEND ==========`)
      console.log(`[REGISTER] User ID: ${user.id}, Email: ${email}, Name: ${name}`)
      console.log(`[REGISTER] Attempting to send verification email to ${email} for user ${user.id}`)
      
      try {
        emailSent = await sendVerificationEmail(email, verificationCode, name)
        
        if (emailSent) {
          console.log(`[REGISTER] ✅ Verification email sent successfully for user ${user.id} (${email})`)
        } else {
          console.error(`[REGISTER] ❌ Failed to send verification email for user ${user.id} (${email})`)
        }
      } catch (error: any) {
        emailError = error
        console.error(`[REGISTER] ❌ Exception while sending email:`, error)
        console.error(`[REGISTER] Error message: ${error?.message}`)
        console.error(`[REGISTER] Error code: ${error?.code}`)
        console.error(`[REGISTER] Error stack: ${error?.stack}`)
      }
      
      console.log(`[REGISTER] ========== END EMAIL SEND ==========`)
      requiresVerification = true
    } else {
      // Email verification disabled - mark user as verified directly
      console.log(`[REGISTER] Email verification is disabled - marking user ${user.id} as verified`)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          emailVerified: new Date()
        }
      })
    }

    // Return success
    return NextResponse.json({ 
        success: true, 
        requiresVerification,
        message: requiresVerification 
          ? (emailSent 
              ? 'Doğrulama kodu e-posta adresinize gönderildi'
              : 'Kayıt başarılı, ancak e-posta gönderilemedi. Lütfen yönetici ile iletişime geçin.')
          : 'Kayıt başarılı! Giriş yapabilirsiniz.',
        userId: user.id,
        emailSent,
        emailError: emailError ? {
          message: emailError.message,
          code: emailError.code
        } : null
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Kayıt işlemi sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}