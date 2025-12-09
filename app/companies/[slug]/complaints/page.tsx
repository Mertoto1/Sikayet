import { prisma } from '@/lib/db'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const company = await prisma.company.findUnique({ where: { slug } })
    if (!company) return { title: 'Marka Bulunamadı' }

    return {
        title: `${company.name} Şikayetleri | Complaintvar`,
        description: `${company.name} hakkında yazılan tüm şikayetleri okuyun.`,
    }
}

export default async function CompanyComplaintsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    const company = await prisma.company.findUnique({
        where: { slug },
        include: {
            sector: true,
            _count: {
                select: { complaints: true, reviews: true }
            }
        }
    })

    if (!company) notFound()

    // Fetch complaints with stats (published, solved, and answered)
    const complaints = await prisma.complaint.findMany({
        where: { 
            companyId: company.id, 
            status: { in: ['PUBLISHED', 'SOLVED', 'ANSWERED'] }
        },
        orderBy: { createdAt: 'desc' },
        include: { 
            user: { select: { name: true, avatar: true } },
            responses: true,
            images: {
                take: 2,
                orderBy: { id: 'asc' }
            }
        }
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
            {/* Hero Section */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="container px-4 py-8 md:py-12">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
                            {/* Logo */}
                            <div className="relative">
                                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl border-2 border-gray-200 flex items-center justify-center p-4 shadow-lg flex-shrink-0">
                                    {company.logoUrl ? (
                                        <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                            {company.name.substring(0, 2)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{company.name}</h1>
                                    <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full font-semibold">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        {company.sector?.name || 'Genel'}
                                    </span>
                                </div>
                                {company.description && (
                                    <p className="text-gray-600 mb-4 max-w-3xl leading-relaxed">{company.description}</p>
                                )}

                                {/* Stats */}
                                <div className="flex flex-wrap gap-6 mt-4">
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                {company._count.complaints}
                                            </span>
                                            <span className="text-sm text-gray-600">Şikayet</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container px-4 py-8 md:py-12">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {company.name} Hakkındaki Şikayetler
                        </h2>
                    </div>

                    {/* Complaints Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {complaints.map((complaint: any) => (
                            <div key={complaint.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                                {/* Images Preview */}
                                {complaint.images.length > 0 && (
                                    <div className="relative h-48">
                                        <img 
                                            src={complaint.images[0].url} 
                                            alt={complaint.title}
                                            className="w-full h-full object-cover"
                                        />
                                        {complaint.images.length > 1 && (
                                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                +{complaint.images.length - 1}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="p-6">
                                    <Link 
                                        href={`/complaints/${complaint.id}`} 
                                        className="font-bold text-gray-900 hover:text-indigo-600 transition mb-2 block line-clamp-2"
                                    >
                                        {complaint.title}
                                    </Link>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {complaint.content}
                                    </p>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {complaint.user.avatar ? (
                                                <img 
                                                    src={complaint.user.avatar} 
                                                    alt={complaint.user.name}
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    <span className="text-xs font-semibold text-indigo-800">
                                                        {complaint.user.name.charAt(0)}
                                                    </span>
                                                </div>
                                            )}
                                            <span className="text-xs text-gray-500">{complaint.user.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                <span>{complaint.viewCount || 0}</span>
                                            </div>
                                            <Link
                                                href={`/complaints/${complaint.id}#yorum`}
                                                className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 transition"
                                            >
                                                Yorum Yap
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                        <span className="text-xs text-gray-500">
                                            {new Date(complaint.createdAt).toLocaleDateString('tr-TR')}
                                        </span>
                                        <Link 
                                            href={`/complaints/${complaint.id}`}
                                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition"
                                        >
                                            Detaylar
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {complaints.length === 0 && (
                            <div className="col-span-full bg-white rounded-2xl p-12 md:p-16 text-center border-2 border-dashed border-gray-200">
                                <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz şikayet Yok</h3>
                                <p className="text-gray-500 mb-6">Bu marka hakkında henüz hiç şikayet yazılmamış.</p>
                                <Link
                                    href="/complaints/new"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    İlk Şikayeti Siz Yazın
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}