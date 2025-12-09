'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function NewComplaintPage() {
    const router = useRouter()
    const [companies, setCompanies] = useState<any[]>([])
    const [filteredCompanies, setFilteredCompanies] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCompany, setSelectedCompany] = useState('')
    const [images, setImages] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                // Don't close if we're just selecting a company
                if (!(event.target as HTMLElement).closest('.company-option')) {
                    // If a company is selected, clear the search term to hide the dropdown
                    if (selectedCompany) {
                        setSearchTerm('')
                    }
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [selectedCompany])

    useEffect(() => {
        // Fetch all companies without limit
        fetch('/api/companies?limit=10000')
            .then(res => res.json())
            .then(data => {
                setCompanies(data.companies || [])
                setFilteredCompanies(data.companies || [])
            })
            .catch(err => {
                console.error('Failed to fetch companies:', err)
                setError('Şirketler yüklenirken bir hata oluştu')
            })
    }, [])

    useEffect(() => {
        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        // Set new timeout
        searchTimeoutRef.current = setTimeout(() => {
            if (searchTerm.trim() === '') {
                // Only show filtered companies if there's no selection
                if (!selectedCompany) {
                    setFilteredCompanies(companies)
                }
            } else {
                const filtered = companies.filter(company => 
                    company.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                setFilteredCompanies(filtered)
            }
        }, 300)

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [searchTerm, companies, selectedCompany])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files)
            
            // Limit to 2 images
            if (files.length + images.length > 2) {
                setError('En fazla 2 resim yükleyebilirsiniz')
                return
            }
            
            // Check file types
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            for (const file of files) {
                if (!validTypes.includes(file.type)) {
                    setError('Sadece JPG, PNG, GIF veya WebP formatında resim yükleyebilirsiniz')
                    return
                }
                
                // Check file size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    setError('Her resim en fazla 5MB olabilir')
                    return
                }
            }
            
            // Create previews
            const newPreviews: string[] = []
            files.forEach(file => {
                const reader = new FileReader()
                reader.onload = (e) => {
                    newPreviews.push(e.target?.result as string)
                    if (newPreviews.length === files.length) {
                        setImagePreviews(prev => [...prev, ...newPreviews])
                    }
                }
                reader.readAsDataURL(file)
            })
            
            setImages(prev => [...prev, ...files])
            setError('')
        }
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
        setImagePreviews(prev => prev.filter((_, i) => i !== index))
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        
        // Upload images first
        let imageUrls: string[] = []
        if (images.length > 0) {
            try {
                for (const image of images) {
                    const imageData = new FormData()
                    imageData.append('file', image)
                    
                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: imageData
                    })
                    
                    if (!res.ok) {
                        throw new Error('Resim yükleme başarısız')
                    }
                    
                    const json = await res.json()
                    imageUrls.push(json.url)
                }
            } catch (err: any) {
                setError(err.message || 'Resim yükleme hatası')
                setLoading(false)
                return
            }
        }

        // Convert to JSON
        const data = {
            title: formData.get('title'),
            content: formData.get('content'),
            companyId: selectedCompany || formData.get('companyId'),
            images: imageUrls
        }

        try {
            const res = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!res.ok) {
                const json = await res.json()
                throw new Error(json.error || 'Şikayet oluşturulamadı')
            }

            const json = await res.json()
            router.push(`/complaints/${json.complaint.id}`)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Handle company selection
    const handleCompanySelect = (companyId: string, companyName: string) => {
        setSelectedCompany(companyId)
        setSearchTerm('') // Clear search term to hide dropdown
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 md:py-12 px-4 overflow-x-hidden">
            <div className="max-w-4xl mx-auto w-full">
                {/* Modern Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl mb-6 transform hover:scale-105 transition-transform">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                        Yeni Şikayet Oluştur
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Marka hakkında yaşadığınız sorunu detaylıca anlatın ve sesinizi duyurun
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-50 border border-blue-200 rounded-full max-w-full">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs md:text-sm font-medium text-blue-700">Günlük limit: Her kullanıcı aynı firmaya günde yalnızca 1 şikayet oluşturabilir</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm w-full">
                    <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3 animate-fade-in">
                                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Company Search - Modern Design */}
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Marka Seçin
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative" ref={dropdownRef}>
                                {!selectedCompany ? (
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="company-search-input"
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Marka adını arayın veya yazın..."
                                            className="w-full pl-12 pr-4 py-4 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-gray-400"
                                            onFocus={() => {
                                                if (!selectedCompany) {
                                                    setFilteredCompanies(companies)
                                                }
                                            }}
                                        />
                                        {searchTerm && filteredCompanies.length > 0 && (
                                            <div className="absolute z-20 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-80 overflow-y-auto custom-scrollbar">
                                                {filteredCompanies.slice(0, 100).map(company => (
                                                    <div 
                                                        key={company.id}
                                                        className={`px-5 py-4 cursor-pointer flex items-center gap-4 transition-all company-option ${
                                                            selectedCompany === company.id 
                                                                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500' 
                                                                : 'hover:bg-gray-50 border-l-4 border-transparent'
                                                        }`}
                                                        onClick={() => handleCompanySelect(company.id, company.name)}
                                                    >
                                                        {company.logoUrl ? (
                                                            <img src={company.logoUrl} alt={company.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-gray-100" />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                                                                <span className="text-lg font-bold text-white">{company.name.charAt(0).toUpperCase()}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-semibold text-gray-900 truncate">{company.name}</div>
                                                            {company.sector && (
                                                                <div className="text-xs text-gray-500 mt-0.5">{company.sector.name}</div>
                                                            )}
                                                        </div>
                                                        {selectedCompany === company.id && (
                                                            <div className="flex-shrink-0">
                                                                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {filteredCompanies.length > 100 && (
                                                    <div className="px-5 py-3 text-center text-sm text-gray-500 bg-gray-50 border-t border-gray-200">
                                                        {filteredCompanies.length - 100} şirket daha... Arama yaparak daraltın
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="group relative">
                                        <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-indigo-200 shadow-sm">
                                            {companies.find(c => c.id == selectedCompany)?.logoUrl ? (
                                                <img 
                                                    src={companies.find(c => c.id == selectedCompany)?.logoUrl} 
                                                    alt={companies.find(c => c.id == selectedCompany)?.name} 
                                                    className="w-16 h-16 rounded-xl object-cover ring-2 ring-white shadow-md" 
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                                                    <span className="text-2xl font-bold text-white">
                                                        {companies.find(c => c.id == selectedCompany)?.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-gray-900 text-lg mb-1">
                                                    {companies.find(c => c.id == selectedCompany)?.name}
                                                </div>
                                                {companies.find(c => c.id == selectedCompany)?.sector && (
                                                    <div className="inline-flex items-center px-2.5 py-1 bg-white rounded-full text-xs font-medium text-gray-600">
                                                        {companies.find(c => c.id == selectedCompany)?.sector.name}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCompany('')
                                                    setSearchTerm('')
                                                }}
                                                className="flex-shrink-0 w-10 h-10 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl border border-gray-200 hover:border-red-300 transition-all flex items-center justify-center shadow-sm"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <input type="hidden" name="companyId" value={selectedCompany} />
                        </div>

                        {/* Title */}
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                Şikayet Başlığı
                                <span className="text-red-500">*</span>
                            </label>
                            <input 
                                name="title" 
                                required 
                                className="w-full px-5 py-4 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-gray-400 font-medium" 
                                placeholder="Örn: Kargo 3 gündür gelmedi, ürün hasarlı geldi..." 
                            />
                            <p className="mt-2 text-xs text-gray-500">Kısa ve açıklayıcı bir başlık yazın</p>
                        </div>

                        {/* Content */}
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Şikayet Detayı
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea 
                                name="content" 
                                required 
                                rows={8} 
                                className="w-full px-5 py-4 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none placeholder-gray-400" 
                                placeholder="Yaşadığınız sorunu detaylıca anlatın. Ne zaman oldu? Nasıl bir sorun yaşadınız? Şirketle iletişime geçtiniz mi?"
                            ></textarea>
                            <p className="mt-2 text-xs text-gray-500">En az 50 karakter yazmanız önerilir</p>
                        </div>

                        {/* Image Upload - Modern Design */}
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Kanıt Fotoğrafları
                                <span className="text-gray-500 font-normal">(İsteğe Bağlı)</span>
                            </label>
                            
                            {imagePreviews.length === 0 ? (
                                <div className="relative group">
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*" 
                                        onChange={handleImageChange}
                                        className="hidden" 
                                        id="image-upload" 
                                    />
                                    <label 
                                        htmlFor="image-upload" 
                                        className="flex flex-col items-center justify-center w-full h-48 border-3 border-dashed border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer transition-all hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 group"
                                    >
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-semibold text-gray-700 mb-1">Fotoğraf Yükle</p>
                                                <p className="text-sm text-gray-500">JPG, PNG, GIF veya WebP formatında</p>
                                                <p className="text-xs text-gray-400 mt-1">En fazla 2 fotoğraf • Her biri max 5MB</p>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <div className="relative overflow-hidden rounded-2xl border-2 border-gray-200 shadow-lg">
                                                <img 
                                                    src={preview} 
                                                    alt={`Preview ${index + 1}`} 
                                                    className="w-full h-48 object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <button 
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-3 right-3 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                                <div className="absolute bottom-3 left-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Fotoğraf {index + 1}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {imagePreviews.length < 2 && (
                                        <div className="relative">
                                            <input 
                                                type="file" 
                                                multiple 
                                                accept="image/*" 
                                                onChange={handleImageChange}
                                                className="hidden" 
                                                id="image-upload-2" 
                                            />
                                            <label 
                                                htmlFor="image-upload-2" 
                                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 cursor-pointer transition-all hover:border-indigo-400 hover:bg-indigo-50"
                                            >
                                                <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                <p className="text-sm font-medium text-gray-600">Başka Fotoğraf Ekle</p>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-4 md:py-6 bg-gradient-to-r from-gray-50 via-indigo-50/30 to-purple-50/30 border-t border-gray-200 flex flex-col sm:flex-row gap-4 sm:justify-end">
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <button 
                                type="button" 
                                onClick={() => router.back()}
                                className="w-full sm:w-auto px-6 py-3.5 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all border-2 border-gray-200 shadow-sm hover:shadow-md"
                            >
                                İptal
                            </button>
                            <button 
                                type="submit" 
                                disabled={loading || !selectedCompany}
                                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Yayınlanıyor...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Şikayeti Yayınla</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}