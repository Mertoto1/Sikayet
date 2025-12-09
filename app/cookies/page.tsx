export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 md:py-24">
                <div className="container px-4 max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        <span className="text-sm font-medium">Cookie Policy</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Çerez Politikası</h1>
                    <p className="text-xl md:text-2xl text-indigo-100">
                        Çerezleri nasıl kullandığımızı öğrenin
                    </p>
                    <p className="text-sm text-indigo-200 mt-4">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
                </div>
            </div>

            <div className="container px-4 py-12 md:py-16 max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Çerez Nedir?</h2>
                    <p className="text-gray-600 mb-6">
                        Çerezler (cookies), web sitelerini ziyaret ettiğinizde cihazınıza (bilgisayar, tablet, telefon) kaydedilen 
                        küçük metin dosyalarıdır. Çerezler, web sitesinin sizi hatırlamasına ve deneyiminizi kişiselleştirmesine yardımcı olur.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Çerez Türleri</h2>
                    
                    <div className="space-y-4 mb-8">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-r-xl">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">1. Zorunlu Çerezler</h3>
                                    <p className="text-gray-600 mb-2">
                                        Web sitesinin çalışması için gerekli çerezlerdir. Bu çerezler olmadan site düzgün çalışmaz.
                                    </p>
                                    <p className="text-sm text-gray-500 italic">
                                        Örnek: Oturum yönetimi, güvenlik, form gönderimi
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">2. Analitik Çerezler</h3>
                                    <p className="text-gray-600 mb-2">
                                        Ziyaretçilerin siteyi nasıl kullandığını anlamamıza yardımcı olur. Hizmeti geliştirmek için kullanılır.
                                    </p>
                                    <p className="text-sm text-gray-500 italic">
                                        Örnek: Google Analytics, sayfa görüntüleme sayısı, ziyaret süresi
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-6 rounded-r-xl">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                                </svg>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">3. Fonksiyonel Çerezler</h3>
                                    <p className="text-gray-600 mb-2">
                                        Tercihlerinizi hatırlar ve kişiselleştirilmiş deneyim sunar.
                                    </p>
                                    <p className="text-sm text-gray-500 italic">
                                        Örnek: Dil tercihi, tema seçimi, kullanıcı ayarları
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 p-6 rounded-r-xl">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">4. Pazarlama Çerezleri</h3>
                                    <p className="text-gray-600 mb-2">
                                        Size özel reklamlar göstermek için kullanılır. Bu çerezleri reddetebilirsiniz.
                                    </p>
                                    <p className="text-sm text-gray-500 italic">
                                        Örnek: Hedeflenmiş reklamlar, yeniden pazarlama
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Kullandığımız Çerezler</h2>
                    <div className="overflow-x-auto mb-8">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Çerez Adı</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tür</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Süre</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amaç</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">session_id</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Zorunlu</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Oturum</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">Kullanıcı oturumunu yönetir</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">csrf_token</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Zorunlu</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Oturum</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">Güvenlik için</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">preferences</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Fonksiyonel</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">1 yıl</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">Kullanıcı tercihlerini saklar</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">_ga</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Analitik</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">2 yıl</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">Google Analytics</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">Çerezleri Nasıl Kontrol Ederim?</h2>
                    <p className="text-gray-600 mb-4">
                        Çerez tercihlerinizi tarayıcı ayarlarınızdan yönetebilirsiniz:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-2">🌐 Chrome</h4>
                            <p className="text-sm text-gray-600">Ayarlar → Gizlilik ve güvenlik → Çerezler</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-2">🦊 Firefox</h4>
                            <p className="text-sm text-gray-600">Seçenekler → Gizlilik ve Güvenlik</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-2">🧭 Safari</h4>
                            <p className="text-sm text-gray-600">Tercihler → Gizlilik → Çerezler</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-2">🌊 Edge</h4>
                            <p className="text-sm text-gray-600">Ayarlar → Çerezler ve site izinleri</p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-xl mb-8">
                        <div className="flex gap-3">
                            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Önemli Not</h4>
                                <p className="text-sm text-gray-600">
                                    Zorunlu çerezleri devre dışı bırakırsanız, web sitesinin bazı özellikleri düzgün çalışmayabilir. 
                                    Analitik ve pazarlama çerezlerini istediğiniz zaman reddedebilirsiniz.
                                </p>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">İletişim</h2>
                    <p className="text-gray-600 mb-4">
                        Çerez politikamız hakkında sorularınız için:
                    </p>
                    <div className="bg-gray-50 p-6 rounded-xl">
                        <p className="text-gray-700"><strong>E-posta:</strong> privacy@sikayetvar.example</p>
                        <p className="text-gray-700 mt-2"><strong>Telefon:</strong> +90 (212) 000 00 00</p>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <h3 className="text-2xl font-bold mb-2">Şeffaflık Önceliğimiz</h3>
                    <p className="text-indigo-100">
                        Çerezleri nasıl kullandığımız konusunda şeffaf olmaya ve size kontrol sağlamaya önem veriyoruz.
                    </p>
                </div>
            </div>
        </div>
    )
}
