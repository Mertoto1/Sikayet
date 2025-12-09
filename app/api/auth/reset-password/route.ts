import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { token, password } = body

        if (!token || !password) {
            return NextResponse.json({ error: 'Token ve şifre gereklidir' }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 })
        }

        // Find user by reset token
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        })

        if (!user) {
            return NextResponse.json({ 
                error: 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı' 
            }, { status: 400 })
        }

        // Hash new password
        const hashedPassword = await hashPassword(password)

        // Update user password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        })

        return NextResponse.json({ 
            success: true,
            message: 'Şifreniz başarıyla güncellendi'
        })
    } catch (error) {
        console.error('Reset Password Error:', error)
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
    }
}

