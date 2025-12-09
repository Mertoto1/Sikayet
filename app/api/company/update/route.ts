import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { z } from 'zod'
import { uploadToStorage } from '@/lib/storage'
import { isSessionWithRole, isCompany } from '@/lib/auth-utils'

const updateSchema = z.object({
    logoUrl: z.string().url().optional().or(z.literal('')),
    description: z.string().min(10).optional().or(z.literal('')),
})

export async function PUT(req: Request) {
    try {
        const session = await getSession()
        if (!isCompany(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if session has userId property
        if (!isSessionWithRole(session) || !session.userId) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
        }

        const body = await req.json()
        const { companyId, ...updateData } = body;
        
        // Verify user has permission to update this company
        const user = await prisma.user.findUnique({ where: { id: session.userId } })
        if (!user || user.companyId !== companyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // For PUT requests, logoUrl should be a string URL
        const data = updateSchema.parse(updateData)

        await prisma.company.update({
            where: { id: companyId },
            data: {
                ...(data.logoUrl ? { logoUrl: data.logoUrl } : {}),
                ...(data.description ? { description: data.description } : {})
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession()
        if (!isCompany(session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if session has userId property
        if (!isSessionWithRole(session) || !session.userId) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
        }

        const formData = await req.formData()
        const companyId = parseInt(formData.get('companyId') as string)
        const logoFile = formData.get('logoUpload') as File || null
        const avatarFile = formData.get('avatarUpload') as File || null
        const description = formData.get('description') as string || ''

        // Verify user has permission to update this company
        const user = await prisma.user.findUnique({ where: { id: session.userId } })
        if (!user || user.companyId !== companyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Handle logo upload
        let logoUrl = ''
        if (logoFile && logoFile.size > 0) {
            // Convert File to Buffer
            const bytes = await logoFile.arrayBuffer()
            const buffer = Buffer.from(bytes)
            
            // Upload to Local Storage
            logoUrl = await uploadToStorage(buffer, logoFile.name, logoFile.type)
        }

        // Handle avatar upload
        let avatarUrl = ''
        if (avatarFile && avatarFile.size > 0) {
            // Convert File to Buffer
            const bytes = await avatarFile.arrayBuffer()
            const buffer = Buffer.from(bytes)
            
            // Upload to Local Storage
            avatarUrl = await uploadToStorage(buffer, avatarFile.name, avatarFile.type)
        }

        // Validate data
        const companyData: any = {}
        
        if (logoUrl && logoUrl.trim() !== '') {
            companyData.logoUrl = logoUrl
        }
        
        if (description && description.trim() !== '' && description.length >= 10) {
            companyData.description = description
        }

        // Update company
        if (Object.keys(companyData).length > 0) {
            await prisma.company.update({
                where: { id: companyId },
                data: companyData
            })
        }

        // Update user avatar if provided
        if (avatarUrl && avatarUrl.trim() !== '') {
            await prisma.user.update({
                where: { id: session.userId },
                data: { avatar: avatarUrl }
            })
        }

        // Return JSON response instead of redirect for client-side handling
        return NextResponse.json({ 
            success: true,
            message: 'Güncelleme başarılı',
            logoUrl: logoUrl || companyData.logoUrl,
            avatarUrl: avatarUrl
        })
    } catch (error: any) {
        console.error('Update Error:', error)
        if (error.message?.includes('Body exceeded') || error.statusCode === 413) {
            return NextResponse.json({ 
                error: 'Dosya boyutu çok büyük. Lütfen 5MB\'dan küçük bir dosya seçin.' 
            }, { status: 413 })
        }
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}