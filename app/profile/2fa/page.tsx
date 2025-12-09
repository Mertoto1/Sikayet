'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/client-session'
import { generate2FASecret, enable2FA, verify2FAToken, disable2FA } from '@/lib/2fa'
import QRCode from 'qrcode'

export default function TwoFactorAuthPage() {
  const router = useRouter()
  const { session, loading } = useSession()
  const [user, setUser] = useState<any>(null)
  const [qrCode, setQrCode] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [isEnabling, setIsEnabling] = useState<boolean>(false)
  const [isDisabling, setIsDisabling] = useState<boolean>(false)

  useEffect(() => {
    if (!loading && !session) {
      router.push('/login')
    } else if (session) {
      fetchUser()
    }
  }, [session, loading])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/me')
      if (response.ok) {
        const data = await response.json()
        const userData = data.user || data
        setUser(userData)
        
        // If 2FA is already enabled, don't generate new secret
        if (!userData.twoFactorEnabled) {
          generateSecret()
        }
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      router.push('/login')
    }
  }

  const generateSecret = async () => {
    try {
      const response = await fetch('/api/2fa/generate', {
        method: 'POST',
      })
      
      if (response.ok) {
        const data = await response.json()
        setSecret(data.secret)
        setQrCode(data.qrCode)
      }
    } catch (error) {
      console.error('Error generating secret:', error)
      setMessage('2FA sırrı oluşturulurken hata oluştu')
    }
  }

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsEnabling(true)
    setMessage('')
    
    if (!secret) {
      setMessage('Lütfen önce QR kodu oluşturun')
      setIsEnabling(false)
      return
    }
    
    if (token.length !== 6) {
      setMessage('Lütfen 6 haneli kodu girin')
      setIsEnabling(false)
      return
    }
    
    try {
      const response = await fetch('/api/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, secret }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage('2FA başarıyla etkinleştirildi!')
        setToken('')
        // Refresh user data
        fetchUser()
      } else {
        setMessage(data.error || '2FA etkinleştirilemedi')
      }
    } catch (error) {
      console.error('Error enabling 2FA:', error)
      setMessage('2FA etkinleştirilirken hata oluştu')
    } finally {
      setIsEnabling(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!confirm('2FA kimlik doğrulamayı devre dışı bırakmak istediğinizden emin misiniz?')) {
      return
    }
    
    setIsDisabling(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/2fa/disable', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage('2FA başarıyla devre dışı bırakıldı!')
        // Refresh user data
        fetchUser()
        // Generate new secret for future enablement
        generateSecret()
      } else {
        setMessage(data.error || '2FA devre dışı bırakılamadı')
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error)
      setMessage('2FA devre dışı bırakılırken hata oluştu')
    } finally {
      setIsDisabling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 py-8">
      <div className="container px-4 max-w-4xl mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Geri Dön
          </button>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            İki Faktörlü Kimlik Doğrulama
          </h1>
          <p className="text-gray-600">Hesabınızın güvenliğini artırın</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">
              {user?.twoFactorEnabled ? '2FA Etkin' : '2FA Kurulumu'}
            </h2>
          </div>
          
          <div className="p-6">
            {user?.twoFactorEnabled ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">2FA Etkin</h3>
                <p className="text-gray-600 mb-6">
                  Hesabınız iki faktörlü kimlik doğrulama ile korunuyor.
                </p>
                <button
                  onClick={handleDisable2FA}
                  disabled={isDisabling}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDisabling ? 'Devre Dışı Bırakılıyor...' : '2FA Devre Dışı Bırak'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">2FA Kurulumu</h3>
                  <p className="text-gray-600">
                    Hesabınızın güvenliğini artırmak için iki faktörlü kimlik doğrulamayı etkinleştirin.
                  </p>
                </div>

                {qrCode && (
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4">
                      <img 
                        src={qrCode} 
                        alt="2FA QR Kodu" 
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      QR kodunu Google Authenticator veya benzeri bir uygulama ile tarayın
                    </p>
                    
                    <div className="bg-gray-50 rounded-lg p-4 w-full max-w-md">
                      <p className="text-sm font-medium text-gray-900 mb-2">Veya manuel olarak girin:</p>
                      <code className="text-sm bg-white p-2 rounded border font-mono">
                        {secret}
                      </code>
                    </div>
                  </div>
                )}

                <form onSubmit={handleEnable2FA} className="space-y-4">
                  <div>
                    <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                      6 Haneli Kod
                    </label>
                    <input
                      type="text"
                      id="token"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="000000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      maxLength={6}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isEnabling || token.length !== 6}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isEnabling ? 'Etkinleştiriliyor...' : '2FA Etkinleştir'}
                  </button>
                </form>
              </div>
            )}

            {message && (
              <div className={`mt-6 p-4 rounded-xl ${
                message.includes('başarıyla') || message.includes('success') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}