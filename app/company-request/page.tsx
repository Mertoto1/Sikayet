'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CompanyRequestPage() {
  const router = useRouter()
  const [sectors, setSectors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  
  const [formData, setFormData] = useState({
    companyName: '',
    companySector: '',
    companyDescription: '',
    fullName: '',
    email: '',
    phone: '',
    message: ''
  })

  useEffect(() => {
    fetchSectors()
  }, [])

  const fetchSectors = async () => {
    try {
      const response = await fetch('/api/sectors/public')
      if (response.ok) {
        const data = await response.json()
        setSectors(data)
      }
    } catch (err) {
      console.error('Failed to fetch sectors:', err)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Lütfen geçerli bir resim dosyası seçin')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Resim boyutu 5MB\'dan küçük olmalıdır')
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

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        return data.url
      }
      return null
    } catch (err) {
      console.error('Logo upload error:', err)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    // Validation
    if (!formData.companyName || !formData.companySector || !formData.fullName || !formData.email) {
      setError('Lütfen tüm gerekli alanları doldurun')
      setSubmitting(false)
      return
    }

    try {
      // Upload logo first if exists
      let logoUrl: string | null = null
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile)
        if (!logoUrl) {
          setError('Logo yüklenirken bir hata oluştu. Lütfen tekrar deneyin.')
          setSubmitting(false)
          return
        }
      }

      const formDataToSend = new FormData()
      formDataToSend.append('companyName', formData.companyName)
      formDataToSend.append('companySector', formData.companySector)
      formDataToSend.append('companyDescription', formData.companyDescription)
      formDataToSend.append('fullName', formData.fullName)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('message', formData.message)
      
      if (logoUrl) {
        formDataToSend.append('companyLogo', logoUrl)
      }

      const response = await fetch('/api/company-requests', {
        method: 'POST',
        body: formDataToSend
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Şirket kayıt talebiniz başarıyla gönderildi! Admin onayından sonra size e-posta gönderilecektir.')
        // Reset form
        setFormData({
          companyName: '',
          companySector: '',
          companyDescription: '',
          fullName: '',
          email: '',
          phone: '',
          message: ''
        })
        setLogoPreview(null)
        setLogoFile(null)
        // Reset file input
        const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')
        if (fileInput) {
          fileInput.value = ''
        }
      } else {
        setError(data.error || 'Bir hata oluştu. Lütfen tekrar deneyin.')
      }
    } catch (err) {
      console.error(err)
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Ana Sayfaya Dön
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Şirket Kayıt Talebi
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Şirketinizi platforma eklemek için kayıt talebi oluşturun. 
            Talebiniz admin onayından sonra aktif hale gelecektir.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Şirket Bilgileri */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                Şirket Bilgileri
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Şirket Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Örn: ABC Şirketi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sektör <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.companySector}
                    onChange={(e) => setFormData({ ...formData, companySector: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  >
                    <option value="">Sektör Seçin</option>
                    {sectors.map((sector) => (
                      <option key={sector.id} value={sector.name}>
                        {sector.name}
                      </option>
                    ))}
                    {sectors.length === 0 && (
                      <option value="">Sektörler yükleniyor...</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Şirket Açıklaması
                </label>
                <textarea
                  value={formData.companyDescription}
                  onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                  placeholder="Şirketiniz hakkında kısa bir açıklama yazın..."
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Şirket Logosu
                </label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <p className="text-xs text-gray-500 mt-2">Maksimum 5MB, JPG, PNG veya GIF formatında</p>
                  </div>
                  {logoPreview && (
                    <div className="flex-shrink-0">
                      <img 
                        src={logoPreview} 
                        alt="Logo önizleme" 
                        className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                İletişim Bilgileri
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ad Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Adınız ve Soyadınız"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    E-posta Adresi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="+90 555 123 45 67"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ek Mesaj
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                  placeholder="Eklemek istediğiniz başka bilgiler varsa buraya yazabilirsiniz..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6">
              <Link
                href="/"
                className="px-8 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all text-center"
              >
                İptal
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Gönderiliyor...
                  </span>
                ) : (
                  'Talebi Gönder'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-indigo-50 border-l-4 border-indigo-500 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-indigo-900 mb-2">Bilgilendirme</h3>
              <ul className="text-sm text-indigo-800 space-y-1">
                <li>• Şirket kayıt talebiniz admin onayından sonra aktif hale gelecektir</li>
                <li>• Onay süreci genellikle 1-2 iş günü sürmektedir</li>
                <li>• Onaylandığınızda e-posta adresinize bildirim gönderilecektir</li>
                <li>• Onay sonrası şirket panelinize giriş yapabilir ve şikayetleri yönetebilirsiniz</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

