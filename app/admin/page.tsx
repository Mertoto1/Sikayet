import { prisma } from '@/lib/db'
import Link from 'next/link'

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
    const pendingCount = await prisma.complaint.count({ where: { status: 'PENDING_MODERATION' } })
    const totalComplaints = await prisma.complaint.count()
    const totalUsers = await prisma.user.count()
    const totalCompanies = await prisma.company.count()
    const solvedCount = await prisma.complaint.count({ where: { status: 'SOLVED' } })
    const publishedCount = await prisma.complaint.count({ where: { status: 'PUBLISHED' } })

    const recentComplaints = await prisma.complaint.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            company: { select: { name: true } },
            user: { select: { name: true } }
        }
    })

    return (
        <div className="max-w-full overflow-x-hidden">
            {/* Header */}
            <div className="mb-2 md:mb-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                            Genel Bakış
                        </h1>
                        <p className="text-sm text-gray-600">Yönetim paneline hoş geldiniz</p>
                    </div>
                    
                    {/* 2FA Button */}
                    <Link 
                        href="/profile/2fa"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm w-full md:w-auto"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="hidden sm:inline">2FA Ayarları</span>
                        <span className="sm:hidden">2FA</span>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div className="group relative bg-gradient-to-br from-orange-500 to-red-500 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full -mr-6 -mt-6 md:-mr-8 md:-mt-8"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-white/80 text-xs md:text-sm font-medium mb-1">Onay Bekleyen</div>
                        <div className="text-3xl md:text-4xl font-bold text-white mb-1">{pendingCount}</div>
                        <div className="text-white/60 text-xs hidden md:block">Acil inceleme gerekli</div>
                    </div>
                </div>

                <div className="group relative bg-gradient-to-br from-indigo-500 to-purple-600 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full -mr-6 -mt-6 md:-mr-8 md:-mt-8"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-white/80 text-xs md:text-sm font-medium mb-1">Toplam Şikayet</div>
                        <div className="text-3xl md:text-4xl font-bold text-white mb-1">{totalComplaints}</div>
                        <div className="text-white/60 text-xs hidden md:block">Çözülen: {solvedCount} | Yayınlanan: {publishedCount}</div>
                    </div>
                </div>

                <div className="group relative bg-gradient-to-br from-blue-500 to-cyan-500 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full -mr-6 -mt-6 md:-mr-8 md:-mt-8"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-white/80 text-xs md:text-sm font-medium mb-1">Kullanıcı Sayısı</div>
                        <div className="text-3xl md:text-4xl font-bold text-white mb-1">{totalUsers}</div>
                        <div className="text-white/60 text-xs hidden md:block">Aktif kullanıcılar</div>
                    </div>
                </div>

                <div className="group relative bg-gradient-to-br from-emerald-500 to-teal-500 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full -mr-6 -mt-6 md:-mr-8 md:-mt-8"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-white/80 text-xs md:text-sm font-medium mb-1">Kayıtlı Şirket</div>
                        <div className="text-3xl md:text-4xl font-bold text-white mb-1">{totalCompanies}</div>
                        <div className="text-white/60 text-xs hidden md:block">Sistemde kayıtlı</div>
                    </div>
                </div>
            </div>

            {/* Recent Complaints */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                            <svg className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Son Şikayetler
                        </h2>
                        <Link 
                            href="/admin/complaints" 
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                            Tümünü Gör
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
                <div className="divide-y divide-gray-100">
                    {recentComplaints.map((complaint: any) => (
                        <div key={complaint.id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                                            {complaint.company.name}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                            complaint.status === 'PENDING_MODERATION' ? 'bg-orange-100 text-orange-800' :
                                            complaint.status === 'SOLVED' ? 'bg-green-100 text-green-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {complaint.status === 'PENDING_MODERATION' ? 'Bekliyor' :
                                             complaint.status === 'SOLVED' ? 'Çözüldü' : 'Yayınlandı'}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base line-clamp-2">{complaint.title}</h3>
                                    <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-3">{complaint.content}</p>
                                    <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {complaint.user.name}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {new Date(complaint.createdAt).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>
                                </div>
                                <Link 
                                    href={`/admin/complaints/${complaint.id}`} 
                                    className="flex-shrink-0 w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors text-center"
                                >
                                    İncele
                                </Link>
                            </div>
                        </div>
                    ))}
                    
                    {recentComplaints.length === 0 && (
                        <div className="p-8 md:p-12 text-center">
                            <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1">Henüz şikayet yok</h3>
                            <p className="text-sm md:text-base text-gray-500">Yeni şikayetler geldikçe burada listelenecek</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}