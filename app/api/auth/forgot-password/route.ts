import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'
import { getSiteSettings } from '@/lib/settings'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email) {
            return NextResponse.json({ error: 'E-posta adresi gereklidir' }, { status: 400 })
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        })

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({ 
                success: true,
                message: 'Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderilecektir.'
            })
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

        // Save reset token to user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: resetToken,
                resetTokenExpiry: resetTokenExpiry
            }
        })

        // Get base URL from settings or use default
        const siteUrlSetting = await prisma.systemSetting.findUnique({ where: { key: 'SITE_URL' } })
        const baseUrl = siteUrlSetting?.value || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const siteSettings = await getSiteSettings()
        const siteName = siteSettings.siteName
        
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

        // Send reset email
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Şifre Sıfırlama</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">${siteName}</h1>
                        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">Şifre Sıfırlama</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #333333; margin-top: 0; font-size: 24px; font-weight: 600;">Merhaba${user.name ? ' ' + user.name : ''}!</h2>
                        
                        <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                            Hesabınız için şifre sıfırlama talebinde bulundunuz. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                Şifremi Sıfırla
                            </a>
                        </div>
                        
                        <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                            Bu bağlantı 1 saat boyunca geçerlidir. Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
                        </p>
                        
                        <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 20px 0;">
                            Buton çalışmıyorsa, aşağıdaki bağlantıyı tarayıcınıza kopyalayın:<br>
                            <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
                        </p>
                        
                        <div style="background-color: #fff8e6; border-left: 4px solid #ffc107; padding: 15px; border-radius: 8px; margin: 30px 0;">
                            <p style="color: #856404; margin: 0; font-size: 14px;">
                                <strong>Güvenlik İpucu:</strong> Bu bağlantıyı kimseyle paylaşmayın. ${siteName} ekibi asla şifrenizi sormaz.
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                        <p style="color: #999999; font-size: 12px; margin: 0;">
                            © ${new Date().getFullYear()} ${siteName}. Tüm hakları saklıdır.
                        </p>
                        <p style="color: #cccccc; font-size: 11px; margin: 5px 0 0;">
                            Bu otomatik bir e-postadır, lütfen yanıtlamayın.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `

        const emailResult = await sendEmail(email, `${siteName} - Şifre Sıfırlama`, html)
        
        if (emailResult.success) {
            console.log(`Password reset email sent to ${email}`)
        } else {
            console.error(`Failed to send password reset email to ${email}`, emailResult)
        }

        return NextResponse.json({ 
            success: true,
            message: 'Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderilecektir.'
        })
    } catch (error) {
        console.error('Forgot Password Error:', error)
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
    }
}

