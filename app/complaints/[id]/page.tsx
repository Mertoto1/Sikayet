import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { isSessionWithRole } from '@/lib/auth-utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ViewCountUpdater from '@/components/ViewCountUpdater'
import SidebarViewCount from '@/components/SidebarViewCount'

const ComplaintDetailClientWrapper = dynamic(() => import('@/components/ComplaintDetailClientWrapper'))
const ResponseForm = dynamic(() => import('@/components/ResponseForm'))

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const complaint = await prisma.complaint.findUnique({ 
        where: { id },
        include: { 
            company: true 
        } 
    })
    if (!complaint) return { title: 'Şikayet Bulunamadı' }

    return {
        title: `${complaint.title} - ${complaint.company.name} Şikayeti | Complaintvar`,
        description: complaint.content.substring(0, 160),
        openGraph: {
            title: complaint.title,
            description: complaint.content.substring(0, 160),
            type: 'article'
        }
    }
}

export default async function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getSession()

    // View count will be handled by client-side component

    const complaint = await prisma.complaint.findUnique({
        where: { id },
        include: {
            user: { select: { name: true, avatar: true } },
            company: { select: { name: true, slug: true, logoUrl: true } },
            images: true,
            responses: {
                include: { company: { select: { name: true, logoUrl: true } } },
                orderBy: { createdAt: 'asc' }
            }
        }
    })

    if (!complaint) notFound()

    // Get related complaints from same company (excluding current one)
    const relatedComplaints = await prisma.complaint.findMany({
        where: { 
            companyId: complaint.companyId, 
            status: 'PUBLISHED',
            id: { not: complaint.id }
        },
        include: {
            user: { select: { name: true, avatar: true } },
            company: { select: { name: true, slug: true } },
            images: {
                take: 2,
                orderBy: { id: 'asc' }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    })

    // Yetki kontrolleri
    let isCompanyRep = false
    let isComplaintOwner = false
    if (isSessionWithRole(session)) {
        // @ts-ignore - TypeScript doesn't recognize the included relations properly
        if (complaint.userId === session.userId) isComplaintOwner = true
        if (session.role === 'COMPANY') {
            const user = await prisma.user.findUnique({
                where: { id: session.userId },
                include: { company: true }
            })
            // @ts-ignore - TypeScript doesn't recognize the included relations properly
            if (user?.company?.id === complaint.companyId) isCompanyRep = true
        }
    }

    // Tarih formatlayıcı
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('tr-TR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return (
        <ComplaintDetailClientWrapper 
                isCompanyRep={isCompanyRep} 
                isComplaintOwner={isComplaintOwner}
                complaintId={complaint.id}
                complaintStatus={complaint.status}
        >
            <div className="bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen pb-20 overflow-x-hidden">
                {/* 1. HEADER ALANI (USER PROFILE) */}
                <div className="bg-white border-b border-gray-200 shadow-sm relative z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 w-full">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            {/* Modern Avatar */}
                            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-xl border-4 border-white ring-4 ring-indigo-100">
                                {/* @ts-ignore - TypeScript doesn't recognize the included relations properly */}
                                {complaint.user.avatar ? (
                                    <img 
                                        // @ts-ignore - TypeScript doesn't recognize the included relations properly
                                        src={complaint.user.avatar} 
                                        // @ts-ignore - TypeScript doesn't recognize the included relations properly
                                        alt={complaint.user.name || 'Kullanıcı'} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        {/* @ts-ignore - TypeScript doesn't recognize the included relations properly */}
                                        <span className="text-white text-2xl font-bold">
                                            {/* @ts-ignore - TypeScript doesn't recognize the included relations properly */}
                                            {complaint.user.name?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 text-center md:text-left mt-2">
                                {/* @ts-ignore - TypeScript doesn't recognize the included relations properly */}
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{complaint.user.name}</h1>
                                <p className="text-gray-600 mb-4">Şikayet Sahibi</p>
                                
                                {/* Badges */}
                                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">Aktif Kullanıcı</span>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Onaylı Hesap</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. MAIN CONTENT GRID */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12">
                        
                        {/* SOL TARAF: ŞİKAYET DETAYI (8 Col) */}
                        <div className="lg:col-span-8 space-y-8">
                            
                            {/* Şikayet Kartı */}
                            <div className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-10 shadow-xl border border-gray-100 relative overflow-hidden w-full">
                                {/* Decorative Elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-16 translate-x-16"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-50 rounded-full translate-y-12 -translate-x-12"></div>
                                
                                {/* Başlık */}
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight relative z-10">
                                    {complaint.title}
                                </h2>

                                {/* Meta Bilgi Kartı */}
                                <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100 relative z-10">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden">
                                                {/* @ts-ignore - TypeScript doesn't recognize the included relations properly */}
                                                {complaint.user.avatar ? (
                                                    <img 
                                                        // @ts-ignore - TypeScript doesn't recognize the included relations properly
                                                        src={complaint.user.avatar} 
                                                        // @ts-ignore - TypeScript doesn't recognize the included relations properly
                                                        alt={complaint.user.name || 'Kullanıcı'} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                        {/* @ts-ignore - TypeScript doesn't recognize the included relations properly */}
                                                        <span className="text-white text-sm font-bold">
                                                            {/* @ts-ignore - TypeScript doesn't recognize the included relations properly */}
                                                            {complaint.user.name?.charAt(0) || 'U'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                {/* @ts-ignore - TypeScript doesn't recognize the included relations properly */}
                                                <div className="font-bold text-gray-900">{complaint.user.name}</div>
                                                <div className="text-xs text-gray-500">Şikayet Sahibi</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>{new Date(complaint.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            <ViewCountUpdater initialCount={complaint.viewCount} />
                                        </div>
                                    </div>
                                </div>

                                {/* İçerik */}
                                <div className="prose prose-lg prose-gray max-w-none text-gray-700 mb-8 leading-relaxed bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Şikayet Detayı</h3>
                                    {complaint.content.split('\n').map((line: string, i: number) => (
                                        <p key={i} className="mb-4 text-gray-600">{line}</p>
                                    ))}
                                </div>

                                {/* Görseller */}
                                {/* @ts-ignore - TypeScript doesn't recognize the included relations properly */}
                                {complaint.images.length > 0 && (
                                    <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {/* @ts-ignore - TypeScript doesn't recognize the included relations properly */}
                                            Kanıtlar ({complaint.images.length})
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {/* @ts-ignore - TypeScript doesn't recognize the included relations properly */}
                                            {complaint.images.map((img: any, index: number) => (
                                                <div 
                                                    key={img.id} 
                                                    className="aspect-square relative group rounded-2xl overflow-hidden border border-gray-200 bg-white cursor-pointer shadow-sm hover:shadow-lg transition-all"
                                                    data-image-index={index}
                                                    data-image-id={img.id}
                                                >
                                                    <img 
                                                        src={img.url} 
                                                        alt={`Evidence ${index + 1}`} 
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                           

                            
                            {/* Kurumsal Yanıtlar */}
                            {complaint.responses.length > 0 && (
                                <div className="bg-white rounded-3xl shadow-xl border border-gray-100">
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b">
                                        <h3 className="text-xl font-bold text-gray-900">Marka Yanıtları</h3>
                                    </div>
                                    <div className="divide-y">
                                        {complaint.responses.map((response: any) => (
                                            <div key={response.id} className="p-6 hover:bg-gray-50">
                                                <div className="flex gap-4">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-indigo-100 bg-white">
                                                        {response.company.logoUrl ? (
                                                            <img src={response.company.logoUrl} alt={response.company.name} className="w-full h-full object-contain p-1" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                                <span className="text-white font-bold">{response.company.name.charAt(0)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-gray-900">{response.company.name}</span>
                                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Kurumsal Hesap</span>
                                                            </div>
                                                            <span className="text-xs text-gray-500">{formatDate(response.createdAt)}</span>
                                                        </div>
                                                        <div className="bg-gray-50 rounded-2xl p-4 border">
                                                            <p className="text-gray-700 whitespace-pre-wrap">{response.message}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Yorum Bölümü - Sadece ilgili firma için */}
                            {isCompanyRep && (
                                <div id="yorum" className="bg-white rounded-3xl shadow-xl border border-gray-100 mt-8">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b">
                                        <h3 className="text-xl font-bold text-gray-900">Yorum Yap</h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                                            <p className="text-green-800 mb-4">
                                                Bu şikayete firma adınızla (<strong>{complaint.company.name}</strong>) yorum yapabilirsiniz.
                                            </p>
                                            <ResponseForm complaintId={complaint.id} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Aynı Şirkete Ait Diğer Şikayetler */}
                            {!isCompanyRep && relatedComplaints.length > 0 && (
                                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 mt-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {complaint.company.name} Şikayetleri
                                        </h3>
                                        <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full">
                                            {relatedComplaints.length} şikayet
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {relatedComplaints.map((relatedComplaint: any) => (
                                            <div key={relatedComplaint.id} className="border border-gray-100 rounded-2xl p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex gap-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200">
                                                            {relatedComplaint.user.avatar ? (
                                                                <img 
                                                                    src={relatedComplaint.user.avatar} 
                                                                    alt={relatedComplaint.user.name || 'Kullanıcı'} 
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                                    <span className="text-white text-sm font-bold">
                                                                        {relatedComplaint.user.name?.charAt(0) || 'U'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                                            {relatedComplaint.title}
                                                        </h4>
                                                        
                                                        {relatedComplaint.images.length > 0 && (
                                                            <div className="flex gap-2 mb-3">
                                                                {relatedComplaint.images.map((img: any, imgIndex: number) => (
                                                                    <div key={img.id} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                                                        <img 
                                                                            src={img.url} 
                                                                            alt={`Image ${imgIndex + 1}`} 
                                                                            className="w-full h-full object-cover" 
                                                                            loading="lazy"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        
                                                        <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                            {relatedComplaint.content}
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                    </svg>
                                                                    {relatedComplaint.user.name}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    {new Date(relatedComplaint.createdAt).toLocaleDateString('tr-TR')}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                    </svg>
                                                                    {relatedComplaint.viewCount || 0}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-3">
                                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                                                                    relatedComplaint.status === 'SOLVED' ? 'bg-emerald-100 text-emerald-700' :
                                                                    relatedComplaint.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-700' :
                                                                    relatedComplaint.status === 'ANSWERED' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'
                                                                }`}>
                                                                    {relatedComplaint.status === 'SOLVED' ? 'Çözüldü' :
                                                                     relatedComplaint.status === 'PUBLISHED' ? 'Yayında' : 
                                                                     relatedComplaint.status === 'ANSWERED' ? 'Yanıtlandı' : 'Beklemede'}
                                                                </span>
                                                                
                                                                <Link 
                                                                    href={`/complaints/${relatedComplaint.id}`}
                                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium"
                                                                >
                                                                    Detayı gör
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                    </svg>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {relatedComplaints.length >= 5 && (
                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            <Link 
                                                href={`/companies/${complaint.company.slug}`}
                                                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                                            >
                                                Tüm şikayetleri görüntüle
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* SAĞ TARAF: SIDEBAR (4 Col) */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-6 space-y-6">
                                
                                {/* Marka Kartı */}
                                <div className="bg-white rounded-[1.5rem] p-6 text-center shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100">
                                    <div className="w-24 h-24 mx-auto bg-white rounded-2xl border border-gray-100 p-4 shadow-inner mb-4 flex items-center justify-center">
                                        {/* @ts-ignore - TypeScript doesn't recognize the included relations properly */}
                                        {complaint.company.logoUrl ? (
                                            <img 
                                                // @ts-ignore - TypeScript doesn't recognize the included relations properly
                                                src={complaint.company.logoUrl} 
                                                // @ts-ignore - TypeScript doesn't recognize the included relations properly
                                                alt={complaint.company.name} 
                                                className="w-full h-full object-contain" 
                                            />
                                        ) : (
                                            <span className="text-4xl font-bold text-gray-300">
                                                {/* @ts-ignore - TypeScript doesn't recognize the included relations properly */}
                                                {complaint.company.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    {/* @ts-ignore - TypeScript doesn't recognize the included relations properly */}
                                    <h3 className="text-xl font-bold text-gray-900">{complaint.company.name}</h3>
                                    <p className="text-gray-500 text-sm mb-6">Kurumsal Onaylı Hesap</p>
                                    
                                    {/* @ts-ignore - TypeScript doesn't recognize the included relations properly */}
                                    <Link 
                                        // @ts-ignore - TypeScript doesn't recognize the included relations properly
                                        href={`/companies/${complaint.company.slug}`}
                                        className="block w-full py-3 rounded-xl bg-gray-50 text-gray-700 font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-gray-200 hover:border-indigo-200"
                                    >
                                        Marka Profilini Gör
                                    </Link>
                                </div>

                                {/* Durum Özeti */}
                                <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-6 shadow-sm border border-indigo-100">
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Şikayet Durumu
                                    </h4>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <span className="text-gray-600 font-medium">Mevcut Durum</span>
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                                                complaint.status === 'SOLVED' ? 'bg-emerald-100 text-emerald-700' :
                complaint.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-700' :
                complaint.status === 'ANSWERED' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'
            }`}>
                                                {complaint.status === 'SOLVED' ? (
                                                    <>
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Çözüldü
                                                    </>
                                                ) : complaint.status === 'PUBLISHED' ? 'Yayında' : complaint.status === 'ANSWERED' ? (
                                                    <>
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                        </svg>
                                                        Yanıtlandı
                                                    </>
                                                ) : 'Beklemede'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <span className="text-gray-600 font-medium">Oluşturulma Tarihi</span>
                                            <span className="text-gray-900 font-medium">{new Date(complaint.createdAt).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <span className="text-gray-600 font-medium">Görüntülenme</span>
                                            <SidebarViewCount initialCount={complaint.viewCount} />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </ComplaintDetailClientWrapper>
    )
}