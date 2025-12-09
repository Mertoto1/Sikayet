import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request, { params }: { params: any }) {
    const { slug } = await params

    const company = await prisma.company.findUnique({
        where: { slug },
        include: {
            sector: true
        }
    })

    if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json({ company })
}
