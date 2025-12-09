'use client'

import { useState } from 'react'

interface CompanyTabsProps {
    complaintsCount: number
    company: {
        name: string
        description: string | null
        sector: { name: string } | null
        logoUrl: string | null
        createdAt: Date
    }
    stats: {
        totalComplaints: number
        solvedCount: number
        responseRate: number
        trustScore: number
        averageRating: number | null
        reviewCount: number
    }
    complaints: React.ReactNode
}

export default function CompanyTabs({ complaintsCount, company, stats, complaints }: CompanyTabsProps) {
    const [activeTab, setActiveTab] = useState<'complaints' | 'about' | 'stats'>('complaints')

    return (
        <>
            {/* Navigation Tabs */}
            <div className="container px-4">
                <div className="max-w-6xl mx-auto flex gap-6 md:gap-8 overflow-x-auto border-b border-gray-200">
                    <button 
                        onClick={() => setActiveTab('complaints')}
                        className={`py-4 px-2 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${
                            activeTab === 'complaints'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        Şikayetler ({complaintsCount})
                    </button>
                    <button 
                        onClick={() => setActiveTab('about')}
                        className={`py-4 px-2 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${
                            activeTab === 'about'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        Hakkında
                    </button>
                    <button 
                        onClick={() => setActiveTab('stats')}
                        className={`py-4 px-2 border-b-2 font-semibold text-sm whitespace-nowrap transition-colors ${
                            activeTab === 'stats'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        İstatistikler
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="container px-4 py-8 md:py-12">
                <div className="max-w-6xl mx-auto">
                    {activeTab === 'complaints' && (
                        <div>
                            {complaints}
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
                            <div className="flex items-start gap-6">
                                {company.logoUrl && (
                                    <img 
                                        src={company.logoUrl} 
                                        alt={company.name}
                                        className="w-24 h-24 rounded-2xl object-contain border border-gray-200 flex-shrink-0"
                                    />
                                )}
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{company.name}</h2>
                                    
                                    {company.sector && (
                                        <div className="mb-4">
                                            <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-sm px-4 py-2 rounded-full font-semibold">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                                {company.sector.name}
                                            </span>
                                        </div>
                                    )}

                                    {company.description ? (
                                        <div className="prose max-w-none">
                                            <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                                                {company.description}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 rounded-xl p-6 text-center">
                                            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-gray-500">Bu firma hakkında henüz bilgi eklenmemiş.</p>
                                        </div>
                                    )}

                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>Kayıt Tarihi: {new Date(company.createdAt).toLocaleDateString('tr-TR', { 
                                                day: 'numeric', 
                                                month: 'long', 
                                                year: 'numeric' 
                                            })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div className="space-y-6">
                            {/* Trust Score Card */}
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 md:p-8 shadow-xl text-white">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold">Güven Skoru</h2>
                                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                                        <span className="text-3xl font-bold">{stats.trustScore}</span>
                                    </div>
                                </div>
                                <p className="text-indigo-100 text-sm">
                                    Bu skor, şikayet çözüm oranı, kullanıcı değerlendirmeleri ve firma doğrulama durumuna göre hesaplanmaktadır.
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Total Complaints */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalComplaints}</div>
                                    <div className="text-sm text-gray-600">Toplam Şikayet</div>
                                </div>

                                {/* Solved Complaints */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.solvedCount}</div>
                                    <div className="text-sm text-gray-600">Çözülen Şikayet</div>
                                </div>

                                {/* Response Rate */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.responseRate}%</div>
                                    <div className="text-sm text-gray-600">Çözüm Oranı</div>
                                </div>

                                {/* Average Rating */}
                                {stats.averageRating && (
                                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900 mb-1">
                                            {stats.averageRating.toFixed(1)}
                                        </div>
                                        <div className="text-sm text-gray-600">Ortalama Puan</div>
                                    </div>
                                )}

                                {/* Review Count */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.reviewCount}</div>
                                    <div className="text-sm text-gray-600">Toplam Yorum</div>
                                </div>

                                {/* Pending Complaints */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-1">
                                        {stats.totalComplaints - stats.solvedCount}
                                    </div>
                                    <div className="text-sm text-gray-600">Bekleyen Şikayet</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

