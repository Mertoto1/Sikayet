import { prisma } from '@/lib/db'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CompanyTabs from './CompanyTabs'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const company = await prisma.company.findUnique({ where: { slug } })
    if (!company) return { title: 'Marka Bulunamadı' }

    return {
        title: `${company.name} Şikayetleri ve Yorumları | Complaintvar`,
        description: `${company.name} hakkında yazılan şikayetleri okuyun, marka karnesini inceleyin ve deneyimlerinizi paylaşın.`,
        openGraph: {
            title: `${company.name} Şikayetleri`,
            description: `${company.name} hakkında kullanıcı yorumları ve şikayetler.`,
        }
    }
}

export default async function CompanyProfilePage({ params }: { params: Promise<{ slug: string }> }) {
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

    // Fetch the verification request status
    const verificationRequest = await prisma.companyVerificationRequest.findFirst({
        where: { companyId: company.id },
        orderBy: { createdAt: 'desc' }
    })

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
        },
        take: 20
    })

    // Count only published complaints (for trust score calculation)
    const publishedComplaintsCount = await prisma.complaint.count({
        where: { 
            companyId: company.id, 
            status: { in: ['PUBLISHED', 'SOLVED', 'ANSWERED'] }
        }
    })

    const solvedCount = await prisma.complaint.count({
        where: { companyId: company.id, status: { in: ['SOLVED', 'ANSWERED'] } }
    })

    const averageRatingAgg = await prisma.review.aggregate({
        where: { companyId: company.id },
        _avg: { rating: true }
    })

    const { calculateCompanyScore } = await import('@/lib/scoring')
    const trustScore = calculateCompanyScore({
        totalComplaints: publishedComplaintsCount, // Use only published complaints
        solvedCount,
        reviewCount: company._count.reviews,
        averageRating: averageRatingAgg._avg.rating,
        isVerified: company.isApproved || false
    })

    const responseRate = publishedComplaintsCount > 0
        ? Math.round((solvedCount / publishedComplaintsCount) * 100)
        : 0

    // Determine the verification status badge
    const getVerificationBadge = () => {
        if (company.isApproved) {
            return (
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Onaylandı
                </span>
            )
        }
        
        if (verificationRequest) {
            if (verificationRequest.status === 'PENDING') {
                return (
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Beklemede
                    </span>
                )
            } else if (verificationRequest.status === 'REJECTED') {
                return (
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reddedildi
                    </span>
                )
            }
        }
        
        // If no verification request exists, show as unverified
        return (
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Onaysız
            </span>
        )
    }

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
                                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg" title="Güven Skoru">
                                    <div className={`w-full h-full rounded-full flex items-center justify-center text-xs font-bold text-white ${trustScore >= 80 ? 'bg-green-500' :
                                            trustScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}>
                                        {trustScore}
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{company.name}</h1>
                                    {getVerificationBadge()}
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
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                {solvedCount}
                                            </span>
                                            <span className="text-sm text-gray-600">Çözülen</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                                {responseRate}%
                                            </span>
                                            <span className="text-sm text-gray-600">Çözüm Oranı</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="w-full md:w-auto">
                                <Link
                                    href="/complaints/new"
                                    className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Şikayet Yaz
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Tabbed Content */}
            <CompanyTabs
                complaintsCount={company._count.complaints}
                company={{
                    name: company.name,
                    description: company.description,
                    sector: company.sector,
                    logoUrl: company.logoUrl,
                    createdAt: company.createdAt
                }}
                stats={{
                    totalComplaints: company._count.complaints,
                    solvedCount,
                    responseRate,
                    trustScore,
                    averageRating: averageRatingAgg._avg.rating,
                    reviewCount: company._count.reviews
                }}
                complaints={
                    <>
                        {/* Company Response Section */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Firma Yanıtı Yaz</h3>
                            <p className="text-gray-600 mb-4">Bu firma hakkında yanıtınızı paylaşın.</p>
                            <Link
                                href="/complaints/new"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Yanıt Yaz
                            </Link>
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {company.name} Hakkındaki Şikayetler
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                </svg>
                                En Yeni
                            </div>
                        </div>

                        {/* Complaints Grid - Professional Cards */}
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {complaints.slice(0, 5).map((complaint: any) => {
                            // Truncate content to ~40 words
                            const words = complaint.content.split(' ')
                            const truncatedContent = words.length > 40 
                                ? words.slice(0, 40).join(' ') + '...' 
                                : complaint.content
                            
                            const hasImage = complaint.images && complaint.images.length > 0
                            
                            return (
                                <Link 
                                    key={complaint.id} 
                                    href={`/complaints/${complaint.id}`}
                                    className="block bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 overflow-hidden group"
                                >
                                    <div className="flex flex-col md:flex-row">
                                        {/* Image Section */}
                                        {hasImage && (
                                            <div className="md:w-48 w-full h-48 md:h-auto flex-shrink-0 bg-gray-100 overflow-hidden">
                                                <img 
                                                    src={complaint.images[0].url} 
                                                    alt={complaint.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                />
                                            </div>
                                        )}
                                        
                                        {/* Content Section */}
                                        <div className={`flex-1 p-5 ${hasImage ? '' : 'p-6'}`}>
                                            <div className="flex items-start gap-4">
                                                {/* User Avatar */}
                                                <div className="flex-shrink-0">
                                                    {complaint.user.avatar ? (
                                                        <img 
                                                            src={complaint.user.avatar} 
                                                            alt={complaint.user.name}
                                                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-sm">
                                                            <span className="text-sm font-bold text-white">
                                                                {complaint.user.name?.charAt(0) || 'U'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Text Content */}
                                                <div className="flex-1 min-w-0">
                                                    {/* Title */}
                                                    <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                        {complaint.title}
                                                    </h3>
                                                    
                                                    {/* Content Preview */}
                                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                                                        {truncatedContent}
                                                    </p>
                                                    
                                                    {/* Footer Info */}
                                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                                            <span className="font-medium text-gray-700">{complaint.user.name}</span>
                                                            <span>•</span>
                                                            <span>{new Date(complaint.createdAt).toLocaleDateString('tr-TR', { 
                                                                day: 'numeric', 
                                                                month: 'long', 
                                                                year: 'numeric' 
                                                            })}</span>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-4">
                                                            {/* View Count */}
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                                <span>{complaint.viewCount || 0}</span>
                                                            </div>
                                                            
                                                            {/* Status Badge */}
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                                complaint.status === 'SOLVED' || complaint.status === 'ANSWERED'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                                {complaint.status === 'SOLVED' || complaint.status === 'ANSWERED' ? 'Çözüldü' : 'Yayında'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                        
                        {complaints.length > 5 && (
                            <div className="p-4 text-center bg-white rounded-xl border border-gray-200">
                                <Link 
                                    href={`/${company.slug}/complaints`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                >
                                    Tümünü Gör
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        )}
                        
                        {complaints.length === 0 && (
                            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Henüz şikayet Yok</h3>
                                <p className="text-gray-500 text-sm">Bu marka hakkında henüz hiç şikayet yazılmamış.</p>
                            </div>
                        )}
                        </div>
                    </>
                }
            />
        </div>
    )
}                   