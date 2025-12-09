import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { isAdmin } from '@/lib/auth-utils'

export async function POST(request: Request) {
    const session = await getSession()
    if (!isAdmin(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const key = formData.get('key') as string

        if (!file || !key) {
            return NextResponse.json({ error: 'Missing file or key' }, { status: 400 })
        }

        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate filename
        const fileExtension = file.name.split('.').pop()
        const fileName = `${key}-${Date.now()}.${fileExtension}`
        const filePath = path.join(uploadDir, fileName)

        // Save file
        await writeFile(filePath, buffer)

        // Return public URL
        const publicUrl = `/uploads/${fileName}`
        return NextResponse.json({ url: publicUrl })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}