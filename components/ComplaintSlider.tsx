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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  
  // Animasyon için 'key' state'i. Bu değiştiğinde React DOM'u yeniler ve animasyonu tetikler.
  const [animKey, setAnimKey] = useState(0)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const hasComplaints = complaints && complaints.length > 0
  const nextIndex = hasComplaints ? (currentIndex + 1) % complaints.length : 0
  
  // Otomatik Kaydırma
  useEffect(() => {
    if (!hasComplaints) return
    resetTimeout()
    timeoutRef.current = setTimeout(() => handleNext(), 5000) // Süreyi biraz artırdım, kullanıcı okuyabilsin
    return () => resetTimeout()
  }, [currentIndex, hasComplaints])

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const handleNext = () => {
    if (!hasComplaints) return
    setDirection('next')
    setCurrentIndex((prev) => (prev === complaints.length - 1 ? 0 : prev + 1))
    setAnimKey(prev => prev + 1)
  }

  const handlePrev = () => {
    if (!hasComplaints) return
    setDirection('prev')
    setCurrentIndex((prev) => (prev === 0 ? complaints.length - 1 : prev - 1))
    setAnimKey(prev => prev + 1)
  }

  if (!hasComplaints) return null

  // TEMA AYARLARI
  const themes = {
    purple: {
      wrapperBg: 'bg-[#5D5FEF]',
      navBtn: 'border-white/30 text-white hover:bg-white/20 active:scale-90',
      activeCard: 'bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-none',
      activeText: {
        title: 'text-gray-900',
        content: 'text-gray-600',
        meta: 'text-gray-500',
        brand: 'text-[#5D5FEF]'
      },
      ghostCard: 'bg-white/10 border border-white/20 backdrop-blur-sm',
      ghostText: {
        title: 'text-white',
        content: 'text-indigo-100',
        meta: 'text-indigo-200',
        brand: 'text-white'
      }
    },
    emerald: {
      wrapperBg: 'bg-[#00C896]',
      navBtn: 'border-white/30 text-white hover:bg-white/20 active:scale-90',
      activeCard: 'bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-none',
      activeText: {
        title: 'text-gray-900',
        content: 'text-gray-600',
        meta: 'text-gray-500',
        brand: 'text-[#00C896]'
      },
      ghostCard: 'bg-white/10 border border-white/20 backdrop-blur-sm',
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
  const Card = ({ data, type }: { data: any, type: 'active' | 'ghost' }) => {
    const isGhost = type === 'ghost'
    const colors = isGhost ? theme.ghostText : theme.activeText
    const cardStyle = isGhost ? theme.ghostCard : theme.activeCard

    return (
      <article 
        className={`
          h-[320px] md:h-[300px] flex flex-col justify-between p-6 md:p-8 rounded-[2rem] 
          ${cardStyle} 
          ${!isGhost ? 'hover:-translate-y-1 hover:shadow-2xl transition-transform duration-300' : ''}
          w-full
        `}
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden ring-2 ring-white/20 ${isGhost ? 'bg-white/20 text-white' : 'bg-[#EAF4FF] text-[#0088CC]'}`}>
                {data.user.avatar ? (
                   <img src={data.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                   <span>{data.user.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              <div>
                <div className={`font-bold ${colors.title}`}>{data.user.name}</div>
                <div className={`flex items-center gap-2 text-xs ${colors.meta} font-medium`}>
                  <span className="flex items-center gap-1 opacity-80">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    {data.viewCount}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <div className={`flex items-center gap-1 text-xs font-bold ${isGhost ? 'text-white/90' : 'text-[#00C896]'}`}>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
                <span>{data.responses.length} Yorum</span>
              </div>
              {!isGhost && data.status && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                  data.status === 'SOLVED' ? 'bg-green-100 text-green-700' :
                  data.status === 'ANSWERED' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
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
               <div className="space-y-2 mt-4 opacity-50">
                  <div className="h-3 bg-white/30 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-white/30 rounded w-2/3 animate-pulse"></div>
               </div>
            )}
          </Link>
        </div>

        {/* Footer */}
        <div className={`pt-4 border-t flex items-center justify-between mt-auto ${isGhost ? 'border-white/10' : 'border-gray-100'}`}>
          <Link href={`/companies/${data.company.slug}`} className={`flex items-center gap-2 font-bold group/brand ${colors.brand}`}>
            <span className="transform transition-transform group-hover/brand:-scale-x-110 -scale-x-100 inline-block">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
            </span>
            {data.company.name}
          </Link>
          {!isGhost && (
             <span className="bg-gradient-to-r from-gray-800 to-gray-900 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg tracking-wide">PRO</span>
          )}
        </div>
      </article>
    )
  }

  return (
    <div className="py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* BAŞLIK */}
        <div className="flex justify-between items-end mb-4 md:mb-0 md:justify-start md:-ml-16 md:mt-6 z-20 w-full relative">
           <div className="w-full flex justify-between items-center">
             <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight animate-fade-in">{title}</h2>
           </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch perspective-container">
          {/* SAĞ TARAF: RENKLİ ALAN */}
          <div className={`w-full md:w-[75%] ${theme.wrapperBg} rounded-[2.5rem] md:rounded-tl-[5rem] md:rounded-bl-[2.5rem] md:rounded-r-none p-6 md:p-12 pb-16 relative shadow-2xl order-2 transition-colors duration-500`}>
            
            {/* Navigasyon Butonları */}
            <div className="flex justify-end gap-3 mb-6 md:absolute md:top-10 md:left-12 z-30">
              <button onClick={handlePrev} className={`w-12 h-12 rounded-full border backdrop-blur-md flex items-center justify-center transition-all ${theme.navBtn}`}>
                <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
              <button onClick={handleNext} className={`w-12 h-12 rounded-full border backdrop-blur-md flex items-center justify-center transition-all ${theme.navBtn}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
            
            {/* KARTLAR CONTAINER */}
            <div className="flex gap-6 md:gap-8 mt-4 md:mt-10 relative z-10 md:-ml-24 items-center">
              
              {/* AKTİF KART (SOLA TAŞAN) */}
              {/* key={animKey} bu kartın her değişimde yeniden render edilmesini ve animasyonun baştan başlamasını sağlar */}
              <div 
                key={`active-${animKey}`}
                className={`w-full md:w-[65%] flex-shrink-0 relative z-20 ${direction === 'next' ? 'animate-card-snap-next' : 'animate-card-snap-prev'}`}
              >
                  <Card data={complaints[currentIndex]} type="active" />
              </div>

              {/* GHOST KART (SAĞDAKİ) */}
              <div 
                key={`ghost-${animKey}`}
                className={`hidden md:block w-full md:w-[75%] flex-shrink-0 relative z-10 opacity-60 ${direction === 'next' ? 'animate-ghost-slide' : 'animate-fade-in'}`}
              >
                 <div className="transform scale-95 origin-left">
                    <Card data={complaints[nextIndex]} type="ghost" />
                 </div>
              </div>

            </div>

             {/* Dekoratif Daireler */}
             <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full pointer-events-none mix-blend-overlay"></div>
             <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full pointer-events-none blur-2xl"></div>
          
          </div>

          {/* SOL BOŞLUK (Layout için) */}
          <div className="hidden md:block w-[35%]"></div>
        </div>
      </div>
      
      <style jsx>{`
        /* 
         * SPRING & PHYSICS ANIMATIONS 
         * Bu animasyonlar standart 'ease-in-out' yerine 'cubic-bezier' kullanarak yaylanma efekti yaratır.
         */

        .perspective-container {
          perspective: 1200px;
        }

        /* NEXT Tıklanınca Aktif Kart Hareketi */
        @keyframes cardSnapNext {
          0% {
            opacity: 0;
            transform: translateX(100px) scale(0.9) rotateY(-10deg);
            filter: blur(4px);
          }
          60% {
            opacity: 1;
            /* Hafifçe sola geçip geri gelmesi (Overshoot) */
            transform: translateX(-15px) scale(1.02) rotateY(2deg);
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1) rotateY(0);
          }
        }

        /* PREV Tıklanınca Aktif Kart Hareketi */
        @keyframes cardSnapPrev {
          0% {
            opacity: 0;
            transform: translateX(-100px) scale(0.9) rotateY(10deg);
            filter: blur(4px);
          }
          60% {
            opacity: 1;
            transform: translateX(10px) scale(1.02) rotateY(-2deg);
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1) rotateY(0);
          }
        }

        /* Ghost Kart Animasyonu */
        @keyframes ghostSlide {
          0% {
            opacity: 0;
            transform: translateX(40px) scale(0.9);
          }
          100% {
            opacity: 0.6;
            transform: translateX(0) scale(0.95);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 0.6; }
        }

        /* Custom Classes applying Keyframes */
        .animate-card-snap-next {
          /* Spring etkisi yaratan cubic-bezier eğrisi */
          animation: cardSnapNext 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: center left;
          will-change: transform, opacity, filter;
        }

        .animate-card-snap-prev {
          animation: cardSnapPrev 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: center right;
          will-change: transform, opacity, filter;
        }

        .animate-ghost-slide {
          animation: ghostSlide 0.8s ease-out forwards;
        }
        
        .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
        }

      `}</style>
    </div>
  )
}