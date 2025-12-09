import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { isAdmin } from '@/lib/auth-utils'

export async function GET() {
  try {
    const session = await getSession()
    
    // Check if user is admin
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sectors = await prisma.sector.findMany({
      orderBy: {
        id: 'asc'
      },
      include: {
        _count: {
          select: {
            companies: true
          }
        }
      }
    })

    return NextResponse.json({ sectors })
  } catch (error) {
    console.error('Sectors fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sectors' }, 
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
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: 'Sector name is required' }, { status: 400 })
    }

    const sector = await prisma.sector.create({
      data: {
        name
      },
      include: {
        _count: {
          select: {
            companies: true
          }
        }
      }
    })

    return NextResponse.json({ sector })
  } catch (error) {
    console.error('Sector creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create sector' }, 
      { status: 500 }
    )
  }
}