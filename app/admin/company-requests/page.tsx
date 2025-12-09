import { prisma } from '@/lib/db'
import AdminCompanyRequestsClient from '@/components/AdminCompanyRequestsClient'
import { redirect } from 'next/navigation'

export default async function CompanyRequestsPage() {
    // Check if user is admin
    // Note: In a real implementation, you would check session here
    // For now, we'll assume this route is protected by middleware
    
    const verificationRequests = await prisma.companyVerificationRequest.findMany({
        where: { status: 'PENDING' },
        include: {
            user: true,
            company: true
        },
        orderBy: { createdAt: 'desc' }
    })

    const companyRequests = await prisma.companyRequest.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Şirket Üyelik Başvuruları</h1>
            </div>

            <AdminCompanyRequestsClient 
                verificationRequests={verificationRequests} 
                companyRequests={companyRequests} 
            />
        </div>
    )
}