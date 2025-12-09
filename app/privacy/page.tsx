export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 md:py-24">
                <div className="container px-4 max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-sm font-medium">KVKK Uyumlu</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Gizlilik Politikası</h1>
                    <p className="text-xl md:text-2xl text-indigo-100">
                        Verileriniz bizim için değerlidir
                    </p>
                    <p className="text-sm text-indigo-200 mt-4">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
                </div>
            </div>

            <div className="container px-4 py-12 md:py-16 max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
                    <div className="prose max-w-none">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Veri Toplama ve Kullanım</h2>
                        <p className="text-gray-600 mb-6">
                            Platformumuz, size daha iyi hizmet verebilmek için bazı kişisel verilerinizi toplar ve işler. 
                            Toplanan veriler aşağıdaki amaçlarla kullanılır:
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-600">Hesap oluşturma ve yönetme</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-600">Şikayet paylaşımı ve takibi</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-600">İletişim ve destek sağlama</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-600">Platform güvenliğini sağlama</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-600">Hizmet kalitesini iyileştirme</span>
                            </li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Toplanan Bilgiler</h2>
                        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-r-xl mb-8">
                            <h3 className="font-bold text-gray-900 mb-3">Kişisel Bilgiler:</h3>
                            <p className="text-gray-600 mb-2">Ad, soyad, e-posta adresi, telefon numarası</p>
                            
                            <h3 className="font-bold text-gray-900 mb-3 mt-4">Kullanım Bilgileri:</h3>
                            <p className="text-gray-600 mb-2">IP adresi, tarayıcı türü, ziyaret edilen sayfalar, tıklama verileri</p>
                            
                            <h3 className="font-bold text-gray-900 mb-3 mt-4">İçerik Bilgileri:</h3>
                            <p className="text-gray-600">Paylaştığınız şikayetler, yorumlar ve yüklemeler</p>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Veri Güvenliği</h2>
                        <p className="text-gray-600 mb-6">
                            Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri alıyoruz:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                            <div className="bg-green-50 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span className="font-semibold text-gray-900">SSL Şifreleme</span>
                                </div>
                                <p className="text-sm text-gray-600">Tüm veri transferleri şifrelidir</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span className="font-semibold text-gray-900">Güvenli Depolama</span>
                                </div>
                                <p className="text-sm text-gray-600">Veriler güvenli sunucularda saklanır</p>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Veri Paylaşımı</h2>
                        <p className="text-gray-600 mb-4">
                            Kişisel verilerinizi üçüncü şahıslarla paylaşmayız. Sadece aşağıdaki durumlarda veri paylaşımı yapılabilir:
                        </p>
                        <ul className="space-y-2 mb-8">
                            <li className="flex items-start gap-2 text-gray-600">
                                <span className="text-indigo-600">•</span>
                                Yasal yükümlülükler gereği (mahkeme kararı vb.)
                            </li>
                            <li className="flex items-start gap-2 text-gray-600">
                                <span className="text-indigo-600">•</span>
                                Platform güvenliğini sağlamak için
                            </li>
                            <li className="flex items-start gap-2 text-gray-600">
                                <span className="text-indigo-600">•</span>
                                Açık rızanız ile
                            </li>
                        </ul>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Haklarınız</h2>
                        <p className="text-gray-600 mb-4">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl mb-8">
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    <span className="text-gray-700">Kişisel verilerinize erişim hakkı</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    <span className="text-gray-700">Düzeltme ve güncelleme hakkı</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    <span className="text-gray-700">Silme hakkı (unutulma hakkı)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    <span className="text-gray-700">Veri işlemeye itiraz hakkı</span>
                                </li>
                            </ul>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Çerezler (Cookies)</h2>
                        <p className="text-gray-600 mb-4">
                            Platformumuz deneyiminizi iyileştirmek için çerezler kullanır. Çerez tercihlerinizi 
                            tarayıcı ayarlarınızdan yönetebilirsiniz.
                        </p>
                        <p className="text-gray-600 mb-8">
                            Detaylı bilgi için <a href="/cookies" className="text-indigo-600 hover:underline font-semibold">Çerez Politikası</a> sayfamızı ziyaret edin.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. İletişim</h2>
                        <p className="text-gray-600 mb-4">
                            Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:
                        </p>
                        <div className="bg-gray-50 p-6 rounded-xl">
                            <p className="text-gray-700"><strong>E-posta:</strong> gizlilik@sikayetvar.example</p>
                            <p className="text-gray-700 mt-2"><strong>Telefon:</strong> +90 (212) 000 00 00</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <h3 className="text-2xl font-bold mb-2">Gizliliğiniz Bizim İçin Önemli</h3>
                    <p className="text-indigo-100">
                        Bu politika düzenli olarak güncellenir. Önemli değişiklikler için sizi bilgilendireceğiz.
                    </p>
                </div>
            </div>
        </div>
    )
}
