import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { isAdmin } from '@/lib/auth-utils'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    
    // Check if user is admin
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const offset = (page - 1) * limit

    // Build where clause for search
    // SQLite doesn't support mode: 'insensitive', so we use contains (case-sensitive)
    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    }

    const companies = await prisma.company.findMany({
      where,
      include: {
        _count: {
          select: { complaints: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    })

    const total = await prisma.company.count({ where })

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

export async function POST(request: Request) {
  try {
    const session = await getSession()
    
    // Check if user is admin
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, sectorId } = body

    // Validate input
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Şirket adı gereklidir' }, { status: 400 })
    }

    if (!sectorId) {
      return NextResponse.json({ error: 'Sektör seçilmelidir' }, { status: 400 })
    }

    const parsedSectorId = parseInt(sectorId)
    if (isNaN(parsedSectorId)) {
      return NextResponse.json({ error: 'Geçersiz sektör ID' }, { status: 400 })
    }

    // Check if sector exists
    const sector = await prisma.sector.findUnique({
      where: { id: parsedSectorId }
    })

    if (!sector) {
      return NextResponse.json({ error: 'Seçilen sektör bulunamadı' }, { status: 404 })
    }

    // Check if company already exists (case insensitive)
    // SQLite doesn't support mode: 'insensitive', so we fetch all and filter
    // For better performance, we limit the check to first 1000 companies
    const allCompanies = await prisma.company.findMany({
      select: { name: true },
      take: 1000 // Reasonable limit for performance
    })
    
    const trimmedName = name.trim()
    const existingCompany = allCompanies.find(
      company => company.name.toLowerCase() === trimmedName.toLowerCase()
    )

    if (existingCompany) {
      return NextResponse.json({ 
        error: `"${existingCompany.name}" isimli bir şirket zaten mevcut. Lütfen farklı bir isim kullanın.` 
      }, { status: 409 })
    }

    // Generate slug from name
    let slug = name.trim().toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Ensure slug is not empty
    if (!slug) {
      slug = `company-${Date.now()}`
    }

    // Check if slug exists
    const existingSlug = await prisma.company.findUnique({
      where: { slug }
    })

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        slug,
        sectorId: parsedSectorId,
        isApproved: true // Admin tarafından oluşturulan şirketler otomatik onaylı
      },
      include: {
        sector: true,
        _count: {
          select: { complaints: true }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      company 
    }, { status: 201 })
  } catch (error: any) {
    console.error('Company creation error:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta
    })
    return NextResponse.json(
      { error: error?.message || 'Şirket oluşturulamadı', details: process.env.NODE_ENV === 'development' ? error?.message : undefined }, 
      { status: 500 }
    )
  }
}