'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminSettingsPage() {
    const router = useRouter()
    const [settings, setSettings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({})
    const [previews, setPreviews] = useState<{[key: string]: string}>({})

    useEffect(() => {
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                setSettings(data.settings)
                setLoading(false)
                
                // Set initial previews for existing images
                const logoUrl = data.settings.find((s: any) => s.key === 'SITE_LOGO_URL')?.value
                const faviconUrl = data.settings.find((s: any) => s.key === 'FAVICON_URL')?.value
                
                if (logoUrl) {
                    setPreviews(prev => ({ ...prev, SITE_LOGO_URL: logoUrl }))
                }
                if (faviconUrl) {
                    setPreviews(prev => ({ ...prev, FAVICON_URL: faviconUrl }))
                }
            })
    }, [])

    async function handleSave(key: string, value: string) {
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key, value })
            })
            
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Kaydetme hatası')
            }
            
            alert('Ayarlar kaydedildi')
            
            // Update local state
            setSettings(prev => {
                const existing = prev.find(s => s.key === key)
                if (existing) {
                    return prev.map(s => s.key === key ? { ...s, value } : s)
                } else {
                    return [...prev, { key, value }]
                }
            })
            
            router.refresh()
        } catch (err: any) {
            console.error('Settings save error:', err)
            alert(`Hata oluştu: ${err.message || 'Bilinmeyen hata'}`)
        }
    }

    async function handleFileUpload(key: string) {
        const fileInput = fileInputRefs.current[key]
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            alert('Lütfen bir dosya seçin')
            return
        }

        try {
            const formData = new FormData()
            formData.append('file', fileInput.files[0])
            formData.append('key', key)

            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()
            
            if (response.ok) {
                // Save the file URL to settings
                await handleSave(key, data.url)
                // Set preview
                setPreviews(prev => ({ ...prev, [key]: data.url }))
                // Reset file input
                fileInput.value = ''
            } else {
                alert('Dosya yükleme başarısız: ' + (data.error || 'Bilinmeyen hata'))
            }
        } catch (err) {
            alert('Dosya yükleme hatası')
        }
    }

    // Handle file selection for preview
    const handleFileSelect = (key: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setPreviews(prev => ({ ...prev, [key]: e.target?.result as string }))
            }
            reader.readAsDataURL(file)
        }
    }

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    )

    // Helper to get value
    const getVal = (key: string) => settings.find(s => s.key === key)?.value || ''

    return (
        <div className="max-w-full overflow-x-hidden">
            <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">Sistem Ayarları</h1>
                <p className="text-gray-600 text-sm">Site genel ayarlarını buradan yönetebilirsiniz</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Statistics Settings Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                            <h2 className="text-xl font-semibold text-white">İstatistik Ayarları</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-5">
                                {[
                                    { key: 'STAT_HAPPY_USERS', label: 'Mutlu Kullanıcı', ph: '100000' },
                                    { key: 'STAT_SOLVED_COMPLAINTS', label: 'Çözülen Şikayet', ph: '50000' },
                                    { key: 'STAT_CORPORATE_BRANDS', label: 'Kurumsal Marka', ph: '2000' },
                                    { key: 'STAT_SUCCESS_RATE', label: 'Başarı Oranı (%)', ph: '85' },
                                ].map(field => (
                                    <div key={field.key} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <label className="block text-sm font-medium text-gray-700 min-w-[180px]">
                                            {field.label}
                                        </label>
                                        <div className="flex-1 flex gap-2">
                                            <input
                                                type="text"
                                                defaultValue={getVal(field.key)}
                                                placeholder={field.ph}
                                                className="input flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                id={`input-${field.key}`}
                                            />
                                            <button
                                                onClick={() => {
                                                    const val = (document.getElementById(`input-${field.key}`) as HTMLInputElement).value
                                                    handleSave(field.key, val)
                                                }}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                            >
                                                Kaydet
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SMTP Settings Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                            <h2 className="text-xl font-semibold text-white">SMTP / E-posta Ayarları</h2>
                        </div>
                        <div className="p-6">
                            {/* Email Verification Toggle */}
                            <div className="mb-6 pb-6 border-b border-gray-200">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">E-posta Doğrulama</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Yeni üyelik kayıtlarında e-posta doğrulama kodunu aktif edin. 
                                            Hem normal kullanıcılar hem de şirket kullanıcıları için geçerlidir.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-sm font-medium ${getVal('EMAIL_VERIFICATION_ENABLED') === 'true' ? 'text-green-600' : 'text-gray-500'}`}>
                                            {getVal('EMAIL_VERIFICATION_ENABLED') === 'true' ? 'Aktif' : 'Pasif'}
                                        </span>
                                        <button
                                            onClick={async () => {
                                                const currentVal = getVal('EMAIL_VERIFICATION_ENABLED')
                                                const newVal = currentVal === 'true' ? 'false' : 'true'
                                                await handleSave('EMAIL_VERIFICATION_ENABLED', newVal)
                                            }}
                                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                                                getVal('EMAIL_VERIFICATION_ENABLED') === 'true' 
                                                    ? 'bg-green-500' 
                                                    : 'bg-gray-300'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                                                    getVal('EMAIL_VERIFICATION_ENABLED') === 'true' 
                                                        ? 'translate-x-7' 
                                                        : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                                {getVal('EMAIL_VERIFICATION_ENABLED') !== 'true' && (
                                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <div>
                                                <p className="text-sm font-medium text-yellow-800">E-posta doğrulama pasif</p>
                                                <p className="text-xs text-yellow-700 mt-1">
                                                    Kullanıcılar e-posta doğrulama yapmadan kayıt olabilirler. Güvenlik için aktif etmeniz önerilir.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {getVal('EMAIL_VERIFICATION_ENABLED') === 'true' && (
                                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div>
                                                <p className="text-sm font-medium text-green-800">E-posta doğrulama aktif</p>
                                                <p className="text-xs text-green-700 mt-1">
                                                    Yeni üye olan kullanıcılara doğrulama kodu gönderilecektir.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-5">
                                {[
                                    { key: 'SMTP_HOST', label: 'SMTP Sunucusu', ph: 'smtp.brandliftup.nl', help: 'ÖNEMLİ: smtp. ile başlamalı!' },
                                    { key: 'SMTP_PORT', label: 'SMTP Port', ph: '465 veya 587' },
                                    { key: 'SMTP_SECURE', label: 'SMTP Secure', ph: 'true (465 için) veya false (587 için)', type: 'text', help: 'Port 465 ise: true, Port 587 ise: false' },
                                    { key: 'SMTP_USER', label: 'SMTP Kullanıcı Adı', ph: 'info@brandliftup.nl' },
                                    { key: 'SMTP_PASS', label: 'SMTP Şifresi', ph: '********', type: 'password' },
                                    { key: 'SMTP_FROM', label: 'Gönderen Adresi', ph: 'Şikayetvar Clone <info@brandliftup.nl>' },
                                ].map(field => (
                                    <div key={field.key} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <label className="block text-sm font-medium text-gray-700 min-w-[180px]">
                                            {field.label}
                                            {field.help && <span className="block text-xs text-red-600 mt-1 font-normal">{field.help}</span>}
                                        </label>
                                        <div className="flex-1">
                                            <input
                                                type={field.type || 'text'}
                                                defaultValue={getVal(field.key)}
                                                placeholder={field.ph}
                                                className="input w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                id={`input-${field.key}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <button
                                    onClick={async () => {
                                        const smtpFields = [
                                            'SMTP_HOST',
                                            'SMTP_PORT',
                                            'SMTP_SECURE',
                                            'SMTP_USER',
                                            'SMTP_PASS',
                                            'SMTP_FROM'
                                        ]
                                        
                                        let hasError = false
                                        const values: { [key: string]: string } = {}
                                        
                                        // Collect and validate all values
                                        for (const fieldKey of smtpFields) {
                                            const inputElement = document.getElementById(`input-${fieldKey}`) as HTMLInputElement
                                            let val: string = inputElement.value.trim()
                                            
                                            // Auto-fix common mistakes
                                            if (fieldKey === 'SMTP_HOST' && val && !val.startsWith('smtp.')) {
                                                val = 'smtp.' + val
                                                inputElement.value = val
                                            }
                                            if (fieldKey === 'SMTP_SECURE' && val === '465') {
                                                val = 'true'
                                                inputElement.value = val
                                            }
                                            if (fieldKey === 'SMTP_SECURE' && val === '587') {
                                                val = 'false'
                                                inputElement.value = val
                                            }
                                            
                                            values[fieldKey] = val
                                            
                                            // Validate required fields
                                            if (fieldKey !== 'SMTP_FROM' && !val) {
                                                alert(`${fieldKey} alanı boş olamaz!`)
                                                hasError = true
                                                break
                                            }
                                        }
                                        
                                        if (hasError) return
                                        
                                        // Save all fields
                                        try {
                                            for (const fieldKey of smtpFields) {
                                                await fetch('/api/admin/settings', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({ key: fieldKey, value: values[fieldKey] })
                                                })
                                            }
                                            
                                            alert('Tüm SMTP ayarları başarıyla kaydedildi!')
                                            
                                            // Update local state
                                            setSettings(prev => {
                                                const updated = [...prev]
                                                for (const fieldKey of smtpFields) {
                                                    const existing = updated.find(s => s.key === fieldKey)
                                                    if (existing) {
                                                        existing.value = values[fieldKey]
                                                    } else {
                                                        updated.push({ key: fieldKey, value: values[fieldKey] })
                                                    }
                                                }
                                                return updated
                                            })
                                            
                                            router.refresh()
                                        } catch (err: any) {
                                            console.error('SMTP settings save error:', err)
                                            alert(`Hata oluştu: ${err.message || 'Bilinmeyen hata'}`)
                                        }
                                    }}
                                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-sm hover:shadow-md"
                                >
                                    Tüm SMTP Ayarlarını Kaydet
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Site Settings Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                            <h2 className="text-xl font-semibold text-white">Site Ayarları</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6">
                                {/* Site Name */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <label className="block text-sm font-medium text-gray-700 min-w-[180px]">
                                        Site Adı
                                    </label>
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            defaultValue={getVal('SITE_NAME')}
                                            placeholder="Şikayetvar"
                                            className="input flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            id="input-SITE_NAME"
                                        />
                                        <button
                                            onClick={() => {
                                                const val = (document.getElementById('input-SITE_NAME') as HTMLInputElement).value
                                                handleSave('SITE_NAME', val)
                                            }}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                        >
                                            Kaydet
                                        </button>
                                    </div>
                                </div>

                                {/* Site Logo Upload */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <label className="block text-sm font-medium text-gray-700 min-w-[180px]">
                                        Site Logosu
                                    </label>
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1">
                                                <div 
                                                    className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors relative overflow-hidden"
                                                    onClick={() => fileInputRefs.current['SITE_LOGO_URL']?.click()}
                                                >
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        ref={(el) => { fileInputRefs.current['SITE_LOGO_URL'] = el; }}
                                                        className="hidden"
                                                        onChange={(e) => handleFileSelect('SITE_LOGO_URL', e)}
                                                    />
                                                    {previews['SITE_LOGO_URL'] ? (
                                                        <div className="flex flex-col items-center">
                                                            <img 
                                                                src={previews['SITE_LOGO_URL']} 
                                                                alt="Logo Preview" 
                                                                className="h-16 mx-auto mb-2 object-contain"
                                                            />
                                                            <p className="text-xs text-gray-500">Değiştirmek için tıklayın</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center py-4">
                                                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <p className="text-sm text-gray-500">Logo yüklemek için tıklayın</p>
                                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => handleFileUpload('SITE_LOGO_URL')}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium whitespace-nowrap"
                                                >
                                                    Yükle
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (fileInputRefs.current['SITE_LOGO_URL']) {
                                                            fileInputRefs.current['SITE_LOGO_URL'].value = '';
                                                            setPreviews(prev => {
                                                                const newPreviews = { ...prev };
                                                                delete newPreviews['SITE_LOGO_URL'];
                                                                return newPreviews;
                                                            });
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium whitespace-nowrap"
                                                >
                                                    Temizle
                                                </button>
                                            </div>
                                        </div>
                                        {getVal('SITE_LOGO_URL') && (
                                            <div className="mt-3 flex items-center gap-3">
                                                <span className="text-xs text-gray-500">Kayıtlı logo:</span>
                                                <img 
                                                    src={getVal('SITE_LOGO_URL')} 
                                                    alt="Site Logo" 
                                                    className="h-10 border border-gray-200 rounded-lg"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Favicon Upload */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <label className="block text-sm font-medium text-gray-700 min-w-[180px]">
                                        Favicon
                                    </label>
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1">
                                                <div 
                                                    className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors relative overflow-hidden"
                                                    onClick={() => fileInputRefs.current['FAVICON_URL']?.click()}
                                                >
                                                    <input
                                                        type="file"
                                                        accept="image/*,.ico"
                                                        ref={(el) => { fileInputRefs.current['FAVICON_URL'] = el; }}
                                                        className="hidden"
                                                        onChange={(e) => handleFileSelect('FAVICON_URL', e)}
                                                    />
                                                    {previews['FAVICON_URL'] ? (
                                                        <div className="flex flex-col items-center">
                                                            <img 
                                                                src={previews['FAVICON_URL']} 
                                                                alt="Favicon Preview" 
                                                                className="h-10 mx-auto mb-2 object-contain"
                                                            />
                                                            <p className="text-xs text-gray-500">Değiştirmek için tıklayın</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center py-4">
                                                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <p className="text-sm text-gray-500">Favicon yüklemek için tıklayın</p>
                                                            <p className="text-xs text-gray-400 mt-1">ICO, PNG, JPG</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => handleFileUpload('FAVICON_URL')}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium whitespace-nowrap"
                                                >
                                                    Yükle
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (fileInputRefs.current['FAVICON_URL']) {
                                                            fileInputRefs.current['FAVICON_URL'].value = '';
                                                            setPreviews(prev => {
                                                                const newPreviews = { ...prev };
                                                                delete newPreviews['FAVICON_URL'];
                                                                return newPreviews;
                                                            });
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium whitespace-nowrap"
                                                >
                                                    Temizle
                                                </button>
                                            </div>
                                        </div>
                                        {getVal('FAVICON_URL') && (
                                            <div className="mt-3 flex items-center gap-3">
                                                <span className="text-xs text-gray-500">Kayıtlı favicon:</span>
                                                <img 
                                                    src={getVal('FAVICON_URL')} 
                                                    alt="Favicon" 
                                                    className="h-6 border border-gray-200 rounded"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Contact Email */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <label className="block text-sm font-medium text-gray-700 min-w-[180px]">
                                        İletişim E-posta
                                    </label>
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            defaultValue={getVal('CONTACT_EMAIL')}
                                            placeholder="iletisim@example.com"
                                            className="input flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            id="input-CONTACT_EMAIL"
                                        />
                                        <button
                                            onClick={() => {
                                                const val = (document.getElementById('input-CONTACT_EMAIL') as HTMLInputElement).value
                                                handleSave('CONTACT_EMAIL', val)
                                            }}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                        >
                                            Kaydet
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Media Settings Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                            <h2 className="text-xl font-semibold text-white">Sosyal Medya Ayarları</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-5">
                                {[
                                    { key: 'SOCIAL_FACEBOOK_URL', label: 'Facebook URL', ph: 'https://facebook.com/kullaniciadi' },
                                    { key: 'SOCIAL_TWITTER_URL', label: 'Twitter URL', ph: 'https://twitter.com/kullaniciadi' },
                                    { key: 'SOCIAL_INSTAGRAM_URL', label: 'Instagram URL', ph: 'https://instagram.com/kullaniciadi' },
                                ].map(field => (
                                    <div key={field.key} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <label className="block text-sm font-medium text-gray-700 min-w-[180px]">
                                            {field.label}
                                        </label>
                                        <div className="flex-1 flex gap-2">
                                            <input
                                                type="text"
                                                defaultValue={getVal(field.key)}
                                                placeholder={field.ph}
                                                className="input flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                id={`input-${field.key}`}
                                            />
                                            <button
                                                onClick={() => {
                                                    const val = (document.getElementById(`input-${field.key}`) as HTMLInputElement).value
                                                    handleSave(field.key, val)
                                                }}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                            >
                                                Kaydet
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Info Card */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6">
                        <h3 className="font-semibold text-lg text-indigo-900 mb-3">Bilgilendirme</h3>
                        <p className="text-indigo-700 text-sm mb-4">
                            Bu ayarlar sitenizin genel görünümünü ve davranışını belirler. 
                            Değişikliklerin uygulanması için sayfayı yenilemeniz gerekebilir.
                        </p>
                        <div className="bg-white/50 rounded-lg p-4 border border-indigo-100">
                            <p className="text-xs text-indigo-600">
                                <span className="font-medium">Not:</span> Ayarlar veritabanında saklanır ve sunucu yeniden başlatılmadan anında geçerli olur.
                            </p>
                        </div>
                    </div>

                    {/* Preview Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                            <h3 className="font-semibold text-white">Önizleme</h3>
                        </div>
                        <div className="p-6">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                                <div className="flex flex-col items-center justify-center">
                                    {getVal('SITE_LOGO_URL') || previews['SITE_LOGO_URL'] ? (
                                        <img 
                                            src={previews['SITE_LOGO_URL'] || getVal('SITE_LOGO_URL')} 
                                            alt="Site Logo Preview" 
                                            className="h-12 mb-3"
                                        />
                                    ) : (
                                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-12 mb-3" />
                                    )}
                                    <h4 className="font-bold text-lg text-gray-800">
                                        {getVal('SITE_NAME') || 'Site Adı'}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Önizleme alanı
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}