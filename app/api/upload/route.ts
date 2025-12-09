import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { uploadToStorage } from '@/lib/storage'

export async function POST(request: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // Convert File to Buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Local Storage
        const url = await uploadToStorage(buffer, file.name, file.type)

        return NextResponse.json({ success: true, url })
    } catch (error) {
        console.error('Upload Error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
