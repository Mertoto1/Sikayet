import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { isCompany } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import CompanyEditClient from './CompanyEditClient'

export default async function EditCompanyPage() {
    const session = await getSession()
    if (!isCompany(session)) redirect('/login')

    // Check if user is a company representative
    const user = await prisma.user.findUnique({
        where: { id: (typeof session === 'object' && session !== null ? session.userId : null) },
        include: { company: true }
    })

    if (!user || !['COMPANY', 'COMPANY_PENDING'].includes(user.role) || !user.company) {
        notFound()
    }

    // Block access if company is not approved
    const isPendingApproval = user.role === 'COMPANY_PENDING' || !user.company.isApproved
    if (isPendingApproval) {
        redirect('/company')
    }

    const company = user.company

    return (
        <CompanyEditClient 
            company={{
                id: company.id,
                name: company.name,
                logoUrl: company.logoUrl,
                description: company.description
            }}
            user={{
                id: user.id,
                email: user.email,
                avatar: user.avatar,
                name: user.name
            }}
        />
    )
}