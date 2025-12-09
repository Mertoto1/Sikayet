import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { isSessionWithRole, isCompany } from '@/lib/auth-utils'
import { getSiteSettings } from '@/lib/settings'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getSession()
    
    if (!isCompany(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if session has userId property
    if (!isSessionWithRole(session) || !session.userId) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { message } = body
        
        // Get complaint with user and company info
        const complaint = await prisma.complaint.findUnique({
            where: { id },
            include: {
                user: true,
                company: true
            }
        })
        
        if (!complaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
        }
        
        // Get user with company info
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            include: { company: true }
        })
        
        if (!user || !user.company) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        // Check if company is approved
        const isPendingApproval = user.role === 'COMPANY_PENDING' || !user.company.isApproved
        if (isPendingApproval) {
            return NextResponse.json({ 
                error: 'Şirket onayı bekleniyor. Şikayetlere cevap verebilmek için önce şirketinizin admin tarafından onaylanması gerekmektedir.' 
            }, { status: 403 })
        }
        
        // Check if user belongs to the company
        if (complaint.companyId !== user.companyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        // Create response
        const response = await prisma.complaintResponse.create({
            data: {
                complaintId: complaint.id,
                companyId: complaint.companyId,
                message
            },
            include: {
                company: true
            }
        })
        
        // Update complaint status to ANSWERED only if it's not already SOLVED
        await prisma.complaint.update({
            where: { id: complaint.id },
            data: { 
                status: complaint.status === 'SOLVED' ? 'SOLVED' : 'ANSWERED'
            }
        })
        
        // Send email to user if they have an email
        if (complaint.user.email) {
            const siteSettings = await getSiteSettings()
            const siteName = siteSettings.siteName
            
            const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Şikayetinize Yanıt Geldi</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">Şikayetinize Yanıt Geldi</h1>
                    </div>
                    <div style="padding: 30px; background: #f9f9f9; border: 1px solid #eee;">
                        <h2 style="color: #333;">Merhaba ${complaint.user.name},</h2>
                        <p><strong>${complaint.company.name}</strong> markası, "${complaint.title}" başlıklı şikayetinize yanıt verdi:</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
                            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                        </div>
                        
                        <p>Yanıtı görmek ve detayları görüntülemek için aşağıdaki bağlantıya tıklayın:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/complaints/${complaint.id}" 
                               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                Şikayeti Görüntüle
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; color: #666;">
                            Teşekkür ederiz,<br>
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
            
            await sendEmail(
                complaint.user.email,
                `[${siteName}] ${complaint.company.name} Şikayetinize Yanıt Verdi`,
                emailHtml
            )
        }
        
        return NextResponse.json({ success: true, response })
    } catch (error) {
        console.error('Response error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}