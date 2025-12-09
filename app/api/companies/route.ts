import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const sector = searchParams.get('sector') || ''
    const offset = (page - 1) * limit

    // Build where clause
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

    if (sector) {
      where.sectorId = parseInt(sector)
    }

    let companies = await prisma.company.findMany({
      where,
      include: {
        sector: true,
        _count: {
          select: { complaints: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
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

    // Count is approximate for search (SQLite limitation)
    const total = search 
      ? companies.length // Approximate count for filtered results
      : await prisma.company.count({ where })

    return NextResponse.json({
      companies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    })
  } catch (error) {
    console.error('Companies fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' }, 
      { status: 500 }
    )
  }
}