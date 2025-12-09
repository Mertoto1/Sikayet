import { prisma } from '@/lib/db'
import Link from 'next/link'

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default async function ComplaintsPage({ searchParams }: { searchParams: Promise<{ status?: string, page?: string, companyId?: string }> }) {
    const { status, page, companyId } = (await searchParams) || {}
    const currentStatus = status || 'PUBLISHED'
    const currentPage = parseInt(page || '1')
    const pageSize = 12

    // Build where clause based on status filter
    // PUBLISHED filter shows all published complaints including solved ones (they remain published)
    const whereClause: any = {
        status: currentStatus === 'ALL' 
            ? { in: ['PUBLISHED', 'SOLVED', 'ANSWERED'] }
            : currentStatus === 'SOLVED'
            ? { in: ['SOLVED', 'ANSWERED'] }
            : currentStatus === 'PUBLISHED'
            ? { in: ['PUBLISHED', 'SOLVED', 'ANSWERED'] } // Show all published complaints including solved ones
            : { in: ['PUBLISHED', 'SOLVED', 'ANSWERED'] }
    }

    // Filter by company if provided
    if (companyId) {
        whereClause.companyId = parseInt(companyId as string)
    }

    // Fetch complaints with pagination
    const complaints = await prisma.complaint.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: { 
            user: { select: { name: true, surname: true, avatar: true } },
            company: { select: { name: true, slug: true, logoUrl: true } },
            responses: true,
            images: {
                take: 3,
                orderBy: { id: 'asc' }
            },
            _count: {
                select: { responses: true }
            }
        },
        take: pageSize,
        skip: (currentPage - 1) * pageSize
    })

    // Get counts for statistics - Always show total counts regardless of filter
    const baseWhere: any = {}
    if (companyId) {
        baseWhere.companyId = parseInt(companyId as string)
    }
    
    const totalCount = await prisma.complaint.count({ 
        where: {
            ...baseWhere,
            status: { in: ['PUBLISHED', 'SOLVED', 'ANSWERED'] }
        }
    })
    const solvedCount = await prisma.complaint.count({
        where: { 
            ...baseWhere,
            status: { in: ['SOLVED', 'ANSWERED'] }
        }
    })
    const publishedCount = await prisma.complaint.count({
        where: { 
            ...baseWhere,
            status: { in: ['PUBLISHED', 'SOLVED', 'ANSWERED'] } // Count all published complaints including solved ones
        }
    })
    
    // Get filtered count for pagination
    const filteredCount = await prisma.complaint.count({ where: whereClause })

    const totalPages = Math.ceil(filteredCount / pageSize)

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SOLVED':
            case 'ANSWERED':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Çözüldü
                    </span>
                )
            case 'PUBLISHED':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Yayında
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Beklemede
                    </span>
                )
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 pb-8 overflow-x-hidden">
            {/* Header Section - Combined with Filters */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl relative z-10">
                <div className="container px-4 pt-24 md:pt-32 lg:pt-40 pb-6 max-w-full">
                    <div className="max-w-6xl mx-auto w-full">
                        <div className="text-center mb-6 md:mb-10">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 md:mb-4 px-2">Tüm Şikayetler</h1>
                            <p className="text-indigo-100 text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-2">
                                Kullanıcıların markalar hakkındaki şikayetlerini görüntüleyin ve çözüm süreçlerini takip edin
                            </p>
                        </div>

                        {/* Stats Cards - Modern Design */}
                        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mt-6 md:mt-10 mb-6 md:mb-8 px-2">
                            <div className="group relative bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl sm:rounded-3xl px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-center w-[calc(33.333%-0.5rem)] sm:w-auto sm:min-w-[140px] md:min-w-[160px] shadow-lg hover:bg-white/20 hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative">
                                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-1 sm:mb-2">{totalCount}</div>
                                    <div className="text-[10px] sm:text-xs md:text-sm text-indigo-100 font-medium leading-tight">Toplam Şikayet</div>
                                </div>
                            </div>
                            <div className="group relative bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl sm:rounded-3xl px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-center w-[calc(33.333%-0.5rem)] sm:w-auto sm:min-w-[140px] md:min-w-[160px] shadow-lg hover:bg-white/20 hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative">
                                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-1 sm:mb-2">{solvedCount}</div>
                                    <div className="text-[10px] sm:text-xs md:text-sm text-indigo-100 font-medium leading-tight">Çözülen</div>
                                </div>
                            </div>
                            <div className="group relative bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl sm:rounded-3xl px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-center w-[calc(33.333%-0.5rem)] sm:w-auto sm:min-w-[140px] md:min-w-[160px] shadow-lg hover:bg-white/20 hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative">
                                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-1 sm:mb-2">{publishedCount}</div>
                                    <div className="text-[10px] sm:text-xs md:text-sm text-indigo-100 font-medium leading-tight">Yayında</div>
                                </div>
                            </div>
                        </div>

                        {/* Filters Bar - Inside header */}
                        <div className="pt-4 pb-4 px-2">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 lg:gap-6">
                                {/* Filter Tabs */}
                                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start">
                                    <Link 
                                        href="/complaints?status=ALL"
                                        className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                                            currentStatus === 'ALL' 
                                                ? 'bg-white text-indigo-600 shadow-lg scale-105 font-bold' 
                                                : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
                                        }`}
                                    >
                                        Tümü ({totalCount})
                                    </Link>
                                    <Link 
                                        href="/complaints?status=PUBLISHED"
                                        className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                                            currentStatus === 'PUBLISHED' 
                                                ? 'bg-white text-blue-600 shadow-lg scale-105 font-bold' 
                                                : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
                                        }`}
                                    >
                                        Yayında ({publishedCount})
                                    </Link>
                                    <Link 
                                        href="/complaints?status=SOLVED"
                                        className={`px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                                            currentStatus === 'SOLVED' 
                                                ? 'bg-white text-green-600 shadow-lg scale-105 font-bold' 
                                                : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
                                        }`}
                                    >
                                        Çözülen ({solvedCount})
                                    </Link>
                                </div>
                                
                                {/* View Options */}
                                <div className="flex items-center gap-2 sm:gap-3 justify-center md:justify-end">
                                    <div className="text-xs sm:text-sm text-white bg-white/20 backdrop-blur-sm border border-white/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium whitespace-nowrap">
                                        Sayfa {currentPage} / {totalPages || 1}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacer */}
            <div className="h-8 w-full bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30"></div>

            {/* Complaints List */}
            <div className="container px-4 pb-20 max-w-full">
                <div className="max-w-6xl mx-auto w-full">
                    {complaints.length > 0 ? (
                        <>
                            <div className="space-y-6">
                                {complaints.map((complaint: any) => (
                                    <div key={complaint.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 overflow-hidden group">
                                        <div className="p-6">
                                            <div className="flex gap-5">
                                                {/* User Avatar */}
                                                <div className="flex-shrink-0">
                                                    {complaint.user.avatar ? (
                                                        <img 
                                                            src={complaint.user.avatar} 
                                                            alt={`${complaint.user.name} ${complaint.user.surname || ''}`}
                                                            className="w-14 h-14 rounded-2xl object-cover border-2 border-gray-100 shadow-sm group-hover:scale-105 transition-transform"
                                                        />
                                                    ) : (
                                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-sm group-hover:scale-105 transition-transform">
                                                            {complaint.user.name ? complaint.user.name.charAt(0).toUpperCase() : 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between gap-3 mb-3">
                                                        <div className="flex-1 min-w-0">
                                                            <Link 
                                                                href={`/complaints/${complaint.id}`} 
                                                                className="font-bold text-gray-900 hover:text-indigo-600 transition text-xl leading-tight block mb-2"
                                                            >
                                                                {complaint.title}
                                                            </Link>
                                                            
                                                            {/* Company info */}
                                                            <div className="flex items-center gap-2 mb-2">
                                                                {complaint.company.logoUrl ? (
                                                                    <img 
                                                                        src={complaint.company.logoUrl} 
                                                                        alt={complaint.company.name}
                                                                        className="w-6 h-6 rounded-lg object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center">
                                                                        <span className="text-xs font-bold text-gray-600">{complaint.company.name.charAt(0)}</span>
                                                                    </div>
                                                                )}
                                                                <Link 
                                                                    href={`/companies/${complaint.company.slug}`}
                                                                    className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition"
                                                                >
                                                                    {complaint.company.name}
                                                                </Link>
                                                            </div>
                                                            
                                                            {/* User info and date */}
                                                            <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                                                                <span className="font-medium">
                                                                    {complaint.user.name} {complaint.user.surname || ''}
                                                                </span>
                                                                <span className="text-gray-400">•</span>
                                                                <span>{formatDate(complaint.createdAt)}</span>
                                                            </div>
                                                            
                                                            {/* Status Badge */}
                                                            <div className="inline-block mb-3">
                                                                {getStatusBadge(complaint.status)}
                                                            </div>
                                                            
                                                            {/* Images Preview */}
                                                            {complaint.images && complaint.images.length > 0 && (
                                                                <div className="flex gap-3 mt-4">
                                                                    {complaint.images.slice(0, 3).map((image: any, index: number) => (
                                                                        <div key={image.id} className="group/image relative">
                                                                            <img 
                                                                                src={image.url} 
                                                                                alt={`Şikayet görseli ${index + 1}`}
                                                                                className="w-24 h-24 rounded-2xl object-cover border border-gray-200 transition shadow-sm"
                                                                            />
                                                                            <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 rounded-2xl transition-colors cursor-pointer" />
                                                                        </div>
                                                                    ))}
                                                                    {complaint.images.length > 3 && (
                                                                        <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-gray-500 shadow-sm cursor-pointer hover:bg-gray-100 transition">
                                                                            <span className="text-lg font-bold">+{complaint.images.length - 3}</span>
                                                                            <span className="text-xs">Fotoğraf</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Footer */}
                                                    <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-4">
                                                        <div className="flex items-center gap-6 text-sm text-gray-500">
                                                            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                                <span className="font-medium">{complaint.viewCount || 0}</span>
                                                                <span className="text-gray-400">görüntülenme</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                                </svg>
                                                                <span className="font-medium">{complaint._count.responses || 0}</span>
                                                                <span className="text-gray-400">yanıt</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <Link 
                                                            href={`/complaints/${complaint.id}`}
                                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-sm font-medium"
                                                        >
                                                            <span>Detaya Git</span>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                            </svg>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-12 flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                                        <span>Toplam {filteredCount} şikayet</span>
                                        <span className="text-gray-300">•</span>
                                        <span>Sayfa {currentPage} / {totalPages}</span>
                                    </div>
                                    
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {currentPage > 1 && (
                                            <Link
                                                href={`/complaints?status=${currentStatus}&page=${currentPage - 1}${companyId ? `&companyId=${companyId}` : ''}`}
                                                className="w-11 h-11 flex items-center justify-center rounded-xl bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 transition-all shadow-sm hover:shadow-md"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </Link>
                                        )}
                                        
                                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 7) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 4) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 3) {
                                                pageNum = totalPages - 6 + i;
                                            } else {
                                                pageNum = currentPage - 3 + i;
                                            }
                                            
                                            return (
                                                <Link
                                                    key={pageNum}
                                                    href={`/complaints?status=${currentStatus}&page=${pageNum}${companyId ? `&companyId=${companyId}` : ''}`}
                                                    className={`w-11 h-11 flex items-center justify-center rounded-xl font-bold transition-all shadow-sm ${
                                                        pageNum === currentPage
                                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-110'
                                                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-indigo-300'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </Link>
                                            );
                                        })}
                                        
                                        {currentPage < totalPages && (
                                            <Link
                                                href={`/complaints?status=${currentStatus}&page=${currentPage + 1}${companyId ? `&companyId=${companyId}` : ''}`}
                                                className="w-11 h-11 flex items-center justify-center rounded-xl bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 transition-all shadow-sm hover:shadow-md"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
                            <div className="w-28 h-28 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <svg className="w-14 h-14 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-3">
                                {currentStatus === 'SOLVED' 
                                    ? 'Henüz Çözülen Şikayet Yok' 
                                    : currentStatus === 'PUBLISHED'
                                    ? 'Henüz Yayında Şikayet Yok'
                                    : 'Henüz Şikayet Yok'}
                            </h3>
                            <p className="text-gray-500 mb-8 max-w-lg mx-auto text-lg">
                                {currentStatus === 'SOLVED' 
                                    ? 'Henüz çözülen bir şikayet bulunmuyor.' 
                                    : currentStatus === 'PUBLISHED'
                                    ? 'Henüz yayında bir şikayet bulunmuyor.'
                                    : 'Bu filtreleme kriterlerine uygun herhangi bir şikayet bulunmuyor.'}
                            </p>
                            <Link 
                                href="/"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all font-bold shadow-lg shadow-indigo-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Ana Sayfaya Dön
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
