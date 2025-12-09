import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateVerificationCode, sendVerificationEmail, saveVerificationCode } from '@/lib/verification'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId } = body

        if (!userId) {
            return NextResponse.json({ error: 'Kullanıcı ID gereklidir' }, { status: 400 })
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) }
        })

        if (!user) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
        }

        // Check if user is already verified
        if (user.isVerified) {
            return NextResponse.json({ error: 'Kullanıcı zaten doğrulanmış' }, { status: 400 })
        }

        // Generate new verification code
        const verificationCode = generateVerificationCode()
        await saveVerificationCode(user.id, verificationCode)

        // Send verification email
        const emailResult = await sendVerificationEmail(user.email, verificationCode, user.name || '')
        
        // Log email sending result
        if (emailResult) {
            console.log(`Verification email successfully sent to ${user.email}`)
        } else {
            console.error(`Failed to send verification email to ${user.email}`)
        }

        return NextResponse.json({ 
            success: true,
            message: 'Yeni doğrulama kodu e-posta adresinize gönderildi'
        })
    } catch (error) {
        console.error('Resend Code Error:', error)
        // Log the specific error for better debugging
        if (error instanceof Error) {
            console.error('Email sending error details:', {
                message: error.message,
                stack: error.stack
            })
        }
        return NextResponse.json({ error: 'Kod yeniden gönderilemedi' }, { status: 500 })
    }
}