import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { isAdmin } from '@/lib/auth-utils'

export async function GET(request: Request) {
    const session = await getSession()
    if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const sectorId = searchParams.get('sectorId')
    const userType = searchParams.get('userType')

    const whereClause: any = {}

    // Filter users who have at least one complaint in the given sector
    if (sectorId) {
        whereClause.complaints = {
            some: {
                company: {
                    sectorId: parseInt(sectorId)
                }
            }
        }
    }
    
    // Filter by user type
    if (userType && userType !== 'ALL') {
        whereClause.role = userType
    }

    const users = await prisma.user.findMany({
        where: whereClause,
        select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
            twoFactorEnabled: true,
            _count: {
                select: { complaints: true }
            },
            complaints: {
                take: 1, // Get latest complaint for context if needed
                orderBy: { createdAt: 'desc' },
                select: { 
                    company: { 
                        select: { 
                            name: true, 
                            sector: { 
                                select: { 
                                    name: true 
                                } 
                            } 
                        } 
                    } 
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 100 // Limit for performance
    })

    return NextResponse.json({ users })
}