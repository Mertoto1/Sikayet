'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function PendingComplaintsPage() {
    const [complaints, setComplaints] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const res = await fetch('/api/admin/complaints/pending')
                const data = await res.json()
                setComplaints(data.complaints || [])
            } catch (error) {
                console.error('Error fetching complaints:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchComplaints()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="max-w-full overflow-x-hidden">
            <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">Onay Bekleyen Şikayetler</h1>
                <p className="text-gray-600 text-sm">Yeni gelen şikayetleri inceleyin ve yayınlayıp yayına almama kararını verin</p>
            </div>

            {complaints.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Onay bekleyen şikayet bulunmuyor</h3>
                    <p className="text-gray-500">Yeni şikayetler geldikçe burada listelenecek</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {complaints.map((complaint: any) => (
                            <div key={complaint.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                                <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            {complaint.user?.avatar ? (
                                                <img 
                                                    src={complaint.user.avatar} 
                                                    alt={complaint.user.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white">
                                                    {complaint.user?.name?.charAt(0) || '?'}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900">{complaint.user?.name || 'Kullanıcı'}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[120px]">{complaint.user?.email || ''}</div>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                            Bekliyor
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-5">
                                    {complaint.company && (
                                        <Link href={`/companies/${complaint.company.slug}`} className="inline-block mb-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                                                {complaint.company.name}
                                            </span>
                                        </Link>
                                    )}
                                    
                                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{complaint.title}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">{complaint.content}</p>
                                    
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                        <span>{new Date(complaint.createdAt).toLocaleDateString('tr-TR')}</span>
                                        <span>{new Date(complaint.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <Link 
                                            href={`/admin/complaints/${complaint.id}`}
                                            className="flex-1 text-center px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                                        >
                                            İncele
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}