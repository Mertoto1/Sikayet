import { prisma } from '@/lib/db'
import Link from 'next/link'

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic'

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ q?: string; sector?: string }> }) {
    const params = await searchParams
    const query = params.q
    // Hardcode sector to "Bahis & Şans Oyunları" (ID: 6)
    const sectorId = '6'

    const companies = await prisma.company.findMany({
        where: {
            name: query ? { contains: query } : undefined,
            sectorId: parseInt(sectorId),
            isApproved: true
        },
        include: {
            sector: true,
            _count: { select: { complaints: true } }
        },
        take: 100
    })

    // Only show the "Bahis & Şans Oyunları" sector in filters
    const sectors = await prisma.sector.findMany({
        where: {
            id: 6
        },
        orderBy: { name: 'asc' }
    })

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Hero Section - Daha sade ve modern */}
            <div className="bg-white border-b border-gray-100 py-12">
                <div className="container px-4 mx-auto">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-2">
                            {companies.length} Marka Listeleniyor
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                            Markaları Keşfedin
                        </h1>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            Aradığınız markayı bulun, şikayetleri inceleyin veya kendi deneyiminizi paylaşın.
                        </p>
                        
                        {/* Modern Search Bar */}
                        <div className="relative max-w-xl mx-auto mt-8 group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <form>
                                <input 
                                    name="q" 
                                    defaultValue={query} 
                                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-0 text-gray-900 rounded-2xl ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6" 
                                    placeholder="Marka adı ile arama yapın..." 
                                />
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container px-4 mx-auto py-12">
                {/* Sector Filters - Only show Bahis & Şans Oyunları */}
                <div className="flex overflow-x-auto pb-6 gap-3 mb-6 no-scrollbar mask-gradient">
                    {sectors.map((sector: any) => (
                        <Link 
                            key={sector.id}
                            href={`/companies?sector=${sector.id}`}
                            className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                sectorId == sector.id 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-indigo-600 ring-1 ring-gray-200'
                            }`}
                        >
                            {sector.name}
                        </Link>
                    ))}
                </div>

                {/* Companies Grid - RESİMDEKİ GİBİ GENİŞ KARTLAR */}
                {/* xl:grid-cols-3 yaparak kartları daha geniş hale getirdik */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {companies.map((company: any) => (
                        <Link 
                            key={company.id} 
                            href={`/companies/${company.slug}`} 
                            className="group relative bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                        >
                            {/* Üst Kısım: Logo ve Bilgiler */}
                            <div className="flex items-start gap-5">
                                {/* Logo Alanı - Resimdeki gibi kare ve renkli */}
                                <div className="w-[88px] h-[88px] flex-shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-indigo-100 shadow-lg">
                                    {company.logoUrl ? (
                                        <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain p-2 rounded-2xl" />
                                    ) : (
                                        <span>{company.name.substring(0, 2).toUpperCase()}</span>
                                    )}
                                </div>

                                {/* Bilgi Alanı */}
                                <div className="flex-1 min-w-0 pt-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">
                                        {company.name}
                                    </h3>
                                    <p className="text-indigo-600 text-sm font-medium mb-3">
                                        {company.sector?.name}
                                    </p>
                                    
                                    {/* İstatistik Hapları (Chips) */}
                                    <div className="flex flex-wrap gap-2">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                            </svg>
                                            {company._count.complaints} şikayet
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold">
                                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            4.8
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Alt Kısım: Aksiyon Butonu */}
                            <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-50">
                                <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                                    Profili İncele
                                </span>
                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-45">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty State */}
                {companies.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 mt-8">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Marka Bulunamadı</h3>
                        <p className="text-gray-500 mb-6">Arama kriterlerinize uygun bir sonuç bulunamadı.</p>
                        <Link href="/companies" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                            Tüm Markaları Listele
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}