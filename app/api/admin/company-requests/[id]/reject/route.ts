import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { isAdmin } from '@/lib/auth-utils'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    
    // Check if user is admin
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const { id } = await params
    const requestId = parseInt(id)
    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'Geçersiz başvuru ID' }, { status: 400 })
    }

    // Update request status to REJECTED
    const updatedRequest = await prisma.companyVerificationRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' }
    })

    return NextResponse.json({
      success: true,
      message: 'Başvuru reddedildi'
    })
  } catch (error) {
    console.error('Reject company request error:', error)
    return NextResponse.json(
      { error: 'İşlem sırasında bir hata oluştu' }, 
      { status: 500 }
    )
  }
}