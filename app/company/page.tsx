import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { logout } from '@/app/actions/auth-actions'

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic'

export default async function CompanyDashboardPage() {
    const session = await getSession()
    const role = typeof session === 'object' && session !== null ? session.role : null
    const isCompanyRole = role === 'COMPANY' || role === 'COMPANY_PENDING'

    if (!session || !isCompanyRole) redirect('/login')

    // Get user's company
    const userId = typeof session === 'object' && session !== null ? session.userId : null
    if (!userId) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { company: true }
    })

    if (!user?.company) return <div className="container py-20 text-center">Firma kaydınız bulunamadı.</div>

    const isPendingApproval = user.role === 'COMPANY_PENDING' || !user.company.isApproved

    // Block access if company is not approved
    if (isPendingApproval) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
                        {/* Icon */}
                        <div className="mb-6 flex justify-center">
                            <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center">
                                <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Şirket Onayı Bekleniyor
                        </h1>

                        {/* Message */}
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Firma hesabınız henüz admin tarafından onaylanmadı. 
                            <br />
                            <span className="font-semibold text-gray-800">Onaylandıktan sonra panele erişebileceksiniz.</span>
                        </p>

                        {/* Info Box */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-xl p-6 mb-8 text-left">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <svg className="w-6 h-6 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-amber-900 mb-2">Onay Süreci Hakkında</h3>
                                    <ul className="space-y-2 text-amber-800 text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-600 mt-1">•</span>
                                            <span>Onay süreci genellikle <strong>1-2 iş günü</strong> sürmektedir</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-600 mt-1">•</span>
                                            <span>Onaylandığınızda <strong>e-posta adresinize bildirim</strong> gönderilecektir</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-amber-600 mt-1">•</span>
                                            <span>Onay sonrası <strong>şikayetleri görüntüleyip yanıtlayabileceksiniz</strong></span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                href="/"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Ana Sayfaya Dön
                            </Link>
                            <form action="/api/auth/logout" method="POST">
                                <button 
                                    type="submit"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Çıkış Yap
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const complaints = await prisma.complaint.findMany({
        where: { companyId: user.company.id },
        orderBy: { createdAt: 'desc' },
        include: { 
            user: { select: { name: true, surname: true, avatar: true } },
            images: { select: { url: true } },
            responses: { select: { id: true } }
        }
    })

    // Calculate statistics
    const totalComplaints = complaints.length
    const solvedComplaints = complaints.filter(c => c.status === 'SOLVED' || c.status === 'ANSWERED').length
    const answeredComplaints = complaints.filter(c => c.status === 'ANSWERED').length
    const pendingComplaints = complaints.filter(c => c.status === 'PENDING_MODERATION').length
    
    // Calculate satisfaction rate (simplified)
    const satisfactionRate = totalComplaints > 0 ? Math.round((solvedComplaints / totalComplaints) * 100) : 0

    // Function to get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Yayında</span>
            case 'SOLVED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Çözüldü</span>
            case 'ANSWERED':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Yanıtlandı
                    </span>
                )
            case 'PENDING_MODERATION':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Beklemede</span>
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 py-8">
            <div className="container px-4 max-w-6xl mx-auto">
                {/* Pending Approval Warning Banner */}
                {isPendingApproval && (
                    <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-xl p-6 shadow-lg">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-amber-900 mb-2">Onay Bekleniyor</h3>
                                <p className="text-amber-800 mb-3">
                                    Firma hesabınız henüz onaylanmadı. Hesabınızın onaylanması için lütfen bekleyin. 
                                    Onaylandıktan sonra tüm özelliklere erişebileceksiniz.
                                </p>
                                <div className="flex items-center gap-2 text-sm text-amber-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Onay süreci genellikle 1-2 iş günü sürmektedir.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Header */}
                <div className="mb-8">
                    {/* Company Profile Card */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-6 relative overflow-hidden">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full translate-y-12 -translate-x-12"></div>
                        
                        <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
                            <div className="flex-shrink-0">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-lg">
                                    {user.company.logoUrl ? (
                                        <img 
                                            src={user.company.logoUrl} 
                                            alt={user.company.name} 
                                            className="w-full h-full object-contain rounded-xl bg-white p-2"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-xl bg-white flex items-center justify-center text-indigo-600 font-bold text-2xl shadow-inner">
                                            {user.company.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-grow">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.company.name}</h1>
                                        <p className="text-gray-600">Firma Yönetim Paneli</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {isPendingApproval ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                                                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                                                Onay Bekleniyor
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                Aktif
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Üye since {new Date(user.company.createdAt).getFullYear()}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Progress Bar for Satisfaction Rate */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Müşteri Memnuniyeti</span>
                                        <span className="font-semibold text-indigo-600">{satisfactionRate}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" 
                                            style={{ width: `${satisfactionRate}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link 
                                    href="/company/edit"
                                    className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Profili Düzenle
                                </Link>
                                
                                {/* 2FA Button */}
                                <Link 
                                    href="/profile/2fa"
                                    className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    2FA Ayarları
                                </Link>
                                
                                <form action={logout}>
                                    <button 
                                        type="submit"
                                        className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-sm hover:shadow-md"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Çıkış Yap
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                            <div className="flex items-center">
                                <div className="rounded-xl bg-indigo-100 p-3">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Toplam Şikayet</h3>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{totalComplaints}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                            <div className="flex items-center">
                                <div className="rounded-xl bg-emerald-100 p-3">
                                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Çözülen</h3>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{solvedComplaints}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                            <div className="flex items-center">
                                <div className="rounded-xl bg-blue-100 p-3">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Yanıtlanan</h3>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{answeredComplaints}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                            <div className="flex items-center">
                                <div className="rounded-xl bg-yellow-100 p-3">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bekleyen</h3>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{pendingComplaints}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                            <div className="flex items-center">
                                <div className="rounded-xl bg-purple-100 p-3">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Memnuniyet</h3>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{satisfactionRate}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                    <Link href="/company/edit" className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className="flex items-start gap-4">
                            <div className="rounded-xl bg-indigo-100 p-3 flex-shrink-0">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Profil Düzenle</h3>
                                <p className="text-gray-600 mt-1">Firma bilgilerinizi güncelleyin</p>
                                <div className="mt-3 inline-flex items-center text-indigo-600 font-medium text-sm">
                                    Düzenle
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
                        <Link href="/company/support">
                            <div className="flex items-start gap-4">
                                <div className="rounded-xl bg-blue-100 p-3 flex-shrink-0">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Destek Talebi</h3>
                                    <p className="text-gray-600 mt-1">Destek ekibine ulaşın</p>
                                    <div className="mt-3 inline-flex items-center text-blue-600 font-medium text-sm">
                                        İletişim
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Recent Complaints */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900">Son Şikayetler</h2>
                                <Link href="/company/complaints" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                                    Tümünü Gör
                                </Link>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                            {complaints.slice(0, 5).map((complaint: any) => (
                                <div key={complaint.id} className="p-5 hover:bg-gray-50 transition group">
                                    <div className="flex gap-4">
                                        {/* User Avatar */}
                                        <div className="flex-shrink-0">
                                            {complaint.user.avatar ? (
                                                <img 
                                                    src={complaint.user.avatar} 
                                                    alt={`${complaint.user.name} ${complaint.user.surname || ''}`}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                    {complaint.user.name ? complaint.user.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Header with title and status */}
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <Link href={`/complaints/${complaint.id}`} className="font-bold text-gray-900 hover:text-indigo-600 transition mb-1 block text-lg leading-tight">
                                                        {complaint.title}
                                                    </Link>
                                                    
                                                    {/* User name and date */}
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                        <span className="font-medium">
                                                            {complaint.user.name} {complaint.user.surname || ''}
                                                        </span>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-gray-500">
                                                            {new Date(complaint.createdAt).toLocaleDateString('tr-TR', { 
                                                                day: 'numeric', 
                                                                month: 'short', 
                                                                year: 'numeric' 
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
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                                                {complaint.content.substring(0, 120)}...
                                            </p>
                                            
                                            {/* Images */}
                                            {complaint.images && complaint.images.length > 0 && (
                                                <div className="flex gap-2 mb-3">
                                                    {complaint.images.slice(0, 3).map((image: any, index: number) => (
                                                        <img 
                                                            key={index}
                                                            src={image.url} 
                                                            alt={`Şikayet görseli ${index + 1}`}
                                                            className="w-16 h-16 rounded-lg object-cover border border-gray-200 hover:border-indigo-300 transition cursor-pointer"
                                                        />
                                                    ))}
                                                    {complaint.images.length > 3 && (
                                                        <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                                                            +{complaint.images.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {/* Footer stats */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        <span>{complaint.viewCount || 0} görüntülenme</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                        </svg>
                                                        <span>{complaint.responses?.length || 0} yanıt</span>
                                                    </div>
                                                </div>
                                                
                                                <Link 
                                                    href={`/complaints/${complaint.id}`} 
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition group"
                                                >
                                                    Detaylar
                                                    <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {complaints.length === 0 && (
                                <div className="p-12 text-center">
                                    <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Henüz şikayet yok</h3>
                                    <p className="text-gray-500">Firmanıza ait henüz bir şikayet bulunmuyor.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Performance Summary */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                            <h2 className="text-lg font-bold text-gray-900">Performans Özeti</h2>
                        </div>
                        <div className="p-6">
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Şikayet Durumu Dağılımı</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Çözüldü</span>
                                            <span className="font-medium">{Math.round((solvedComplaints / totalComplaints) * 100) || 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full" 
                                                style={{ width: `${(solvedComplaints / totalComplaints) * 100 || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Yanıtlandı</span>
                                            <span className="font-medium">{Math.round((answeredComplaints / totalComplaints) * 100) || 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full" 
                                                style={{ width: `${(answeredComplaints / totalComplaints) * 100 || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Beklemede</span>
                                            <span className="font-medium">{Math.round((pendingComplaints / totalComplaints) * 100) || 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" 
                                                style={{ width: `${(pendingComplaints / totalComplaints) * 100 || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Öneriler</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-0.5 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-sm text-gray-600">Yeni şikayetlere hızlı yanıt vermek müşteri memnuniyetini artırır</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-0.5 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-sm text-gray-600">Detaylı açıklamalar çözülmüş olarak algılanmanızı sağlar</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-0.5 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-sm text-gray-600">Haftalık şikayet analizleri yaparak performansınızı artırın</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}