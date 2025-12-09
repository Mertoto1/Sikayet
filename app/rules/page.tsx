export default function RulesPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 md:py-24">
                <div className="container px-4 max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-sm font-medium">Platform Kuralları</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Topluluk Kuralları</h1>
                    <p className="text-xl md:text-2xl text-indigo-100">
                        Herkes için güvenli ve adil bir platform
                    </p>
                </div>
            </div>

            <div className="container px-4 py-12 md:py-16 max-w-4xl mx-auto">
                {/* General Rules */}
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        Genel Kurallar
                    </h2>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                                1
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Gerçek Deneyimler</h3>
                                <p className="text-gray-600">
                                    Sadece kendi yaşadığınız deneyimleri paylaşın. Yanıltıcı veya asılsız şikayetler 
                                    platformdan kaldırılacaktır.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                                2
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Saygılı İletişim</h3>
                                <p className="text-gray-600">
                                    Şikayetlerinizi kibar ve saygılı bir dille ifade edin. Küfür, hakaret veya 
                                    ayrımcılık içeren içerikler kabul edilmez.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                                3
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Detaylı Açıklama</h3>
                                <p className="text-gray-600">
                                    Şikayetinizi net ve anlaşılır şekilde açıklayın. Tarih, yer ve olay detayları 
                                    çözüm sürecini hızlandırır.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                                4
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Kişisel Bilgiler</h3>
                                <p className="text-gray-600">
                                    Kendinizin veya başkalarının kişisel bilgilerini (telefon, adres, TC kimlik vb.) 
                                    paylaşmayın.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                                5
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Doğru Kategori</h3>
                                <p className="text-gray-600">
                                    Şikayetinizi doğru şirket ve kategoride paylaşın. Yanlış kategorileme 
                                    çözüm sürecini geciktirebilir.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Prohibited Content */}
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        Yasak İçerikler
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <div>
                                <div className="font-semibold text-red-900">Spam ve Reklam</div>
                                <div className="text-sm text-red-700">Ticari amaçlı içerikler yasaktır</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <div>
                                <div className="font-semibold text-red-900">Hakaret ve Küfür</div>
                                <div className="text-sm text-red-700">Aşağılayıcı ifadeler kullanılamaz</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <div>
                                <div className="font-semibold text-red-900">Sahte İçerik</div>
                                <div className="text-sm text-red-700">Yanıltıcı bilgiler paylaşılamaz</div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <div>
                                <div className="font-semibold text-red-900">Siyasi İçerik</div>
                                <div className="text-sm text-red-700">Siyasi propaganda yasaktır</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Moderation */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 md:p-12 text-white">
                    <h2 className="text-2xl font-bold mb-4">Moderasyon Süreci</h2>
                    <p className="text-indigo-100 mb-4">
                        Tüm şikayetler yayınlanmadan önce moderatör ekibimiz tarafından incelenir. Bu süreç genellikle 24 saat içinde tamamlanır.
                    </p>
                    <p className="text-indigo-100">
                        Kurallara uymayan içerikler reddedilir ve tekrarlayan ihlallerde hesap askıya alınabilir veya kapatılabilir.
                    </p>
                </div>
            </div>
        </div>
    )
}
