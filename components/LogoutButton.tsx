'use client'

import { logout } from '@/app/actions/auth-actions'

export default function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-indigo-200 w-full text-left"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      <span className="font-medium">Çıkış Yap</span>
    </button>
  )
}