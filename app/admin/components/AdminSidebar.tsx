'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import { io } from 'socket.io-client'

let socket: any = null

export default function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Fetch initial unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch('/api/support/unread-count')
        const data = await res.json()
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount)
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error)
      }
    }
    
    fetchUnreadCount()
    
    // Initialize socket connection
    if (!socket) {
      socket = io()
      
      socket.on('new-message-notification', (data: { roomId: string; senderRole: string; timestamp: Date }) => {
        // Only increment count if the message is not from admin (i.e., from company/user)
        if (data.senderRole !== 'ADMIN') {
          setUnreadCount(prev => prev + 1)
        }
      })
      
      // Listen for direct unread count updates
      socket.on('admin-unread-update', (data: { roomId: string; increment: boolean }) => {
        if (data.increment) {
          setUnreadCount(prev => prev + 1)
        }
      })
      
      // Listen for admin read messages event
      socket.on('admin-read-messages', (data: { roomId: string }) => {
        // When admin reads messages, we should refresh the unread count
        // This ensures the count is accurate after reading
        fetch('/api/support/unread-count')
          .then(res => res.json())
          .then(data => {
            if (data.unreadCount !== undefined) {
              setUnreadCount(data.unreadCount)
            }
          })
          .catch(error => {
            console.error('Failed to fetch updated unread count:', error)
          })
      })
      
      socket.on('connect', () => {
        console.log('Socket connected for admin sidebar')
      })
      
      socket.on('disconnect', () => {
        console.log('Socket disconnected for admin sidebar')
      })
    }
    
    return () => {
      if (socket) {
        socket.off('new-message-notification')
        socket.off('admin-unread-update')
        socket.off('admin-read-messages')
        socket.off('connect')
        socket.off('disconnect')
      }
    }
  }, [])

  // Reset unread count when visiting support page
  useEffect(() => {
    if (pathname === '/admin/support') {
      setUnreadCount(0)
    }
  }, [pathname])

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 h-full w-64 md:w-72 bg-gradient-to-b from-indigo-900 via-indigo-800 to-purple-900 text-white flex-shrink-0 hidden md:flex flex-col shadow-2xl z-40">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold">Yönetim Paneli</h2>
            <p className="text-xs text-indigo-200">Admin Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link href="/admin" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all">
          <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="font-medium">Ana Sayfa</span>
        </Link>

        <Link href="/admin/statistics" className={`group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all ${pathname === '/admin/statistics' ? 'bg-white/10' : ''}`}>
          <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="font-medium">İstatistikler</span>
        </Link>

        <Link href="/admin/complaints" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all">
          <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Onay Bekleyenler</span>
        </Link>

        {/* Company Users Section */}
        <div className="px-4 py-2 text-xs font-semibold text-indigo-200 uppercase tracking-wider mt-4 mb-1">
          Şirket Kullanıcıları
        </div>
        
        <Link href="/admin/companies" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all">
          <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="font-medium">Şirketler</span>
        </Link>

        <Link href="/admin/users?userType=COMPANY" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all">
          <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="font-medium">Şirket Kullanıcıları</span>
        </Link>

        <Link href="/admin/company-requests" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all">
          <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="font-medium">Şirket Başvuruları</span>
        </Link>

        {/* Regular Users Section */}
        <div className="px-4 py-2 text-xs font-semibold text-indigo-200 uppercase tracking-wider mt-4 mb-1">
          Normal Kullanıcılar
        </div>
        
        <Link href="/admin/users?userType=USER" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all">
          <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="font-medium">Kullanıcılar</span>
        </Link>

        <Link href="/admin/verifications" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all">
          <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="font-medium">Onay Talepleri</span>
        </Link>

        <Link href="/admin/sectors" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all">
          <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="font-medium">Sektörler</span>
        </Link>

        <Link href="/admin/settings" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all">
          <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium">Ayarlar</span>
        </Link>

        <Link href="/admin/support" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all relative">
          <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">Destek Talepleri</span>
          {unreadCount > 0 && (
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="border-t border-white/10 my-4"></div>

        <LogoutButton />

        <Link href="/" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-indigo-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Siteye Dön</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.email}</p>
              <p className="text-xs text-indigo-200">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </aside>

      {/* Sidebar - Mobile */}
      <aside className={`md:hidden fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-indigo-900 via-indigo-800 to-purple-900 text-white flex-shrink-0 flex flex-col shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold">Yönetim Paneli</h2>
                <p className="text-xs text-indigo-200">Admin Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link href="/admin" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all" onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Ana Sayfa</span>
          </Link>

          <Link href="/admin/statistics" className={`group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all ${pathname === '/admin/statistics' ? 'bg-white/10' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="font-medium">İstatistikler</span>
          </Link>

          <Link href="/admin/complaints" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all" onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Onay Bekleyenler</span>
          </Link>

          {/* Company Users Section */}
          <div className="px-4 py-2 text-xs font-semibold text-indigo-200 uppercase tracking-wider mt-4 mb-1">
            Şirket Kullanıcıları
          </div>
          
          <Link href="/admin/companies" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all" onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-medium">Şirketler</span>
          </Link>

          <Link href="/admin/users?userType=COMPANY" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all" onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="font-medium">Şirket Kullanıcıları</span>
          </Link>

          <Link href="/admin/company-requests" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all" onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-medium">Şirket Başvuruları</span>
          </Link>

          {/* Regular Users Section */}
          <div className="px-4 py-2 text-xs font-semibold text-indigo-200 uppercase tracking-wider mt-4 mb-1">
            Normal Kullanıcılar
          </div>
          
          <Link href="/admin/users?userType=USER" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all" onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="font-medium">Kullanıcılar</span>
          </Link>

          <Link href="/admin/verifications" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all" onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-medium">Onay Talepleri</span>
          </Link>

          <Link href="/admin/sectors" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all" onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="font-medium">Sektörler</span>
          </Link>

          <Link href="/admin/settings" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all" onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">Ayarlar</span>
          </Link>

          <Link href="/admin/support" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all relative" onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-5 h-5 text-indigo-200 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">Destek Talepleri</span>
            {unreadCount > 0 && (
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <div className="border-t border-white/10 my-4"></div>

          <div onClick={() => setIsMobileMenuOpen(false)}>
            <LogoutButton />
          </div>

          <Link href="/" className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-indigo-200" onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Siteye Dön</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.email}</p>
                <p className="text-xs text-indigo-200">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}