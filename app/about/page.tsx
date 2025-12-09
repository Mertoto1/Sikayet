export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 md:py-24">
                <div className="container px-4 max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Hakkımızda</h1>
                    <p className="text-xl md:text-2xl text-indigo-100">
                        Tüketicilerin sesi, markaların çözüm ortağı
                    </p>
                </div>
            </div>

            <div className="container px-4 py-12 md:py-16 max-w-5xl mx-auto">
                {/* Mission Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Misyonumuz</h2>
                    </div>
                    <p className="text-lg text-gray-600 leading-relaxed mb-4">
                        Platformumuz, tüketiciler ve markalar arasında şeffaf bir iletişim köprüsü kurmayı amaçlamaktadır. 
                        Tüketicilere seslerini duyurma fırsatı sunarken, markalara da müşteri memnuniyetini artırma ve 
                        hizmet kalitelerini geliştirme imkanı tanıyoruz.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        Her şikayetin ardında bir çözüm fırsatı olduğuna inanıyoruz. Bu sebeple, tüketicilerin 
                        haklarını savunurken markaların da gelişimine katkı sağlayan bir ekosistem oluşturuyoruz.
                    </p>
                </div>

                {/* Values Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Güvenilirlik</h3>
                        <p className="text-gray-600">
                            Tüm şikayetler doğrulama sürecinden geçer ve şeffaf bir şekilde yayınlanır.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Topluluk</h3>
                        <p className="text-gray-600">
                            Binlerce kullanıcımız deneyimlerini paylaşarak birbirlerine yardımcı oluyor.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Çözüm Odaklı</h3>
                        <p className="text-gray-600">
                            Markalar şikayetlere yanıt vererek sorunları hızlıca çözebilir.
                        </p>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 md:p-12 text-white">
                    <h2 className="text-3xl font-bold mb-8 text-center">Platformumuz Sayılarla</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div>
                            <div className="text-4xl font-bold mb-2">10K+</div>
                            <div className="text-indigo-200">Aktif Kullanıcı</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">5K+</div>
                            <div className="text-indigo-200">Kayıtlı Marka</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">50K+</div>
                            <div className="text-indigo-200">Paylaşılan Şikayet</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">85%</div>
                            <div className="text-indigo-200">Çözüm Oranı</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
