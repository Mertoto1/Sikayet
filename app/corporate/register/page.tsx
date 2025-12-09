'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Company {
    id: number
    name: string
    logoUrl?: string
    sector: { name: string }
}

export default function CorporateRegisterPage() {
    const router = useRouter()
    const [step, setStep] = useState(1) // 1: Search, 2: Form
    const [searchQuery, setSearchQuery] = useState('')
    const [companies, setCompanies] = useState<Company[]>([])
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Form Stats
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        title: '',
        message: ''
    })

    // Search Companies Debounced
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                try {
                    const res = await fetch(`/api/companies?q=${searchQuery}`)
                    const json = await res.json()
                    setCompanies(json.companies)
                } catch (e) {
                    console.error(e)
                }
            } else {
                setCompanies([])
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedCompany) return

        setLoading(true)
        try {
            const res = await fetch('/api/corporate/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId: selectedCompany.id,
                    ...formData
                })
            })

            const json = await res.json()

            if (!res.ok) throw new Error(json.error || 'Bir hata oluştu')

            alert('Başvurunuz alındı! Admin onayından sonra size e-posta ile bilgilendirme yapılacaktır.')
            router.push('/')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Kurumsal Üyelik Başvurusu
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Markanızın itibarını yönetmek için ilk adımı atın.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Markanızı Arayın
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        type="text"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Şirket adı giriniz..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {companies.length > 0 && (
                                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                            {companies.map((company) => (
                                                <div
                                                    key={company.id}
                                                    onClick={() => {
                                                        setSelectedCompany(company)
                                                        setStep(2)
                                                    }}
                                                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 flex items-center justify-between"
                                                >
                                                    <span className="font-medium text-gray-900 block truncate">
                                                        {company.name}
                                                    </span>
                                                    <span className="text-gray-500 text-xs">
                                                        {company.sector?.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Listenizde olmayan bir marka için <Link href="/contact" className="text-indigo-600">iletişime geçin</Link>.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 2 && selectedCompany && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-indigo-50 p-4 rounded-lg flex items-center justify-between">
                                <span className="font-bold text-indigo-900">{selectedCompany.name}</span>
                                <button type="button" onClick={() => setStep(1)} className="text-xs text-indigo-600 hover:text-indigo-800">Değiştir</button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Kurumsal E-posta
                                    <span className="text-xs text-gray-500 ml-1">(Örn: isim@sirketadi.com)</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Telefon</label>
                                    <input
                                        type="tel"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ünvan / Pozisyon</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-md">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">Önemli Bilgilendirme</h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <p>
                                                Kurumsal e-posta adresiniz ile şirketinizin web sitesi alan adı eşleşmelidir.
                                                Gmail, Hotmail vb. adresler ile yapılan başvurular reddedilecektir.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading ? 'Gönderiliyor...' : 'Doğrulama Talebi Gönder'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
