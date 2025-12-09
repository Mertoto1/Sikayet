import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { type NextRequest } from 'next/server'
import { isSessionWithRole } from '@/lib/auth-utils'
import { getSiteSettings } from '@/lib/settings'

export async function POST(request: NextRequest, context: { params: Promise<{}> }) {
    const params = await context.params;
    const { id } = params as { id: string };
    const session = await getSession()
    
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if session has userId property
    if (!isSessionWithRole(session) || !session.userId) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { rating, message } = body
        
        // Validate rating
        const ratingNum = parseInt(rating)
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
        }
        
        // Get complaint with company info
        const complaint = await prisma.complaint.findUnique({
            where: { id },
            include: {
                company: true,
                user: true
            }
        })
        
        if (!complaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
        }
        
        // Check if user is the owner of the complaint
        if (complaint.userId !== session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        
        // Create or update review
        const review = await prisma.review.upsert({
            where: {
                userId_companyId: {
                    userId: session.userId,
                    companyId: complaint.companyId
                }
            },
            update: {
                rating: ratingNum,
                message
            },
            create: {
                userId: session.userId,
                companyId: complaint.companyId,
                rating: ratingNum,
                message
            }
        })
        
        // Send email to company representative if they have an email
        // First, find users who belong to the company
        const companyUsers = await prisma.user.findMany({
            where: {
                companyId: complaint.companyId,
                role: 'COMPANY'
            },
            select: {
                email: true
            }
        })
        
        // Send email to each company user
        const siteSettings = await getSiteSettings()
        const siteName = siteSettings.siteName
        
        for (const companyUser of companyUsers) {
            if (companyUser.email) {
                const emailHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Yeni Yorum Geldi</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="color: white; margin: 0;">Yeni Yorum Geldi</h1>
                        </div>
                        <div style="padding: 30px; background: #f9f9f9; border: 1px solid #eee;">
                            <h2 style="color: #333;">Merhaba,</h2>
                            <p><strong>${complaint.user.name}</strong>, "${complaint.company.name}" markasına yeni bir yorum yaptı:</p>
                            
                            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
                                <div style="margin-bottom: 15px;">
                                    <span style="font-weight: bold;">Puan:</span>
                                    ${'★'.repeat(ratingNum)}${'☆'.repeat(5-ratingNum)} (${ratingNum}/5)
                                </div>
                                <p style="margin: 0; white-space: pre-wrap;">${message || 'Yorum yapılmadı'}</p>
                            </div>
                            
                            <p>Yorumu görmek ve detayları görüntülemek için aşağıdaki bağlantıya tıklayın:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/companies/${complaint.company.slug}" 
                                   style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                    Marka Profiline Git
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
                    companyUser.email,
                    `[${siteName}] ${complaint.user.name} tarafından yeni yorum yapıldı`,
                    emailHtml
                )
            }
        }
        
        return NextResponse.json({ success: true, review })
    } catch (error) {
        console.error('Review error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}