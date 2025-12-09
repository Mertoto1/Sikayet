import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { sendEmail } from '@/lib/email'
import { isAdmin } from '@/lib/auth-utils'
import { getSiteSettings } from '@/lib/settings'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    
    // Check if user is admin
    const session = await getSession()
    if (!isAdmin(session)) {
        return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    try {
        // Get the verification request
        const requestRecord = await prisma.companyVerificationRequest.findUnique({
            where: { id: parseInt(id) },
            include: { user: true, company: true }
        })

        if (!requestRecord) {
            return NextResponse.json({ error: 'Başvuru bulunamadı' }, { status: 404 })
        }

        if (requestRecord.status !== 'PENDING') {
            return NextResponse.json({ error: 'Başvuru zaten işleme alınmış' }, { status: 400 })
        }

        // Update user role to COMPANY
        await prisma.user.update({
            where: { id: requestRecord.userId },
            data: { role: 'COMPANY' }
        })

        // Update company status to approved
        await prisma.company.update({
            where: { id: requestRecord.companyId },
            data: { isApproved: true }
        })

        // Update verification request status
        await prisma.companyVerificationRequest.update({
            where: { id: requestRecord.id },
            data: { status: 'APPROVED' }
        })

        // Send approval email only if SMTP is configured
        let emailSent = false;
        if (requestRecord.user.email) {
            try {
                const siteSettings = await getSiteSettings()
                const siteName = siteSettings.siteName
                
                const emailHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Şirket Hesabınız Onaylandı</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0;">Şirket Hesabınız Onaylandı</h1>
                        </div>
                        <div style="padding: 30px; background: #f9f9f9; border: 1px solid #eee;">
                            <h2 style="color: #333;">Merhaba ${requestRecord.user.name},</h2>
                            <p><strong>${requestRecord.company.name}</strong> adına yaptığınız şirket temsilcisi hesap başvurusu başarıyla onaylandı.</p>
                            
                            <p>Artık şirket panelinize giriş yapabilirsiniz:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login" 
                                   style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                    Panele Giriş Yap
                                </a>
                            </div>
                            
                            <p style="font-size: 14px; color: #666;">
                                Saygılarımızla,<br>
                                ${siteName} Destek Ekibi
                            </p>
                        </div>
                        <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
                            <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
                        </div>
                    </div>
                </body>
                </html>
                `
                
                const result = await sendEmail(
                    requestRecord.user.email,
                    'Şirket Hesabınız Onaylandı',
                    emailHtml
                )
                
                emailSent = result && result.success;
                if (emailSent) {
                    console.log(`Approval email sent successfully to ${requestRecord.user.email}`);
                } else {
                    console.warn(`Failed to send approval email to ${requestRecord.user.email}`, result);
                }
            } catch (emailError) {
                // Log email error but don't fail the whole process
                console.error('Failed to send approval email:', emailError)
            }
        }

        return NextResponse.json({ 
            success: true,
            message: emailSent 
                ? 'Başvuru onaylandı ve e-posta gönderildi' 
                : 'Başvuru onaylandı ancak e-posta gönderilemedi'
        })
    } catch (error) {
        console.error('Approve company request error:', error)
        return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu' }, { status: 500 })
    }
}