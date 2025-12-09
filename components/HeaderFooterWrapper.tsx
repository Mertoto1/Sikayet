'use client'

import { ReactNode, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import Header from './Header'
import Footer from './Footer'

interface HeaderFooterWrapperProps {
  children: ReactNode
  session: any
}

interface SiteSettings {
  siteName: string
  siteLogo: string
  favicon: string
  siteDescription: string
}

export default function HeaderFooterWrapper({ children, session }: HeaderFooterWrapperProps) {
  const pathname = usePathname()
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'Şikayetvar',
    siteLogo: '/globe.svg',
    favicon: '/globe.svg',
    siteDescription: 'Türkiye\'nin en büyük şikayet platformu'
  })

  const isAdminRoute = pathname?.startsWith('/admin')

  useEffect(() => {
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => setSiteSettings(data))
      .catch(err => console.error('Failed to fetch site settings:', err))
  }, [])

  if (isAdminRoute) {
    return (
      <div className="min-h-screen">
        <Toaster position="top-right" />
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" />
      <Header session={session} siteSettings={siteSettings} />
      <main className="flex-1">
        {children}
      </main>
      <Footer siteSettings={siteSettings} />
    </div>
  )
}