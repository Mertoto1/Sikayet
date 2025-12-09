import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import HeaderFooterWrapper from '@/components/HeaderFooterWrapper'
import ViewportMeta from '@/components/ViewportMeta'
import { getSession } from '@/lib/session'
import { getSiteSettings } from '@/lib/settings'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await getSiteSettings()
  const siteName = siteSettings.siteName
  
  return {
    title: siteName,
    description: `${siteName} - ${siteSettings.siteDescription}`,
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  
  return (
    <html lang="tr">
      <body className={inter.className}>
        <ViewportMeta />
        <HeaderFooterWrapper session={session}>
          {children}
        </HeaderFooterWrapper>
      </body>
    </html>
  )
}