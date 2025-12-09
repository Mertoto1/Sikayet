import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '10000')

    // Build where clause for approved companies only
    const where: any = {
      isApproved: true
    }

    // SQLite doesn't support mode: 'insensitive', filter after fetch
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    }

    let companies = await prisma.company.findMany({
      where,
      include: {
        sector: {
          select: { name: true }
        },
        _count: {
          select: { complaints: true }
        }
      },
      orderBy: {
        name: 'asc'
      },
      take: limit * 2 // Fetch more to account for case-sensitive filtering
    })

    // Case-insensitive filter in JavaScript (SQLite limitation)
    if (search) {
      const searchLower = search.toLowerCase()
      companies = companies.filter(company => 
        company.name.toLowerCase().includes(searchLower) ||
        (company.description && company.description.toLowerCase().includes(searchLower))
      ).slice(0, limit)
    } else {
      companies = companies.slice(0, limit)
    }

    return NextResponse.json({
      companies
    })
  } catch (error) {
    console.error('Public companies fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' }, 
      { status: 500 }
    )
  }
}
