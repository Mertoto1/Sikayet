import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { isAdmin } from '@/lib/auth-utils'

export async function PUT(req: Request) {
  try {
    const session = await getSession()
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, status } = await req.json()

    const request = await prisma.companyVerificationRequest.findUnique({
      where: { id }
    })

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (status === 'APPROVE') {
      // Update User and Request
      await prisma.$transaction([
        prisma.companyVerificationRequest.update({
          where: { id },
          data: { status: 'APPROVED' }
        }),
        prisma.user.update({
          where: { id: request.userId },
          data: {
            role: 'COMPANY',
            companyId: request.companyId
          }
        }),
        prisma.company.update({
          where: { id: request.companyId },
          data: { isApproved: true }
        })
      ])

      // TODO: Send email notification to user
    } else if (status === 'REJECT') {
      await prisma.companyVerificationRequest.update({
        where: { id },
        data: { status: 'REJECTED' }
      })
      // TODO: Send email
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}