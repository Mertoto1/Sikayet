import Link from 'next/link'
import { prisma } from '@/lib/db'
import ComplaintSliderPurple from '@/components/ComplaintSliderPurple'
import ComplaintSlider from '@/components/ComplaintSlider' 

export const revalidate = 0 // Dynamic

export default async function Home() {
  // Fetch settings for statistics
  const settings = await prisma.systemSetting.findMany()
  const settingsMap: any = {}
  settings.forEach((setting: any) => {
    settingsMap[setting.key] = setting.value
  })

  // Get setting with fallback
  const getSetting = (key: string, fallback: string) => {
    return settingsMap[key] || fallback
  }

  const latestComplaints = await prisma.complaint.findMany({
    where: { status: { in: ['PUBLISHED', 'SOLVED', 'ANSWERED'] } }, // Show all published complaints including solved ones
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: {
      company: { select: { name: true, slug: true, logoUrl: true } },
      user: { select: { name: true, avatar: true } },
      responses: true
    }
  })

  const resolvedComplaints = await prisma.complaint.findMany({
    where: { 
      status: { 
        in: ['SOLVED', 'ANSWERED'] 
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: {
      company: { select: { name: true, slug: true, logoUrl: true } },
      user: { select: { name: true, avatar: true } },
      responses: true
    }
  })

  // Fetch approved companies with solved complaints count
  const allCompanies = await prisma.company.findMany({
    where: { isApproved: true },
    include: {
      sector: { select: { name: true } },
      complaints: {
        where: {
          status: { in: ['SOLVED', 'ANSWERED'] }
        },
        select: { id: true }
      },
      _count: { 
        select: { 
          complaints: true,
        } 
      }
    }
  })

  // Sort by solved complaints count (descending), filter only companies with at least 1 solved complaint, and take top 4
  const companies = allCompanies
    .map(company => ({
      ...company,
      solvedCount: company.complaints.length
    }))
    .filter(company => company.solvedCount > 0) // Only show companies with actual solved complaints
    .sort((a, b) => b.solvedCount - a.solvedCount)
    .slice(0, 4)

  // Fetch latest company responses
  const latestResponses = await prisma.complaintResponse.findMany({
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: {
      complaint: {
        select: {
          title: true,
          id: true,
          company: {
            select: {
              name: true,
              slug: true
            }
          }
        }
      },
      company: {
        select: {
          name: true,
          logoUrl: true
        }
      }
    }
  })

  return (
    <div className="pb-20 bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 max-w-full">
          <div className="max-w-4xl mx-auto text-center w-full">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 sm:px-4 py-2 mb-4 sm:mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></span>
              <span className="text-xs sm:text-sm font-medium">Türkiye'nin En Güvenilir Şikayet Platformu</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 sm:mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100 px-2">
              Markalarla Sorun mu Yaşıyorsunuz?
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-indigo-100 mb-6 sm:mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed px-2">
              Sesinizi duyurun, çözüm bulun. Binlerce kullanıcı ve marka bu platformda buluşuyor.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link href="/complaints/new" className="group btn bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-8 py-4 rounded-full shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Şikayet Yaz
                </span>
              </Link>
              <Link href="/companies" className="btn bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 px-8 py-4 rounded-full transition-all duration-300 hover:scale-105">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Markaları Keşfet
                </span>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-indigo-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Ücretsiz Üyelik</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>7/24 Destek</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Hızlı Çözüm</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Overlay */}
      <section className="relative z-20 -mt-12 pb-6 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { 
                 val: getSetting('STAT_HAPPY_USERS', '100K+'), 
                 label: 'Mutlu Kullanıcı', 
                 color: 'from-indigo-500 to-purple-600', 
                 icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' 
               },
               { 
                 val: getSetting('STAT_SOLVED_COMPLAINTS', '50K+'), 
                 label: 'Çözülen Şikayet', 
                 color: 'from-emerald-400 to-green-600', 
                 icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' 
               },
               { 
                 val: getSetting('STAT_CORPORATE_BRANDS', '2000+'), 
                 label: 'Kurumsal Marka', 
                 color: 'from-blue-400 to-cyan-600', 
                 icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' 
               },
               { 
                 val: getSetting('STAT_SUCCESS_RATE', '%85'), 
                 label: 'Başarı Oranı', 
                 color: 'from-amber-400 to-orange-600', 
                 icon: 'M13 7l5 5m0 0l-5 5m5-5H6' 
               },
             ].map((stat, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-600">{stat.val}</h3>
                  <p className="text-gray-500 font-medium">{stat.label}</p>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Top Companies by Solved Complaints - Only show if there are companies with solved complaints */}
      {companies.length > 0 && (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-sm">En Başarılı Markalar</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">En Çok İşlem Çözen Markalar</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Müşteri memnuniyetini ön planda tutan, şikayetlerine hızlı çözüm bulan markalar</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {companies.map((company: any, index: number) => {
              const solvedPercentage = company._count.complaints > 0 
                ? Math.round((company.solvedCount / company._count.complaints) * 100) 
                : 0
              
              return (
                <Link 
                  key={company.id} 
                  href={`/companies/${company.slug}`}
                  className="group relative bg-white rounded-3xl overflow-hidden border border-gray-200 hover:border-indigo-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-row"
                >
                  {/* Top Badge for Top 4 */}
                  <div className={`absolute top-4 left-4 z-10 ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                    index === 2 ? 'bg-gradient-to-r from-amber-600 to-orange-600' :
                    'bg-gradient-to-r from-indigo-500 to-purple-600'
                  } text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg`}>
                    {index + 1}
                  </div>

                  {/* Logo Section with Gradient Background - Left Side */}
                  <div className="relative bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 p-8 flex-shrink-0 w-48 flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-28 h-28 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                        {company.logoUrl ? (
                          <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain p-3 rounded-2xl" />
                        ) : (
                          <span className="text-3xl font-bold text-white">{company.name.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Solved Count Badge */}
                    <div className="bg-emerald-500/20 backdrop-blur-sm border border-emerald-300/50 rounded-full px-4 py-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-white font-bold text-lg">{company.solvedCount}</span>
                        <span className="text-emerald-100 text-sm">Çözüldü</span>
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
                  </div>

                  {/* Content Section - Right Side */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-2xl text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-1">
                        {company.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {company.sector?.name || 'Genel'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Statistics */}
                    <div className="space-y-4">
                      {/* Solved Percentage */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 font-medium">Çözüm Oranı</span>
                          <span className="text-sm font-bold text-emerald-600">{solvedPercentage}%</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${solvedPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Total Complaints */}
                      <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>Toplam Şikayet</span>
                        </div>
                        <span className="font-bold text-gray-900">{company._count.complaints}</span>
                      </div>

                      {/* CTA Button */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-indigo-600 font-semibold group-hover:text-indigo-700">
                          Profili İncele
                        </span>
                        <svg className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/companies" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              Tüm Markaları Gör
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-600 mb-3">Nasıl Çalışır?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Şikayetinizi 3 kolay adımda iletin, çözüm sürecini takip edin</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Şikayetinizi Oluşturun',
                description: 'Marka, konu ve detayları girerek şikayetinizi oluşturun. Anonim olarak da paylaşabilirsiniz.',
                icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
              },
              {
                step: '02',
                title: 'Marka Yanıt Versin',
                description: 'Şikayetiniz markaya iletilir ve resmi yanıt vermesi beklenir. Süreci takip edebilirsiniz.',
                icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
              },
              {
                step: '03',
                title: 'Çözümü Takip Edin',
                description: 'Markanın verdiği yanıtı inceleyin ve çözüm sürecini değerlendirin. Başarı hikayeniz olabilir.',
                icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-6">
                  <span className="text-2xl font-bold">{item.step}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white mb-6 -mt-12 ml-auto">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* ŞİKAYETVAR TARZI SLIDERLAR (BEYAZ & GHOST CARD)          */}
      {/* ======================================================== */}

      {/* 1. Slider: Son Şikayetler (Mor Tema) */}
      <ComplaintSliderPurple 
        title="Son Şikayetler"
        complaints={latestComplaints}
        variant="purple"
        viewAllLink="/complaints"
      />

      {/* 2. Slider: Çözülen Başarı Hikayeleri (Yeşil Tema) */}
      <ComplaintSlider 
        title="Çözülen Başarı Hikayeleri"
        complaints={resolvedComplaints}
        variant="emerald"
        viewAllLink="/complaints?status=SOLVED"
      />

      {/* Latest Company Responses - Only show if there are responses */}
      {latestResponses.length > 0 && (
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-600 mb-3">Son Marka Yanıtları</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Markaların son verdiği resmi yanıtları inceleyin</p>
          </div>
          
          <div className={`grid gap-8 justify-center ${
            latestResponses.length === 1 ? 'grid-cols-1 max-w-md' :
            latestResponses.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl'
          } mx-auto`}>
            {latestResponses.map((response: any) => (
              <div key={response.id} className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Company Header with Gradient */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5 relative">
                  <div className="flex items-center gap-3">
                    {response.company.logoUrl ? (
                      <img src={response.company.logoUrl} alt={response.company.name} className="w-12 h-12 rounded-xl object-cover border-2 border-white/30" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center border-2 border-white/30">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-white truncate">{response.company.name}</h3>
                      <p className="text-indigo-100 text-sm">Yanıtladı</p>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                </div>
                
                {/* Response Content */}
                <div className="p-6">
                  <Link href={`/complaints/${response.complaint.id}`} className="block h-full flex flex-col">
                    <h4 className="font-bold text-gray-900 mb-3 line-clamp-2 hover:text-indigo-600 transition-colors">
                      {response.complaint.title}
                    </h4>
                    <p className="text-gray-600 text-sm flex-grow line-clamp-4 mb-4">
                      {response.message}
                    </p>
                    <div className="mt-auto">
                      <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm group">
                        Detayları gör
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link href="/complaints" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              Tüm Şikayetleri Gör
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-600 mb-3">Neden Bizi Tercih Etmelisiniz?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Şeffaf, güvenilir ve etkili şikayet çözümleme platformu</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Şeffaflık',
                description: 'Tüm süreçler açık ve izlenebilir. Şikayetleriniz kimseye gizli kalmaz.',
                icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
              },
              {
                title: 'Hızlı Çözüm',
                description: 'Markalarla doğrudan iletişim kurarak hızlı çözüm süreci sağlıyoruz.',
                icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              },
              {
                title: 'Topluluk Desteği',
                description: 'Binlerce kullanıcımız şikayetlerinizi destekliyor, markalara baskı oluşturuyor.',
                icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
              },
              {
                title: 'Veri Güvenliği',
                description: 'Kişisel bilgileriniz en yüksek güvenlik standartlarıyla korunmaktadır.',
                icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-5">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}