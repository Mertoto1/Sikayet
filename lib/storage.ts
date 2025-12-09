import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

export async function uploadToStorage(fileBuffer: Buffer, fileName: string, contentType: string): Promise<string> {
    // Use Local Storage (public/uploads) to avoid AWS costs
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Optimize image if it's an image
    let finalBuffer = fileBuffer
    if (contentType.startsWith('image/')) {
        try {
            // Resize and compress image
            finalBuffer = await sharp(fileBuffer)
                .resize({
                    width: 1200,
                    height: 1200,
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
                .toBuffer()
        } catch (error) {
            console.error('Image optimization failed:', error)
            // Use original buffer if optimization fails
            finalBuffer = fileBuffer
        }
    }

    // Create unique filename
    const ext = path.extname(fileName)
    const uniqueName = `${uuidv4()}${ext}`
    const filePath = path.join(uploadDir, uniqueName)

    // Write file
    fs.writeFileSync(filePath, finalBuffer)

    // Return public URL (Relative path)
    return `/uploads/${uniqueName}`
}
