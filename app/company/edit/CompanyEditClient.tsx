'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CompanyEditClientProps {
    company: {
        id: number
        name: string
        logoUrl: string | null
        description: string | null
    }
    user: {
        id: number
        email: string
        avatar: string | null
        name: string | null
    }
}

export default function CompanyEditClient({ company, user }: CompanyEditClientProps) {
    const router = useRouter()
    const [logoPreview, setLogoPreview] = useState<string | null>(company.logoUrl)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const logoInputRef = useRef<HTMLInputElement>(null)
    const avatarInputRef = useRef<HTMLInputElement>(null)

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Lütfen geçerli bir resim dosyası seçin')
                return
            }
            
            if (file.size > 5 * 1024 * 1024) {
                alert('Resim boyutu 5MB\'dan küçük olmalıdır')
                return
            }

            setLogoFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Lütfen geçerli bir resim dosyası seçin')
                return
            }
            
            if (file.size > 5 * 1024 * 1024) {
                alert('Resim boyutu 5MB\'dan küçük olmalıdır')
                return
            }

            setAvatarFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const formData = new FormData()
            formData.append('companyId', company.id.toString())
            formData.append('description', (e.currentTarget.description as HTMLTextAreaElement).value)
            
            if (logoFile) {
                formData.append('logoUpload', logoFile)
            }
            
            if (avatarFile) {
                formData.append('avatarUpload', avatarFile)
            }

            const response = await fetch('/api/company/update', {
                method: 'POST',
                body: formData
            })

            if (response.ok) {
                const result = await response.json()
                // Update previews with new URLs if provided
                if (result.logoUrl) {
                    setLogoPreview(result.logoUrl)
                }
                if (result.avatarUrl) {
                    setAvatarPreview(result.avatarUrl)
                }
                // Clear file states
                setLogoFile(null)
                setAvatarFile(null)
                // Redirect to company page
                router.push('/company')
                router.refresh()
            } else {
                // Try to parse error response
                let errorMessage = 'Güncelleme başarısız oldu'
                try {
                    const error = await response.json()
                    errorMessage = error.error || errorMessage
                } catch (e) {
                    // If response is not JSON, use status text
                    errorMessage = response.statusText || errorMessage
                }
                alert(errorMessage)
            }
        } catch (error: any) {
            console.error('Update error:', error)
            if (error.message?.includes('Body exceeded')) {
                alert('Dosya boyutu çok büyük. Lütfen 5MB\'dan küçük bir dosya seçin.')
            } else {
                alert('Bir hata oluştu. Lütfen tekrar deneyin.')
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-12">
            <div className="container px-4 max-w-2xl mx-auto">
                
                {/* Top Navigation & Title */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link 
                            href="/company" 
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Kontrol Paneline Dön
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Firma Ayarları
                        </h1>
                    </div>
                </div>

                {/* SINGLE CARD CONTAINER */}
                <form 
                    onSubmit={handleSubmit}
                    className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 overflow-hidden border border-gray-100"
                >
                    <input type="hidden" name="companyId" value={company.id} />
                    {/* 1. Header & Logo Section with Banner */}
                    <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-purple-600">
                        <div className="absolute -bottom-12 left-8">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg ring-4 ring-white/50">
                                    {logoPreview ? (
                                        <img 
                                            src={logoPreview} 
                                            alt={company.name} 
                                            className="w-full h-full object-contain rounded-xl bg-gray-50"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-2xl">
                                            {company.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                {/* Logo Upload Button */}
                                <label className="absolute bottom-0 right-0 p-1.5 bg-white text-gray-600 rounded-lg shadow-md border border-gray-200 cursor-pointer hover:text-indigo-600 hover:scale-105 transition-all">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <input 
                                        ref={logoInputRef}
                                        type="file" 
                                        id="logoUpload" 
                                        name="logoUpload" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                    />
                                </label>
                            </div>
                        </div>
                        
                        {/* Avatar Section - Right side */}
                        <div className="absolute -bottom-12 right-8">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg ring-4 ring-white/50">
                                    {avatarPreview ? (
                                        <img 
                                            src={avatarPreview} 
                                            alt={user.name || 'Profil'} 
                                            className="w-full h-full object-cover rounded-full bg-gray-50"
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xl">
                                            {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                </div>
                                {/* Avatar Upload Button */}
                                <label className="absolute bottom-0 right-0 p-1.5 bg-white text-gray-600 rounded-lg shadow-md border border-gray-200 cursor-pointer hover:text-indigo-600 hover:scale-105 transition-all">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <input 
                                        ref={avatarInputRef}
                                        type="file" 
                                        id="avatarUpload" 
                                        name="avatarUpload" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 px-8 pb-8 space-y-8">
                        
                        {/* 2. Basic Information Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Firma Adı
                                </label>
                                <input
                                    type="text"
                                    defaultValue={company.name}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-500 rounded-xl border border-gray-200 cursor-not-allowed select-none"
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    E-posta Adresi
                                </label>
                                <input
                                    type="text"
                                    defaultValue={user.email}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-500 rounded-xl border border-gray-200 cursor-not-allowed select-none"
                                />
                            </div>
                        </div>

                        {/* 3. Editable Content Section */}
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">
                                    Hakkında
                                </label>
                                <textarea
                                    name="description"
                                    id="description"
                                    rows={5}
                                    defaultValue={company.description || ''}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none"
                                    placeholder="Firmanızın vizyonu, misyonu ve hizmetleri hakkında bilgi verin..."
                                />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white px-3 text-sm text-gray-400 font-medium">Güvenlik</span>
                            </div>
                        </div>

                        {/* 4. Security Section (Accordion style visual) */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100/50">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Şifre Değiştir
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        placeholder="Mevcut Şifre"
                                        className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="password"
                                        name="newPassword"
                                        placeholder="Yeni Şifre"
                                        className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm"
                                    />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Yeni Şifre (Tekrar)"
                                        className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-gray-50 px-8 py-5 flex items-center justify-between border-t border-gray-100">
                        <Link href="/company" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                            Değişiklikleri at
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center justify-center px-8 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Kaydediliyor...' : 'Kaydet ve Güncelle'}
                        </button>
                    </div>
                </form>

                <p className="text-center text-xs text-gray-400 mt-6">
                    © 2024 {company.name}. Tüm hakları saklıdır.
                </p>
            </div>
        </div>
    )
}

