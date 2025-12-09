'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface ComplaintSliderProps {
  title: string
  complaints: any[]
  variant: 'purple' | 'emerald'
  viewAllLink: string
}

export default function ComplaintSlider({ title, complaints, variant, viewAllLink }: ComplaintSliderProps) {
  // Hook'lar
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Veri kontrolü
  const hasComplaints = complaints && complaints.length > 0
  const nextIndex = hasComplaints ? (currentIndex + 1) % complaints.length : 0
  const prevIndex = hasComplaints ? (currentIndex - 1 + complaints.length) % complaints.length : 0

  // Otomatik Kaydırma
  useEffect(() => {
    if (!hasComplaints) return
    resetTimeout()
    timeoutRef.current = setTimeout(() => handleNext(), 4000)
    return () => resetTimeout()
  }, [currentIndex, hasComplaints])

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const handleNext = () => {
    if (!hasComplaints || isTransitioning) return
    setIsTransitioning(true)
    setDirection('next')
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === complaints.length - 1 ? 0 : prev + 1))
      setIsTransitioning(false)
    }, 300)
  }

  const handlePrev = () => {
    if (!hasComplaints || isTransitioning) return
    setIsTransitioning(true)
    setDirection('prev')
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? complaints.length - 1 : prev - 1))
      setIsTransitioning(false)
    }, 300)
  }

  if (!hasComplaints) return null

  // TEMA AYARLARI (Görseldeki Renkler)
  const themes = {
    purple: {
      wrapperBg: 'bg-[#5D5FEF]', // Ana Mor
      navBtn: 'border-white/30 text-white hover:bg-white/20',
      activeCard: 'bg-white shadow-2xl border-none',
      activeText: {
        title: 'text-gray-900',
        content: 'text-gray-600',
        meta: 'text-gray-500',
        brand: 'text-[#5D5FEF]'
      },
      ghostCard: 'bg-transparent border border-white/30',
      ghostText: {
        title: 'text-white',
        content: 'text-indigo-100',
        meta: 'text-indigo-200',
        brand: 'text-white'
      }
    },
    emerald: {
      wrapperBg: 'bg-[#00C896]', // Ana Yeşil
      navBtn: 'border-white/30 text-white hover:bg-white/20',
      activeCard: 'bg-white shadow-2xl border-none',
      activeText: {
        title: 'text-gray-900',
        content: 'text-gray-600',
        meta: 'text-gray-500',
        brand: 'text-[#00C896]'
      },
      ghostCard: 'bg-transparent border border-white/30',
      ghostText: {
        title: 'text-white',
        content: 'text-emerald-50',
        meta: 'text-emerald-100',
        brand: 'text-white'
      }
    }
  }

  const theme = themes[variant]

  // KART BİLEŞENİ
  const Card = ({ data, type }: { data: any, type: 'active' | 'ghost' | 'entering' | 'exiting' }) => {
    const isGhost = type === 'ghost'
    const colors = isGhost ? theme.ghostText : theme.activeText
    const cardStyle = isGhost ? theme.ghostCard : theme.activeCard

    // Animation classes
    let animationClasses = ""
    if (type === 'entering') {
      animationClasses = direction === 'next' 
        ? "animate__animated animate__fadeInRight animate__faster" 
        : "animate__animated animate__fadeInLeft animate__faster"
    } else if (type === 'exiting') {
      animationClasses = direction === 'next' 
        ? "animate__animated animate__fadeOutLeft animate__faster" 
        : "animate__animated animate__fadeOutRight animate__faster"
    }

    return (
      <article className={`h-[320px] md:h-[300px] flex flex-col justify-between p-6 md:p-8 rounded-[2rem] transition-all duration-500 ${cardStyle} ${animationClasses}`}>
        {/* Header: Profil */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden ${isGhost ? 'bg-white/20 text-white' : 'bg-[#EAF4FF] text-[#0088CC]'}`}>
                {data.user.avatar ? (
                   <img src={data.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                   <span>{data.user.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              <div>
                <div className={`font-bold ${colors.title}`}>{data.user.name}</div>
                <div className={`flex items-center gap-2 text-xs ${colors.meta} font-medium`}>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    {data.viewCount}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <div className={`flex items-center gap-1 text-xs font-bold ${isGhost ? 'text-white' : 'text-[#00C896]'}`}>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
                <span>{data.responses.length} Yorum</span>
              </div>
              {/* Status Badge */}
              {!isGhost && data.status && (
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                  data.status === 'SOLVED' ? 'bg-green-100 text-green-800' :
                  data.status === 'ANSWERED' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {data.status === 'SOLVED' ? 'Çözüldü' : 
                   data.status === 'ANSWERED' ? 'Yanıtlandı' : 
                   data.status === 'PUBLISHED' ? 'Yayında' : data.status}
                </span>
              )}
            </div>
          </div>

          <Link href={`/complaints/${data.id}`} className="group block">
            <h3 className={`text-xl font-bold mb-3 line-clamp-2 leading-snug ${colors.title} ${!isGhost && 'group-hover:text-indigo-600 transition-colors'}`}>
              {data.title}
            </h3>
            {!isGhost && (
              <p className={`text-sm line-clamp-2 leading-relaxed ${colors.content}`}>
                {data.content}
              </p>
            )}
            {isGhost && (
               <div className="h-10 w-3/4 bg-white/10 rounded animate-pulse mt-2"></div>
            )}
          </Link>
        </div>

        {/* Footer: Marka */}
        <div className={`pt-4 border-t flex items-center justify-between mt-auto ${isGhost ? 'border-white/20' : 'border-gray-100'}`}>
          <Link href={`/companies/${data.company.slug}`} className={`flex items-center gap-2 font-bold ${colors.brand}`}>
            <svg className="w-5 h-5 transform -scale-x-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
            {data.company.name}
          </Link>
          {!isGhost && (
             <span className="bg-[#00C896] text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm tracking-wide">PRO</span>
          )}
        </div>
      </article>
    )
  }

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* ÜST BAŞLIK & OKLAR - Sağ tarafa taşındı */}
        <div className="flex justify-between items-end mb-4 md:mb-0 md:justify-end md:mt-6 z-20 w-full">
           <div className="md:hidden">
             <h2 className="text-2xl md:text-3xl font-bold text-gray-600 tracking-tight">{title}</h2>
           </div>
           <div className="hidden md:block">
             <h2 className="text-2xl md:text-3xl font-bold text-gray-600 tracking-tight">{title}</h2>
           </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch">
          {/* SOL TARAF: RENKLİ ALAN */}
          <div className={`w-full md:w-[75%] ${theme.wrapperBg} rounded-[2.5rem] md:rounded-tr-[5rem] md:rounded-br-[2.5rem] md:rounded-l-none p-6 md:p-12 pb-16 relative overflow-visible shadow-xl`}>
            
            {/* Navigasyon Butonları (Renkli Alanın İçinde Üstte) */}
            <div className="flex justify-end gap-3 mb-6 md:absolute md:top-10 md:right-12 z-30">
              <button onClick={handlePrev} className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${theme.navBtn}`} disabled={isTransitioning}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={handleNext} className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${theme.navBtn}`} disabled={isTransitioning}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            
            {/* KARTLAR */}
            <div className="flex gap-6 md:gap-8 mt-4 md:mt-10 relative z-10">
              
              {/* AKTİF KART (BEYAZ) - Sola Taşar */}
              <div className="w-full md:w-[75%] flex-shrink-0 md:-ml-24 relative z-20">
                 <div className="transform transition-all duration-500 hover:-translate-y-1">
                    <Card data={complaints[currentIndex]} type="active" />
                 </div>
              </div>

              {/* GHOST KART (ŞEFFAF) - Sağda durur */}
              <div className="hidden md:block w-full md:w-[75%] flex-shrink-0 opacity-100">
                 <div className="transform scale-95 origin-left">
                    <Card data={complaints[nextIndex]} type="ghost" />
                 </div>
              </div>

            </div>

             {/* Dekoratif Daireler */}
             <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/10 rounded-full pointer-events-none"></div>
             <div className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full pointer-events-none blur-xl"></div>
          
          </div>

          {/* SAĞ BOŞLUK (Başlık hizası için) */}
          <div className="hidden md:block w-[35%]"></div>
        </div>
      </div>
      
      {/* Add animate.css for animations */}
      <style jsx>{`
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translate3d(100%, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translate3d(-100%, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes fadeOutLeft {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
            transform: translate3d(-100%, 0, 0);
          }
        }
        @keyframes fadeOutRight {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
            transform: translate3d(100%, 0, 0);
          }
        }
        .animate__animated {
          animation-duration: 0.3s;
          animation-fill-mode: both;
        }
        .animate__faster {
          animation-duration: 0.3s;
        }
        .animate__fadeInRight {
          animation-name: fadeInRight;
        }
        .animate__fadeInLeft {
          animation-name: fadeInLeft;
        }
        .animate__fadeOutLeft {
          animation-name: fadeOutLeft;
        }
        .animate__fadeOutRight {
          animation-name: fadeOutRight;
        }
      `}</style>
    </div>
  )
}