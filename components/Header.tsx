'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { logout } from '@/app/actions/auth-actions'

interface HeaderProps {
  session: any
  siteSettings: {
    siteName: string
    siteLogo: string
    favicon: string
    siteDescription: string
  }
}

export default function Header({ session, siteSettings }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Determine profile link based on session role (no need to fetch /api/me)
  const getProfileLink = () => {
    if (!session) return '/profile'
    
    // Session already contains role from JWT
    const role = typeof session === 'object' && session !== null ? session.role : null
    
    // If user is a company representative, redirect to company dashboard
    if (role === 'COMPANY' || role === 'COMPANY_PENDING') {
      return '/company'
    }
    
    // If admin, redirect to admin dashboard
    if (role === 'ADMIN') {
      return '/admin'
    }
    
    // For regular users, go to personal profile
    return '/profile'
  }

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src={siteSettings.siteLogo} 
                alt={siteSettings.siteName}
                width={32}
                height={32}
                className="h-8 w-auto"
                onError={(e) => {
                  // Fallback to default logo if image fails to load
                  const target = e.target as HTMLImageElement
                  if (target.src !== '/globe.svg') {
                    target.src = '/globe.svg'
                  }
                }}
              />
              <span className="text-xl font-bold text-gray-900">
                {siteSettings.siteName}
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium">
                Ana Sayfa
              </Link>
              <Link href="/complaints" className="text-gray-700 hover:text-gray-900 font-medium">
                Şikayetler
              </Link>
              <Link href="/companies" className="text-gray-700 hover:text-gray-900 font-medium">
                Şirketler
              </Link>

              {/* Auth Buttons */}
              {session ? (
                <Link href={getProfileLink()} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Profil
                </Link>
              ) : (
                <Link href="/login" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-md hover:from-indigo-700 hover:to-purple-700 font-medium transition-all">
                  Giriş / Kayıt Ol
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Mobile Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src={siteSettings.siteLogo} 
                alt={siteSettings.siteName}
                width={24}
                height={24}
                className="h-6 w-auto"
                onError={(e) => {
                  // Fallback to default logo if image fails to load
                  const target = e.target as HTMLImageElement
                  if (target.src !== '/globe.svg') {
                    target.src = '/globe.svg'
                  }
                }}
              />
              <span className="text-lg font-bold text-gray-900">
                {siteSettings.siteName}
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
              <nav className="py-2">
                <Link 
                  href="/" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ana Sayfa
                </Link>
                <Link 
                  href="/complaints" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Şikayetler
                </Link>
                <Link 
                  href="/companies" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Şirketler
                </Link>
                {session ? (
                  <>
                    <Link 
                      href={getProfileLink()} 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profil
                    </Link>
                    <form action={logout}>
                      <button 
                        type="submit"
                        className="w-full text-left block px-4 py-2 text-red-600 hover:bg-red-50 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Çıkış Yap
                        </span>
                      </button>
                    </form>
                  </>
                ) : (
                  <Link 
                    href="/login" 
                    className="block px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Giriş / Kayıt Ol
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="md:hidden h-16"></div>
      <div className="hidden md:block h-16"></div>
    </>
  )
}