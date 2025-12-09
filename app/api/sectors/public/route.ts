import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const sectors = await prisma.sector.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(sectors)
  } catch (error) {
    console.error('Sectors fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sectors' }, 
      { status: 500 }
    )
  }
}

