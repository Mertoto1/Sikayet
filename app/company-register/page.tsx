'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CompanyRegisterPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    position: ''
  });
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies/public');
      const data = await response.json();
      console.log('Companies API response:', data);
      if (response.ok) {
        setCompanies(data.companies);
        console.log('Companies loaded:', data.companies.length);
        
        // Check if Otobet is in the list
        const otobet = data.companies.find((c: any) => c.name.toLowerCase().includes('otobet'));
        console.log('Otobet found:', otobet);
        
        // Log all company names for debugging
        console.log('All company names:', data.companies.map((c: any) => c.name));
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset error when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleCompanyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, companyName: value }));
    
    console.log('Input value:', value);
    console.log('Available companies:', companies.length);
    
    if (value.length > 0) {
      const filtered = companies.filter(company => 
        company.name.toLowerCase().includes(value.toLowerCase())
      );
      console.log('Filtered companies:', filtered);
      setFilteredCompanies(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredCompanies([]);
      setShowSuggestions(false);
    }
  };

  const handleCompanySelect = (company: any) => {
    setFormData(prev => ({ ...prev, companyName: company.name }));
    setSelectedCompany(company);
    setShowSuggestions(false);
    setFilteredCompanies([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setSubmitting(false);
      return;
    }

    // Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.position || !formData.phone) {
      setError('Lütfen tüm gerekli alanları doldurun');
      setSubmitting(false);
      return;
    }

    if (!formData.companyName && !selectedCompany) {
      setError('Lütfen bir şirket adı girin veya mevcut bir şirket seçin');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/company-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          companyName: selectedCompany ? undefined : formData.companyName,
          companyId: selectedCompany ? selectedCompany.id : undefined,
          position: formData.position
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresVerification) {
          // Store user ID in localStorage for verification
          localStorage.setItem('pendingVerificationUserId', data.userId.toString());
          localStorage.setItem('pendingVerificationEmail', formData.email);
          // Show success message and redirect
          setSuccess('Başvurunuz başarıyla alındı! Yönlendiriliyorsunuz...');
          setTimeout(() => {
            router.push('/verify-email');
          }, 1500);
        } else {
          setSuccess('Başvurunuz alınmıştır. Onaylandığında e-posta ile bilgilendirileceksiniz.');
          // Reset form
          setFormData({
            fullName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            companyName: '',
            position: ''
          } as typeof formData);
          setSelectedCompany(null);
        }
      } else {
        setError(data.error || 'Başvuru gönderilirken bir hata oluştu');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="max-w-md">
            <div className="mb-8">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-4">Şirket Üyeliği</h1>
              <p className="text-xl text-indigo-100 mb-8">Müşterilerinizle doğrudan iletişim kurun ve marka itibarınızı güçlendirin.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Müşteri İletişimi</h3>
                  <p className="text-sm text-indigo-200">Müşterilerinizin şikayetlerine hızlıca yanıt verin</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">İstatistikler</h3>
                  <p className="text-sm text-indigo-200">Detaylı analizlerle hizmet kalitenizi artırın</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Marka İtibarı</h3>
                  <p className="text-sm text-indigo-200">Aktif yanıt verme oranınızla güven oluşturun</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-3xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Şirket Hesabı Başvurusu</h2>
              <p className="text-gray-600 mb-4">
                Müşterilerinizle doğrudan iletişim kurun ve marka itibarınızı güçlendirin.
              </p>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <p className="text-sm text-indigo-800 mb-2">
                  <strong>Yeni şirket mi kaydetmek istiyorsunuz?</strong>
                </p>
                <Link 
                  href="/company-request" 
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition inline-flex items-center gap-1"
                >
                  Şirket Kayıt Talebi Oluştur
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            
            {(error || success) && (
            <div className={`mb-6 p-4 rounded-xl text-sm ${error ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-green-50 border border-green-200 text-green-600'} flex items-center gap-2`}>
              {error ? (
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {error || success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Adınız Soyadınız"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  E-posta *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="ornek@sirket.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="05XX XXX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pozisyon *
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Departman/Pozisyon"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Şifre *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Şifre Tekrar *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Şirket Bilgileri</h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Şirket Adı *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleCompanyInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Şirket adını yazın"
                  />
                  
                  {/* Autocomplete Suggestions */}
                  {showSuggestions && filteredCompanies.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredCompanies.map((company) => (
                        <div
                          key={company.id}
                          onClick={() => handleCompanySelect(company)}
                          className="px-4 py-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{company.name}</div>
                              <div className="text-sm text-gray-500">{company.sector?.name}</div>
                            </div>
                            <div className="text-xs text-indigo-600 font-medium">
                              {company._count?.complaints || 0} şikayet
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Selected Company Indicator */}
                  {selectedCompany && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Mevcut şirket seçildi: {selectedCompany.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Önemli Bilgi</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Başvurunuz gönderildikten sonra sistem tarafından doğrulama yapılacaktır. 
                      Doğrulama kodu e-posta adresinize gönderilecektir. 
                      Ardından başvurunuz yönetici onayına sunulacaktır.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Üyelik oluşturuluyor...
                  </span>
                ) : (
                  'Başvuruyu Gönder'
                )}
              </button>
            </div>
          </form>

            <div className="mt-6 text-center border-t pt-6">
              <p className="text-gray-600 mb-3">Şirket üyesi misiniz?</p>
              <Link href="/company-login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition">
                Şirket Girişi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}