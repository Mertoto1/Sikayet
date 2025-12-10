import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { generateVerificationCode, sendVerificationEmail, saveVerificationCode } from '@/lib/verification'
import { isEmailVerificationEnabled } from '@/lib/settings'

const companyRegisterSchema = z.object({
    fullName: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi girin'),
    phone: z.string().min(10, 'Telefon numarası zorunludur ve en az 10 karakter olmalıdır'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
    companyName: z.string().optional(),
    companyId: z.number().optional(),
    position: z.string().min(2, 'Pozisyon en az 2 karakter olmalıdır')
}).refine((data) => {
    // Either companyName or companyId must be provided
    return (data.companyName && data.companyName.length > 0) || (data.companyId && data.companyId > 0)
}, {
    message: 'Şirket adı veya mevcut bir şirket seçilmelidir',
    path: ['companyName']
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const data = companyRegisterSchema.parse(body)

        // Check if email already exists
        const existingUserByEmail = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if (existingUserByEmail) {
            return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanımda' }, { status: 409 })
        }

        // Check if phone already exists
        const existingUserByPhone = await prisma.user.findFirst({
            where: { phone: data.phone }
        })

        if (existingUserByPhone) {
            return NextResponse.json({ error: 'Bu telefon numarasıyla zaten bir hesap var' }, { status: 409 })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10)

        let companyId = data.companyId

        // If creating a new company
        if (data.companyName && !data.companyId) {
            // Simple slugify
            let slug = data.companyName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
            
            // Check existing
            const existing = await prisma.company.findUnique({ where: { slug } })
            if (existing) {
                slug = `${slug}-${Date.now()}`
            }

            const company = await prisma.company.create({
                data: {
                    name: data.companyName,
                    slug,
                    isApproved: false // Will be approved by admin
                }
            })
            
            companyId = company.id
        }

        // Create user with pending company role
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.fullName, // Store full name in the name field
                role: 'COMPANY_PENDING', // Pending approval
                companyId: companyId,
                verificationRequests: {
                    create: {
                        companyId: companyId!,
                        fullName: data.fullName,
                        email: data.email,
                        phone: data.phone,
                        title: data.position,
                        status: 'PENDING'
                    }
                }
            }
        })

        // Check if email verification is enabled
        const emailVerificationEnabled = await isEmailVerificationEnabled()
        
        let requiresVerification = false

        if (emailVerificationEnabled) {
            // Generate and save verification code
            const verificationCode = generateVerificationCode()
            await saveVerificationCode(user.id, verificationCode)

            // Send verification email
            const emailSent = await sendVerificationEmail(data.email, verificationCode, data.fullName)
            
            if (emailSent) {
                console.log(`Verification email sent successfully for company user ${user.id} (${data.email})`)
            } else {
                console.error(`Failed to send verification email for company user ${user.id} (${data.email})`)
            }
            requiresVerification = true
        } else {
            // Email verification disabled - mark user as verified (email verified, but still pending company approval)
            console.log(`[COMPANY-REGISTER] Email verification is disabled - marking user ${user.id} email as verified`)
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: new Date()
                    // Note: isVerified is not set to true because company users still need admin approval
                }
            })
        }

        return NextResponse.json({ 
            success: true, 
            requiresVerification,
            message: requiresVerification 
                ? 'Doğrulama kodu e-posta adresinize gönderildi'
                : 'Kayıt başarılı! Hesabınız admin onayı bekliyor.',
            userId: user.id
        })
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            const firstError = error.issues[0]
            return NextResponse.json({ error: firstError.message }, { status: 400 })
        }
        
        console.error('Company registration error:', error)
        return NextResponse.json({ error: 'Kayıt sırasında bir hata oluştu' }, { status: 500 })
    }
}