'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminCompaniesPage() {
    const router = useRouter()
    const [companies, setCompanies] = useState<any[]>([])
    // Only show "Bahis & Şans Oyunları" sector (ID: 6)
    const [sectors] = useState([{ id: 6, name: 'Bahis & Şans Oyunları' }])
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)
    const [totalItems, setTotalItems] = useState(0)
    
    // Form State - default to "Bahis & Şans Oyunları" sector
    const [newName, setNewName] = useState('')
    const [selectedSector, setSelectedSector] = useState('6')
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [existingCompanies, setExistingCompanies] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    
    // Edit State
    const [editingCompany, setEditingCompany] = useState<{id: number, name: string, sectorId: number} | null>(null)
    const [editName, setEditName] = useState('')
    const [editSector, setEditSector] = useState('6')

    useEffect(() => {
        setLoading(true)
        // Fetch all companies without pagination from API (we'll paginate on frontend)
        fetch(`/api/admin/companies?limit=10000`)
            .then(r => r.json())
            .then((compData) => {
                setCompanies(compData.companies || [])
                setTotalItems(compData.pagination?.totalItems || compData.companies?.length || 0)
                setLoading(false)
            })
            .catch(err => {
                console.error('Error fetching companies:', err)
                setLoading(false)
            })
    }, [])

    // Search for existing companies
    useEffect(() => {
        if (searchQuery.trim().length >= 2) {
            setIsSearching(true)
            const filtered = companies.filter(company => 
                company.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setExistingCompanies(filtered)
            setIsSearching(false)
        } else {
            setExistingCompanies([])
        }
    }, [searchQuery, companies])

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!newName || !selectedSector) return

        // Backend will check for duplicates (more reliable than frontend check)
        // Frontend check is removed because companies list may not include all companies due to pagination

        try {
            const res = await fetch('/api/admin/companies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newName, sectorId: selectedSector })
            })
            if (res.ok) {
                const data = await res.json()
                // Optimistic update or refresh
                setCompanies([...companies, data.company])
                setTotalItems(totalItems + 1)
                setNewName('')
                setSelectedSector('6') // Reset to default sector
                router.refresh()
            } else {
                const error = await res.json()
                console.error('Company creation error:', error)
                alert(error.error || `Şirket oluşturulamadı (HTTP ${res.status})`)
            }
        } catch (err) {
            console.error('Company creation exception:', err)
            alert('Bir hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'))
        }
    }

    function startEditing(company: any) {
        setEditingCompany({
            id: company.id,
            name: company.name,
            sectorId: company.sectorId
        })
        setEditName(company.name)
        setEditSector(company.sectorId.toString())
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault()
        if (!editingCompany || !editName || !editSector) return

        try {
            const res = await fetch(`/api/admin/companies/${editingCompany.id}`, {
                method: 'PUT',
                body: JSON.stringify({ 
                    name: editName, 
                    sectorId: parseInt(editSector) 
                })
            })
            if (res.ok) {
                const data = await res.json()
                setCompanies(companies.map(c => 
                    c.id === editingCompany.id ? {...c, ...data.company} : c
                ))
                setEditingCompany(null)
                setEditName('')
                setEditSector('6') // Reset to default sector
                router.refresh()
            } else {
                const error = await res.json()
                alert(error.error || 'Güncelleme başarısız')
            }
        } catch (err) {
            alert('Hata oluştu')
        }
    }

    async function handleDelete(companyId: number, companyName: string) {
        if (!confirm(`"${companyName}" şirketini silmek istediğinize emin misiniz?`)) return

        try {
            const res = await fetch(`/api/admin/companies/${companyId}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                setCompanies(companies.filter(c => c.id !== companyId))
                setTotalItems(totalItems - 1)
                router.refresh()
            } else {
                const error = await res.json()
                alert(error.error || 'Silme işlemi başarısız')
            }
        } catch (err) {
            alert('Hata oluştu')
        }
    }

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentCompanies = companies.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1

    const paginate = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber)
        }
    }
    
    // Reset to page 1 when itemsPerPage changes
    useEffect(() => {
        setCurrentPage(1)
    }, [itemsPerPage])

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>

    return (
        <div className="space-y-3 md:space-y-4 max-w-full overflow-x-hidden">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                    Şirket Yönetimi
                </h1>
                <p className="text-gray-600 text-sm">Şirketleri yönetin ve yeni şirketler ekleyin</p>
            </div>

            {/* Create/Edit Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {editingCompany ? 'Şirket Düzenle' : 'Yeni Şirket Ekle'}
                    </h2>
                </div>
                <div className="p-6">
                    <form onSubmit={editingCompany ? handleUpdate : handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Şirket Adı</label>
                            <input
                                type="text"
                                value={editingCompany ? editName : newName}
                                onChange={e => {
                                    const value = e.target.value
                                    if (editingCompany) {
                                        setEditName(value)
                                    } else {
                                        setNewName(value)
                                        setSearchQuery(value)
                                    }
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                placeholder={editingCompany ? "Şirket adını düzenleyin" : "Örn: Garanti BBVA"}
                            />
                            {/* Search Results */}
                            {!editingCompany && searchQuery.trim().length >= 2 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {isSearching ? (
                                        <div className="p-3 text-gray-500 text-sm">Aranıyor...</div>
                                    ) : existingCompanies.length > 0 ? (
                                        existingCompanies.map((company) => (
                                            <div key={company.id} className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-gray-900">{company.name}</span>
                                                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                                        Mevcut
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3 text-gray-500 text-sm">Eşleşen şirket bulunamadı</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sektör</label>
                            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700">
                                Bahis & Şans Oyunları
                            </div>
                            <input 
                                type="hidden" 
                                value="6" 
                                name="sectorId" 
                            />
                        </div>
                        <div className="flex gap-2">
                            {editingCompany && (
                                <button 
                                    type="button"
                                    onClick={() => setEditingCompany(null)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                                >
                                    İptal
                                </button>
                            )}
                            <button 
                                type="submit" 
                                disabled={editingCompany ? (!editName || !editSector) : (!newName || !selectedSector)}
                                className={`flex-1 px-4 py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                                    editingCompany 
                                        ? (!editName || !editSector 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700')
                                        : (!newName || !selectedSector 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700')
                                }`}
                            >
                                {editingCompany ? (
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
                                        Şirket Ekle
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-700">
                    Toplam <span className="font-semibold">{totalItems}</span> şirket, 
                    <span className="font-semibold"> {currentCompanies.length}</span> tanesi gösteriliyor
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Sayfa başına:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            const newValue = Number(e.target.value)
                            setItemsPerPage(newValue)
                            setCurrentPage(1) // Reset to first page when changing items per page
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={500}>500</option>
                        <option value={1000}>1000</option>
                    </select>
                </div>
            </div>

            {/* Companies Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto max-w-full">
                    <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Logo</th>
                                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Şirket Adı</th>
                                <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Durum</th>
                                <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentCompanies.map((company: any) => (
                                <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                                            {company.logoUrl ? (
                                                <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-xs font-bold text-gray-400">{company.name.substring(0, 2)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">{company.name}</td>
                                    <td className="p-4">
                                        {company.isApproved ? (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                Onaylı
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                                Onay Bekliyor
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => startEditing(company)}
                                                className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                                                title="Düzenle"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(company.id, company.name)}
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
                            ))}
                            {currentCompanies.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-12 px-6 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            <h3 className="text-lg font-medium text-gray-900 mb-1">Kayıtlı şirket bulunmuyor</h3>
                                            <p className="text-gray-500">Yukarıdaki formdan ilk şirketinizi ekleyin</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => paginate(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                currentPage === 1 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Önceki
                        </button>
                        <button
                            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                                currentPage === totalPages 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Sonraki
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Sayfa <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages || 1}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                                        currentPage === 1 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : 'bg-white text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="sr-only">Önceki</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                
                                {/* Page numbers */}
                                {totalPages > 0 && [...Array(Math.min(5, totalPages))].map((_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    if (pageNum < 1 || pageNum > totalPages) return null;
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => paginate(pageNum)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                currentPage === pageNum
                                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                
                                <button
                                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                                        currentPage === totalPages 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : 'bg-white text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="sr-only">Sonraki</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}