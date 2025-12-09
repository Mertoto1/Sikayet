'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminSectorsPage() {
    const router = useRouter()
    const [sectors, setSectors] = useState<any[]>([])
    const [newSector, setNewSector] = useState('')
    const [editingSector, setEditingSector] = useState<{id: number, name: string} | null>(null)
    const [editName, setEditName] = useState('')
    const [loading, setLoading] = useState(true)
    const [deleteConfirm, setDeleteConfirm] = useState<{id: number, name: string} | null>(null)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        fetch('/api/admin/sectors')
            .then(res => res.json())
            .then(data => {
                setSectors(data.sectors || [])
                setLoading(false)
            })
            .catch(err => {
                console.error('Sektörler yüklenirken hata:', err)
                setSectors([])
                setLoading(false)
            })
    }, [])

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!newSector.trim()) return

        try {
            const res = await fetch('/api/admin/sectors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newSector })
            })
            if (res.ok) {
                const data = await res.json()
                setSectors([...(sectors || []), data.sector])
                setNewSector('')
                router.refresh()
            } else {
                const error = await res.json()
                alert(error.error || 'Sektör oluşturulamadı')
            }
        } catch (err) {
            alert('Hata oluştu')
        }
    }

    function startEditing(sector: any) {
        setEditingSector({id: sector.id, name: sector.name})
        setEditName(sector.name)
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault()
        if (!editingSector || !editName.trim()) return

        try {
            const res = await fetch(`/api/admin/sectors/${editingSector.id}`, {
                method: 'PUT',
                body: JSON.stringify({ name: editName })
            })
            if (res.ok) {
                const data = await res.json()
                setSectors(sectors.map(s => s.id === editingSector.id ? data.sector : s))
                setEditingSector(null)
                setEditName('')
                router.refresh()
            } else {
                const error = await res.json()
                alert(error.error || 'Güncelleme başarısız')
            }
        } catch (err) {
            alert('Hata oluştu')
        }
    }

    function handleDeleteClick(sectorId: number, sectorName: string) {
        setDeleteConfirm({ id: sectorId, name: sectorName })
    }

    function handleDeleteCancel() {
        setDeleteConfirm(null)
    }

    async function handleDeleteConfirm() {
        if (!deleteConfirm) return

        const { id: sectorId, name: sectorName } = deleteConfirm
        setDeleting(true)
        
        try {
            const res = await fetch(`/api/admin/sectors/${sectorId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            })
            
            const data = await res.json()
            
            if (res.ok) {
                setSectors((prevSectors) => prevSectors.filter(s => s.id !== sectorId))
                setDeleteConfirm(null)
                alert('Sektör başarıyla silindi')
                router.refresh()
            } else {
                alert(data.error || 'Silme işlemi başarısız')
            }
        } catch (err) {
            console.error('Delete error:', err)
            alert('Hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'))
        } finally {
            setDeleting(false)
        }
    }

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>

    return (
        <div className="space-y-3 md:space-y-4 max-w-full overflow-x-hidden">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                    Sektör Yönetimi
                </h1>
                <p className="text-gray-600 text-sm">Sektörleri yönetin ve yeni sektörler ekleyin</p>
            </div>

            {/* Create/Edit Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {editingSector ? 'Sektör Düzenle' : 'Yeni Sektör Ekle'}
                    </h2>
                </div>
                <div className="p-6">
                    <form onSubmit={editingSector ? handleUpdate : handleCreate} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {editingSector ? 'Sektör Adı' : 'Yeni Sektör Adı'}
                            </label>
                            <input
                                type="text"
                                value={editingSector ? editName : newSector}
                                onChange={e => editingSector ? setEditName(e.target.value) : setNewSector(e.target.value)}
                                placeholder={editingSector ? "Sektör adını düzenleyin" : "Sektör Adı (örn: Bankacılık)"}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            {editingSector && (
                                <button 
                                    type="button"
                                    onClick={() => setEditingSector(null)}
                                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                                >
                                    İptal
                                </button>
                            )}
                            <button 
                                type="submit" 
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium flex items-center gap-2"
                            >
                                {editingSector ? (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Güncelle
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Ekle
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Sectors List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Mevcut Sektörler
                    </h2>
                </div>
                <div className="overflow-x-auto max-w-full">
                    <table className="w-full min-w-[500px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">ID</th>
                                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Sektör Adı</th>
                                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Şirket Sayısı</th>
                                <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sectors && sectors.length > 0 ? (
                                sectors.map((sector: any) => (
                                    <tr key={sector.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6 text-sm font-medium text-gray-900">#{sector.id}</td>
                                        <td className="py-4 px-6 font-medium text-gray-900">{sector.name}</td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                sector._count?.companies > 0 
                                                    ? 'bg-indigo-100 text-indigo-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {sector._count?.companies || 0} şirket
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => startEditing(sector)}
                                                    className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                                                    title="Düzenle"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        handleDeleteClick(sector.id, sector.name)
                                                    }}
                                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                                                    title="Sil"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-12 px-6 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                            <h3 className="text-lg font-medium text-gray-900 mb-1">Henüz sektör eklenmemiş</h3>
                                            <p className="text-gray-500">Yukarıdaki formdan ilk sektörünüzü ekleyin</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Sektörü Sil</h3>
                                    <p className="text-sm text-gray-600">Bu işlem geri alınamaz</p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-6">
                                <strong>"{deleteConfirm.name}"</strong> sektörünü silmek istediğinize emin misiniz? 
                                Bu işlem aynı zamanda bu sektördeki <strong>tüm şirketleri</strong> de silecektir.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleDeleteCancel}
                                    disabled={deleting}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={deleting}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Siliniyor...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Sil
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}