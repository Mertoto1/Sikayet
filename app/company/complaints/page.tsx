import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { isCompany } from '@/lib/auth-utils'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import ComplaintResponseWrapper from '@/components/ComplaintResponseWrapper'
import ResponseModal from '@/components/ResponseModal'

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic'

export default async function CompanyComplaintsPage({ searchParams }: { searchParams: Promise<{ status?: string, page?: string }> }) {
    const session = await getSession()
    if (!isCompany(session)) redirect('/login')

    const { status, page } = (await searchParams) || { status: 'ALL', page: '1' }
    const currentStatus = status || 'ALL'
    const currentPage = parseInt(page || '1')
    const pageSize = 10

    // Get user's company
    const user = await prisma.user.findUnique({
        where: { id: (typeof session === 'object' && session !== null ? session.userId : null) },
        include: { 
            company: {
                include: {
                    sector: true,
                    _count: {
                        select: { complaints: true, reviews: true }
                    }
                }
            }
        }
    })

    if (!user?.company) {
        return <div className="container py-20 text-center">Firma kaydınız bulunamadı.</div>
    }

    // Block access if company is not approved
    const isPendingApproval = user.role === 'COMPANY_PENDING' || !user.company.isApproved
    if (isPendingApproval) {
        redirect('/company')
    }

    const company = user.company

    // Build where clause based on status filter
    const whereClause = {
        companyId: company.id,
        status: currentStatus === 'SOLVED' 
            ? { in: ['SOLVED', 'ANSWERED'] } 
            : currentStatus === 'PENDING'
            ? { in: ['PUBLISHED'] }
            : { in: ['PUBLISHED', 'SOLVED', 'ANSWERED'] }
    }

    // Fetch complaints with pagination
    const complaints = await prisma.complaint.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: { 
            user: { select: { name: true, surname: true, avatar: true } },
            responses: true,
            images: {
                take: 3,
                orderBy: { id: 'asc' }
            }
        },
        take: pageSize,
        skip: (currentPage - 1) * pageSize
    })

    // Get counts for statistics
    const totalCount = await prisma.complaint.count({ where: whereClause })
    const solvedCount = await prisma.complaint.count({
        where: { companyId: company.id, status: { in: ['SOLVED', 'ANSWERED'] } }
    })
    const pendingCount = await prisma.complaint.count({
        where: { companyId: company.id, status: 'PUBLISHED' }
    })

    const responseRate = company._count.complaints > 0
        ? Math.round((solvedCount / company._count.complaints) * 100)
        : 0

    const totalPages = Math.ceil(totalCount / pageSize)

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
      <div className="min-h-screen bg-gray-50 pb-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg relative z-10 pt-8 pb-8">

            {/* Container ve padding ayarları */}
            <div className="container px-4 pt-40 pb-16">  {/* pt-40 ile üst boşluk daha da genişletildi */}
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
                    
                    {/* Sol: Breadcrumb ve Başlık */}
                    <div>
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-indigo-100 mb-10">
                            <Link href="/company" className="hover:text-white transition">
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Firma Paneli
                                </span>
                            </Link>
                            <span>/</span>
                            <span className="text-white font-medium">Şikayetler</span>
                        </div>

                        <h1 className="text-3xl lg:text-5xl font-bold mb-4">Tüm Şikayetler</h1>
                        <p className="text-indigo-100 text-lg lg:text-xl font-light">
                            Firmanıza gelen tüm şikayetleri yönetin ve çözümleyin
                        </p>
                    </div>

                    {/* Sağ: Stats kartları */}
                    <div className="flex flex-wrap gap-6 lg:self-center">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-10 py-6 text-center min-w-[150px] shadow-inner hover:bg-white/20 transition-all mb-4">
                            <div className="text-4xl font-bold">{company._count.complaints}</div>
                            <div className="text-sm text-indigo-100 mt-2">Toplam Şikayet</div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-10 py-6 text-center min-w-[150px] shadow-inner hover:bg-white/20 transition-all mb-4">
                            <div className="text-4xl font-bold">{responseRate}%</div>
                            <div className="text-sm text-indigo-100 mt-2">Çözüm Oranı</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>




      

            {/* SPACER: Bu div header ile filtre arasındaki fiziksel boşluğu oluşturur */}
            <div className="h-8 w-full bg-gray-50"></div>

            {/* Filters Bar - Sticky */}
            <div className="border-y border-white/20 sticky top-0 z-40 backdrop-blur-md">
                <div className="container px-4 py-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            
                            {/* Filter Tabs */}
                            <div className="flex flex-wrap gap-3">
                                <Link 
                                    href="/company/complaints?status=ALL"
                                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        currentStatus === 'ALL' 
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-105' 
                                            : 'bg-white/80 text-gray-700 border border-gray-300 hover:bg-white'
                                    }`}
                                >
                                    Tümü ({company._count.complaints})
                                </Link>

                                <Link 
                                    href="/company/complaints?status=SOLVED"
                                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        currentStatus === 'SOLVED' 
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md scale-105' 
                                            : 'bg-white/80 text-gray-700 border border-gray-300 hover:bg-white'
                                    }`}
                                >
                                    Çözülen ({solvedCount})
                                </Link>

                                <Link 
                                    href="/company/complaints?status=PENDING"
                                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        currentStatus === 'PENDING' 
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-105' 
                                            : 'bg-white/80 text-gray-700 border border-gray-300 hover:bg-white'
                                    }`}
                                >
                                    Yanıtlanmayan ({pendingCount})
                                </Link>
                            </div>
                            
                            {/* View Options */}
                            <div className="flex items-center gap-3">
                                <div className="text-sm text-gray-700 bg-white/80 border border-gray-300 px-4 py-2 rounded-lg font-medium shadow-sm">
                                    Sayfa {currentPage} / {totalPages || 1}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>



            {/* SPACER: Filtre ile içerik arasındaki boşluk */}
            <div className="h-8 w-full bg-gray-50"></div>

            {/* Complaints List */}
            <div className="container px-4 pb-20">
                <div className="max-w-6xl mx-auto">
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
                                                        
                                                        {/* User info and date */}
                                                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                                                            <span className="font-medium">
                                                                {complaint.user.name} {complaint.user.surname || ''}
                                                            </span>
                                                            <span className="text-gray-300">|</span>
                                                            <span className="text-gray-500 flex items-center gap-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                {new Date(complaint.createdAt).toLocaleDateString('tr-TR', { 
                                                                    day: 'numeric', 
                                                                    month: 'long', 
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Status badge */}
                                                    <div className="flex flex-col items-end gap-2">
                                                        {getStatusBadge(complaint.status)}
                                                    </div>
                                                </div>
                                                
                                                {/* Content preview */}
                                                <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                                                    {complaint.content}
                                                </p>
                                                
                                                {/* Images */}
                                                {complaint.images && complaint.images.length > 0 && (
                                                    <div className="flex gap-3 mb-5">
                                                        {complaint.images.slice(0, 3).map((image: any, index: number) => (
                                                            <div key={index} className="relative group/image">
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
                                                
                                                {/* Footer */}
                                                <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-2">
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
                                                            <span className="font-medium">{complaint.responses?.length || 0}</span>
                                                            <span className="text-gray-400">yanıt</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-3">
                                                        <Link 
                                                            href={`/complaints/${complaint.id}#yorum`}
                                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl transition-all text-sm font-medium border border-green-100"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                            </svg>
                                                            <span>Yanıtla</span>
                                                        </Link>
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
                                </div>
                            ))}
                        </div>
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex flex-col items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                                    <span>Toplam {totalCount} şikayet</span>
                                    <span className="text-gray-300">•</span>
                                    <span>Sayfa {currentPage} / {totalPages}</span>
                                </div>
                                
                                <div className="flex flex-wrap justify-center gap-2">
                                    {currentPage > 1 && (
                                        <Link
                                            href={`/company/complaints?status=${currentStatus}&page=${currentPage - 1}`}
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
                                                href={`/company/complaints?status=${currentStatus}&page=${pageNum}`}
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
                                            href={`/company/complaints?status=${currentStatus}&page=${currentPage + 1}`}
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
                            <h3 className="text-3xl font-bold text-gray-900 mb-3">Henüz Şikayet Yok</h3>
                            <p className="text-gray-500 mb-8 max-w-lg mx-auto text-lg">Bu filtreleme kriterlerine uygun herhangi bir şikayet bulunmuyor.</p>
                            <Link 
                                href="/company"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all font-bold shadow-lg shadow-indigo-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Firma Paneline Dön
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}