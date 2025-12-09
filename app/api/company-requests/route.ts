import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const companyRequestSchema = z.object({
  companyName: z.string().min(2, 'Şirket adı en az 2 karakter olmalıdır'),
  companySector: z.string().min(2, 'Şirket sektörü en az 2 karakter olmalıdır'),
  companyDescription: z.string().optional(),
  companyLogo: z.string().optional(),
  fullName: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  phone: z.string().optional(),
  message: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    // Handle multipart form data
    const formData = await request.formData()
    
    // Extract data from form data
    const data = {
      companyName: formData.get('companyName') as string,
      companySector: formData.get('companySector') as string,
      companyDescription: formData.get('companyDescription') as string || undefined,
      companyLogo: formData.get('companyLogo') as string || undefined,
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      message: formData.get('message') as string || undefined,
    }

    // Validate data
    const validatedData = companyRequestSchema.parse(data)

    // Check if company already exists (case insensitive)
    const existingCompanies = await prisma.company.findMany({
      where: {
        name: {
          contains: validatedData.companyName
        }
      }
    })

    // Check if any existing company matches (case insensitive)
    const existingCompany = existingCompanies.find(
      company => company.name.toLowerCase() === validatedData.companyName.toLowerCase()
    )

    if (existingCompany) {
      return NextResponse.json({ error: 'Bu isimde bir şirket zaten sistemde kayıtlı' }, { status: 400 })
    }

    // Check if request already exists (case insensitive)
    const existingRequests = await prisma.companyRequest.findMany({
      where: {
        status: 'PENDING'
      }
    })

    // Check if any existing request matches (case insensitive)
    const existingRequest = existingRequests.find(
      request => request.companyName.toLowerCase() === validatedData.companyName.toLowerCase()
    )

    if (existingRequest) {
      return NextResponse.json({ error: 'Bu şirket için zaten bekleyen bir talep var' }, { status: 400 })
    }

    // Create company request
    const companyRequest = await prisma.companyRequest.create({
      data: {
        companyName: validatedData.companyName,
        companySector: validatedData.companySector,
        companyDescription: validatedData.companyDescription,
        companyLogo: validatedData.companyLogo,
        fullName: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        message: validatedData.message,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ success: true, companyRequest })
  } catch (error: any) {
    console.error('Company request error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}

// Get all company requests (for admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status) {
      where.status = status
    }

    const companyRequests = await prisma.companyRequest.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ companyRequests })
  } catch (error) {
    console.error('Get company requests error:', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}