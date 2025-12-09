export default function PartnerPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <div className="container px-4 max-w-5xl mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="text-sm font-medium">Kurumsal Çözümler</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">Marka Üyeliği</h1>
                        <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto">
                            Müşterilerinizle doğrudan iletişim kurun, şikayetleri yönetin ve marka itibarınızı güçlendirin
                        </p>
                    </div>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="container px-4 py-12 md:py-16 max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Neden Marka Üyesi Olmalısınız?</h2>
                    <p className="text-lg text-gray-600">Platformumuz size birçok avantaj sunuyor</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Doğrudan İletişim</h3>
                        <p className="text-gray-600">
                            Müşterilerinizin şikayetlerine hızlıca yanıt verin ve sorunları çözerek memnuniyeti artırın.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Analitik ve Raporlama</h3>
                        <p className="text-gray-600">
                            Detaylı istatistiklerle müşteri geri bildirimlerini analiz edin ve hizmet kalitenizi artırın.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Marka İtibarı</h3>
                        <p className="text-gray-600">
                            Aktif yanıt verme oranınızı göstererek potansiyel müşterilere güven verin.
                        </p>
                    </div>
                </div>

                {/* Features List */}
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Özellikler</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">Özel Marka Profili</h4>
                                <p className="text-sm text-gray-600">Logo, açıklama ve iletişim bilgilerinizle özelleştirilebilir profil</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">Anlık Bildirimler</h4>
                                <p className="text-sm text-gray-600">Yeni şikayetler için e-posta ve SMS bildirimleri</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">Çoklu Kullanıcı Desteği</h4>
                                <p className="text-sm text-gray-600">Ekibinizdeki birden fazla kişiye erişim izni tanımlayın</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">Yanıt Şablonları</h4>
                                <p className="text-sm text-gray-600">Sık kullanılan yanıtlarınızı şablon olarak kaydedin</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">Performans Metrikleri</h4>
                                <p className="text-sm text-gray-600">Yanıt süresi, çözüm oranı ve müşteri memnuniyeti istatistikleri</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">API Entegrasyonu</h4>
                                <p className="text-sm text-gray-600">Kendi sistemlerinizle entegre edin</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Başlangıç</h3>
                        <p className="text-gray-600 mb-6">Küçük işletmeler için</p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-gray-900">₺499</span>
                            <span className="text-gray-600">/ay</span>
                        </div>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2 text-gray-600">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>50 şikayete kadar</span>
                            </li>
                            <li className="flex items-center gap-2 text-gray-600">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>1 kullanıcı</span>
                            </li>
                            <li className="flex items-center gap-2 text-gray-600">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Temel istatistikler</span>
                            </li>
                        </ul>
                        <button className="w-full px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition">
                            Başlayın
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 border-2 border-indigo-600 transform scale-105 relative">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                            Popüler
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Profesyonel</h3>
                        <p className="text-indigo-100 mb-6">Büyüyen işletmeler için</p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-white">₺999</span>
                            <span className="text-indigo-100">/ay</span>
                        </div>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2 text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Sınırsız şikayet</span>
                            </li>
                            <li className="flex items-center gap-2 text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>5 kullanıcı</span>
                            </li>
                            <li className="flex items-center gap-2 text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Gelişmiş analitik</span>
                            </li>
                            <li className="flex items-center gap-2 text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Öncelikli destek</span>
                            </li>
                        </ul>
                        <button className="w-full px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition">
                            Başlayın
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Kurumsal</h3>
                        <p className="text-gray-600 mb-6">Büyük organizasyonlar için</p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-gray-900">Özel</span>
                        </div>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2 text-gray-600">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Sınırsız her şey</span>
                            </li>
                            <li className="flex items-center gap-2 text-gray-600">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>API erişimi</span>
                            </li>
                            <li className="flex items-center gap-2 text-gray-600">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Özel eğitim</span>
                            </li>
                            <li className="flex items-center gap-2 text-gray-600">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>7/24 destek</span>
                            </li>
                        </ul>
                        <button className="w-full px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition">
                            İletişime Geçin
                        </button>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 md:p-12 text-white text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Hemen Başlayın</h2>
                    <p className="text-xl text-indigo-100 mb-8">
                        30 gün ücretsiz deneme ile tüm özellikleri keşfedin. Kredi kartı gerekmez.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/contact" className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition">
                            Demo Talep Edin
                        </a>
                        <a href="/partner-login" className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-400 transition border-2 border-white">
                            Giriş Yapın
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
