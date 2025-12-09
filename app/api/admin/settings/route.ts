import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { isAdmin } from '@/lib/auth-utils'

export async function GET(request: Request) {
    const session = await getSession()
    if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const settings = await prisma.systemSetting.findMany()
    return NextResponse.json({ settings })
}

export async function POST(request: Request) {
    const session = await getSession()
    if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const body = await request.json()
    const { key, value } = body

    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 })

    const setting = await prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
    })

    return NextResponse.json({ success: true, setting })
}