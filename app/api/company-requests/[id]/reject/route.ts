import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { sendEmail } from '@/lib/email'
import { isAdmin } from '@/lib/auth-utils'

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

    // Update request status
    await prisma.companyRequest.update({
      where: { id: requestId },
      data: { 
        status: 'REJECTED',
        updatedAt: new Date()
      }
    })

    // Send rejection email
    let emailSent = false;
    try {
      const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Şirket Talebiniz Reddedildi</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0;">
          <h2 style="color: #333;">Merhaba ${companyRequest.fullName},</h2>
          
          <p>${companyRequest.companyName} için yaptığınız şirket kayıt talebi reddedilmiştir.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">Talep Detayları:</h3>
            <p><strong>Şirket Adı:</strong> ${companyRequest.companyName}</p>
            <p><strong>Sektör:</strong> ${companyRequest.companySector}</p>
            ${companyRequest.companyDescription ? `<p><strong>Açıklama:</strong> ${companyRequest.companyDescription}</p>` : ''}
          </div>
          
          <p>Eğer bu karar hakkında sorularınız varsa lütfen bizimle iletişime geçin.</p>
          
          <p>Alternatif olarak farklı bir şirket adıyla yeni bir talep oluşturabilirsiniz.</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px;">
          <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
          <p>© ${new Date().getFullYear()} Şikayet Platformu</p>
        </div>
      </body>
      </html>`

      const result = await sendEmail(
        companyRequest.email,
        `${companyRequest.companyName} Şirket Kaydı Reddedildi`,
        emailHtml
      )
      
      emailSent = result && result.success;
      if (emailSent) {
        console.log(`Company rejection email sent successfully to ${companyRequest.email}`);
      } else {
        console.warn(`Failed to send company rejection email to ${companyRequest.email}`, result);
      }
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError)
      // Don't fail the whole operation if email fails
    }

    return NextResponse.json({ 
      success: true,
      message: emailSent 
        ? 'Şirket kaydı reddedildi ve e-posta gönderildi' 
        : 'Şirket kaydı reddedildi ancak e-posta gönderilemedi'
    })
  } catch (error) {
    console.error('Reject company request error:', error)
    return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu' }, { status: 500 })
  }
}