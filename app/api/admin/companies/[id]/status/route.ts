import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { isAdmin } from '@/lib/auth-utils'
import { sendEmail } from '@/lib/email'
import { getSiteSettings } from '@/lib/settings'

export async function PATCH(request: Request, { params }: { params: any }) {
    const session = await getSession()
    if (!isAdmin(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { isApproved } = body

    // Get company with user info before updating
    const company = await prisma.company.findUnique({
        where: { id: parseInt(id) },
        include: {
            users: {
                where: {
                    role: { in: ['COMPANY', 'COMPANY_PENDING'] }
                },
                take: 1
            }
        }
    })

    if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Update company status
    await prisma.company.update({
        where: { id: parseInt(id) },
        data: { isApproved }
    })

    // If approved, update user role and send email
    if (isApproved && company.users.length > 0) {
        const user = company.users[0]
        
        // Update user role to COMPANY if it was COMPANY_PENDING
        if (user.role === 'COMPANY_PENDING') {
            await prisma.user.update({
                where: { id: user.id },
                data: { role: 'COMPANY' }
            })
        }

        // Send approval email
        try {
            const siteSettings = await getSiteSettings()
            const siteName = siteSettings.siteName
            
            const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Şirket Üyeliği Onaylandı</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                        <div style="width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                            <svg style="width: 40px; height: 40px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">Tebrikler!</h1>
                        <p style="color: rgba(255, 255, 255, 0.95); margin: 10px 0 0; font-size: 18px;">Şirketinizin Üyeliği Onaylandı</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #333333; margin-top: 0; font-size: 24px; font-weight: 600;">Merhaba ${user.name || 'Değerli Üye'},</h2>
                        
                        <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                            <strong>${company.name}</strong> şirketinizin üyeliği başarıyla onaylanmıştır! 
                            Artık şirket panelinize giriş yapabilir ve tüm özelliklere erişebilirsiniz.
                        </p>
                        
                        <!-- What You Can Do Section -->
                        <div style="background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%); border-left: 4px solid #667eea; padding: 25px; border-radius: 8px; margin: 30px 0;">
                            <h3 style="color: #667eea; margin-top: 0; font-size: 20px; font-weight: 600; margin-bottom: 15px;">
                                🎉 Artık Yapabilecekleriniz:
                            </h3>
                            <ul style="color: #555555; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                <li style="margin-bottom: 10px;"><strong>Şikayetleri Görüntüleme:</strong> Firmanıza gelen tüm şikayetleri görüntüleyebilirsiniz</li>
                                <li style="margin-bottom: 10px;"><strong>Şikayetlere Yanıt Verme:</strong> Müşterilerinizin şikayetlerine resmi yanıt verebilirsiniz</li>
                                <li style="margin-bottom: 10px;"><strong>Profil Yönetimi:</strong> Şirket bilgilerinizi güncelleyebilir ve logo ekleyebilirsiniz</li>
                                <li style="margin-bottom: 10px;"><strong>İstatistikleri Takip:</strong> Şikayet istatistiklerinizi ve memnuniyet oranınızı takip edebilirsiniz</li>
                                <li style="margin-bottom: 0;"><strong>Destek Talebi:</strong> Herhangi bir sorunuzda destek ekibimizle iletişime geçebilirsiniz</li>
                            </ul>
                        </div>
                        
                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/company" 
                               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                                Şirket Paneline Git →
                            </a>
                        </div>
                        
                        <div style="background-color: #fff8e6; border-left: 4px solid #ffc107; padding: 15px; border-radius: 8px; margin: 30px 0;">
                            <p style="color: #856404; margin: 0; font-size: 14px;">
                                <strong>💡 İpucu:</strong> Şikayetlere hızlı ve profesyonel yanıt vermek müşteri memnuniyetini artırır ve marka imajınızı güçlendirir.
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                        <p style="color: #999999; font-size: 13px; margin: 0;">
                            Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.
                        </p>
                        <p style="color: #cccccc; font-size: 12px; margin: 8px 0 0;">
                            © ${new Date().getFullYear()} ${siteName}. Tüm hakları saklıdır.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            `

            const result = await sendEmail(
                user.email,
                `Tebrikler! ${company.name} Üyeliği Onaylandı`,
                emailHtml
            )
            
            if (result && result.success) {
                console.log(`Company approval email sent successfully to ${user.email}`)
            } else {
                console.warn(`Failed to send company approval email to ${user.email}`, result)
            }
        } catch (emailError) {
            console.error('Failed to send approval email:', emailError)
            // Don't fail the whole operation if email fails
        }
    }

    return NextResponse.json({ success: true })
}