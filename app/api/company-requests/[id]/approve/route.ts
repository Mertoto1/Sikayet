import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { sendEmail } from '@/lib/email'
import { isAdmin } from '@/lib/auth-utils'
import { getSiteSettings } from '@/lib/settings'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const { id } = await params
    const requestId = parseInt(id)
    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'Geçersiz başvuru ID' }, { status: 400 })
    }

    // Get the company request
    const companyRequest = await prisma.companyRequest.findUnique({
      where: { id: requestId }
    })

    if (!companyRequest) {
      return NextResponse.json({ error: 'Şirket başvurusu bulunamadı' }, { status: 404 })
    }

    if (companyRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Başvuru zaten işleme alınmış' }, { status: 400 })
    }

    // Create the company
    const slug = companyRequest.companyName
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'company'

    const company = await prisma.company.create({
      data: {
        name: companyRequest.companyName,
        slug: slug,
        description: companyRequest.companyDescription || '',
        logoUrl: companyRequest.companyLogo || null,
        isApproved: true
      }
    })

    // Update request status
    await prisma.companyRequest.update({
      where: { id: requestId },
      data: { 
        status: 'APPROVED',
        updatedAt: new Date()
      }
    })

    // Send approval email
    let emailSent = false;
    try {
      const siteSettings = await getSiteSettings()
      const siteName = siteSettings.siteName
      
      const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Şirket Talebiniz Onaylandı!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0;">
          <h2 style="color: #333;">Merhaba ${companyRequest.fullName},</h2>
          
          <p>${companyRequest.companyName} için yaptığınız şirket kayıt talebi onaylanmıştır.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">Şirket Bilgileri:</h3>
            <p><strong>Şirket Adı:</strong> ${companyRequest.companyName}</p>
            <p><strong>Sektör:</strong> ${companyRequest.companySector}</p>
            ${companyRequest.companyDescription ? `<p><strong>Açıklama:</strong> ${companyRequest.companyDescription}</p>` : ''}
          </div>
          
          <p>Şimdi şirket temsilcisi olarak giriş yapabilir ve panelinizi kullanabilirsiniz.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/company-login" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Panele Git
            </a>
          </div>
          
          <p>Herhangi bir sorunuz varsa lütfen bizimle iletişime geçin.</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px;">
          <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
          <p>© ${new Date().getFullYear()} ${siteName}</p>
        </div>
      </body>
      </html>`

      const result = await sendEmail(
        companyRequest.email,
        `${companyRequest.companyName} Şirket Kaydı Onaylandı`,
        emailHtml
      )
      
      emailSent = result && result.success;
      if (emailSent) {
        console.log(`Company approval email sent successfully to ${companyRequest.email}`);
      } else {
        console.warn(`Failed to send company approval email to ${companyRequest.email}`, result);
      }
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError)
      // Don't fail the whole operation if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: emailSent 
        ? 'Şirket kaydı onaylandı ve e-posta gönderildi' 
        : 'Şirket kaydı onaylandı ancak e-posta gönderilemedi',
      company 
    })
  } catch (error) {
    console.error('Approve company request error:', error)
    return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu' }, { status: 500 })
  }
}