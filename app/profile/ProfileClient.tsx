'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ProfileClientProps {
  user: any
  logout: () => void
}

export default function ProfileClient({ user, logout }: ProfileClientProps) {
  const [activeStat, setActiveStat] = useState<string | null>(null)

  const totalComplaints = user._count.complaints
  const publishedComplaints = user.complaints.filter((c: any) => c.status === 'PUBLISHED').length
  const solvedComplaints = user.complaints.filter((c: any) => c.status === 'SOLVED' || c.status === 'ANSWERED').length

  const stats = [
    {
      id: 'total',
      title: 'Toplam Şikayet',
      value: totalComplaints,
      gradient: 'from-indigo-500 to-purple-600',
      icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z'
    },
    {
      id: 'published',
      title: 'Yayınlanan',
      value: publishedComplaints,
      gradient: 'from-blue-500 to-cyan-500',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      id: 'solved',
      title: 'Çözülen',
      value: solvedComplaints,
      gradient: 'from-green-500 to-emerald-500',
      icon: 'M5 13l4 4L19 7'
    }
  ]

  return (
    <>
      {/* Stats Cards - Desktop */}
      <div className="hidden md:grid grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-6 text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white/80">{stat.title}</h3>
              <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
              </svg>
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Complaints List - Desktop: Right */}
        <div className="lg:col-span-2 order-2 lg:order-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Şikayetlerim
                </h2>
                <Link 
                  href="/complaints"
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
              {user.complaints.length > 0 ? (
                user.complaints.map((complaint: any) => (
                  <Link 
                    key={complaint.id}
                    href={`/complaints/${complaint.id}`}
                    className="block p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {complaint.company.logoUrl ? (
                            <img 
                              src={complaint.company.logoUrl} 
                              alt={complaint.company.name}
                              className="w-10 h-10 rounded-lg object-contain bg-white p-1 border flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {complaint.company.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{complaint.title}</h3>
                            <p className="text-sm text-gray-600">{complaint.company.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(complaint.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {complaint.viewCount} görüntülenme
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          complaint.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-800' :
                          complaint.status === 'SOLVED' || complaint.status === 'ANSWERED' ? 'bg-green-100 text-green-800' :
                          complaint.status === 'PENDING_MODERATION' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {complaint.status === 'PUBLISHED' && 'Yayınlandı'}
                          {complaint.status === 'SOLVED' && 'Çözüldü'}
                          {complaint.status === 'ANSWERED' && 'Cevaplandı'}
                          {complaint.status === 'PENDING_MODERATION' && 'Bekliyor'}
                          {complaint.status === 'REJECTED' && 'Reddedildi'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Henüz şikayet oluşturmadınız</h3>
                  <p className="text-gray-500 mb-4">İlk şikayetinizi oluşturmak için yukarıdaki butona tıklayın</p>
                  <Link 
                    href="/complaints/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Şikayet Oluştur
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info Card - Mobile: First, Desktop: Left */}
        <div className="lg:col-span-1 order-1 lg:order-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Hesap Bilgileri</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Profil Fotoğrafı" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-lg mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg mb-4">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">
                  {user.name} {user.surname}
                </h3>
                {user.username && (
                  <p className="text-gray-500">@{user.username}</p>
                )}
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 font-medium">{user.email}</p>
                    {user.isVerified ? (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Doğrulanmış
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Doğrulanmamış
                      </span>
                    )}
                  </div>
                </div>
                
                {user.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Telefon</label>
                    <p className="text-gray-900 font-medium">{user.phone}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Rol</label>
                  <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                    {user.role === 'ADMIN' && 'Yönetici'}
                    {user.role === 'COMPANY' && 'Şirket Kullanıcısı'}
                    {user.role === 'USER' && 'Normal Kullanıcı'}
                  </span>
                </div>
                
                {user.role === 'COMPANY' && user.company && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Şirket</label>
                    <div className="flex items-center gap-3">
                      {user.company.logoUrl ? (
                        <img 
                          src={user.company.logoUrl} 
                          alt={user.company.name} 
                          className="w-10 h-10 rounded-lg object-contain bg-white p-1 border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {user.company.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-gray-900 font-medium">{user.company.name}</p>
                        {user.company.isApproved ? (
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Onaylı
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Onay Bekliyor
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {user.bio && (
                <div className="mb-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Hakkımda</label>
                  <p className="text-gray-700">{user.bio}</p>
                </div>
              )}
              
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <Link 
                  href="/profile/edit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Profili Düzenle
                </Link>
                
                {user.twoFactorEnabled ? (
                  <Link 
                    href="/profile/2fa"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    2FA Ayarları
                  </Link>
                ) : (
                  <Link 
                    href="/profile/2fa"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    2FA Etkinleştir
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Stats Accordion - After Profile Info */}
        <div className="md:hidden order-2 space-y-3">
          {stats.map((stat) => (
            <div key={stat.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => setActiveStat(activeStat === stat.id ? null : stat.id)}
                className={`w-full flex items-center justify-between p-4 transition-colors ${
                  activeStat === stat.id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{stat.title}</h3>
                    {activeStat === stat.id && (
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    )}
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${activeStat === stat.id ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeStat === stat.id && (
                <div className="px-4 pb-4">
                  <div className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-6 text-white shadow-lg`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-white/80">{stat.title}</h3>
                      <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                      </svg>
                    </div>
                    <p className="text-4xl font-bold">{stat.value}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </>
  )
}

