export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 md:py-24">
                <div className="container px-4 max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Kullanım Koşulları</h1>
                    <p className="text-xl md:text-2xl text-indigo-100">
                        Platformumuzu kullanarak bu koşulları kabul etmiş olursunuz
                    </p>
                    <p className="text-sm text-indigo-200 mt-4">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
                </div>
            </div>

            <div className="container px-4 py-12 md:py-16 max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Hizmetin Kapsamı</h2>
                    <p className="text-gray-600 mb-6">
                        Bu platform, tüketicilerin deneyimlerini paylaşabilecekleri ve markaların bu deneyimlere yanıt verebilecekleri 
                        bir çevrimiçi şikayet yönetim sistemidir. Platformu kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">2. Kullanıcı Sorumlulukları</h2>
                    <div className="space-y-4 mb-6">
                        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-xl">
                            <h3 className="font-bold text-gray-900 mb-2">2.1 Doğru Bilgi Verme</h3>
                            <p className="text-gray-600">
                                Kayıt sırasında ve şikayet paylaşımında doğru ve güncel bilgiler vermeyi taahhüt edersiniz.
                            </p>
                        </div>
                        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-xl">
                            <h3 className="font-bold text-gray-900 mb-2">2.2 Hesap Güvenliği</h3>
                            <p className="text-gray-600">
                                Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi kimseyle paylaşmamalı ve güvenli tutmalısınız.
                            </p>
                        </div>
                        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-xl">
                            <h3 className="font-bold text-gray-900 mb-2">2.3 İçerik Sorumluluğu</h3>
                            <p className="text-gray-600">
                                Paylaştığınız tüm içeriklerden siz sorumlusunuz. İçeriklerin yasal düzenlemelere uygun olması gerekmektedir.
                            </p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">3. Yasaklanan Davranışlar</h2>
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Sahte İçerik</h4>
                                    <p className="text-sm text-gray-600">Gerçek olmayan veya yanıltıcı bilgiler paylaşmak</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Manipülasyon</h4>
                                    <p className="text-sm text-gray-600">Sistemi manipüle etmek veya oy hakkını kötüye kullanmak</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Telif Hakkı İhlali</h4>
                                    <p className="text-sm text-gray-600">Başkalarının içeriklerini izinsiz kullanmak</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Spam</h4>
                                    <p className="text-sm text-gray-600">Gereksiz veya tekrarlayan içerikler göndermek</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">4. Fikri Mülkiyet Hakları</h2>
                    <p className="text-gray-600 mb-4">
                        Platformun tasarımı, kodu, logosu ve diğer tüm içerikleri üzerindeki haklar platform sahibine aittir. 
                        İzinsiz kullanım, kopyalama veya dağıtım yasaktır.
                    </p>
                    <p className="text-gray-600 mb-6">
                        Siz, paylaştığınız içeriklerin telif hakkına sahip olduğunuzu veya paylaşma hakkınız olduğunu garanti edersiniz.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">5. Hizmet Değişiklikleri ve Sonlandırma</h2>
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-xl mb-6">
                        <p className="text-gray-700 mb-3">
                            <strong>Hizmet Değişiklikleri:</strong> Platform, önceden bildirimde bulunmaksızın hizmetleri değiştirme, 
                            askıya alma veya sonlandırma hakkını saklı tutar.
                        </p>
                        <p className="text-gray-700">
                            <strong>Hesap Sonlandırma:</strong> Kullanım koşullarını ihlal eden hesaplar uyarı yapılarak veya 
                            yapılmadan askıya alınabilir veya kapatılabilir.
                        </p>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">6. Sorumluluk Reddi</h2>
                    <ul className="space-y-3 mb-6">
                        <li className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-600">
                                Platform, kullanıcıların paylaştığı içeriklerin doğruluğunu garanti etmez
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-600">
                                Kullanıcılar arasındaki anlaşmazlıklardan platform sorumlu değildir
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-600">
                                Hizmet kesintileri veya teknik hatalardan kaynaklanan zararlardan sorumlu değiliz
                            </span>
                        </li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">7. Uyuşmazlık Çözümü</h2>
                    <p className="text-gray-600 mb-6">
                        Bu koşullardan kaynaklanan uyuşmazlıklar öncelikle dostane yollarla çözülmeye çalışılacaktır. 
                        Anlaşma sağlanamazsa, İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">8. İletişim</h2>
                    <p className="text-gray-600 mb-4">
                        Kullanım koşulları hakkında sorularınız için:
                    </p>
                    <div className="bg-gray-50 p-6 rounded-xl">
                        <p className="text-gray-700"><strong>E-posta:</strong> legal@sikayetvar.example</p>
                        <p className="text-gray-700 mt-2"><strong>Adres:</strong> Örnek Mahallesi, Şikayet Sokak No: 123, 34000 İstanbul</p>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
                    <div className="flex items-start gap-4">
                        <svg className="w-12 h-12 flex-shrink-0 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Kullanım Koşullarını Kabul Ediyorum</h3>
                            <p className="text-indigo-100 text-sm">
                                Platformumuzu kullanarak bu kullanım koşullarını okuduğunuzu, anladığınızı ve kabul ettiğinizi 
                                beyan etmiş olursunuz. Bu koşullar zaman zaman güncellenebilir ve güncel hali sitede yayınlanır.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
