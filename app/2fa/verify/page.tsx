'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TwoFactorVerificationPage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if 2FA verification is pending
  useEffect(() => {
    let mounted = true;
    
    // Check if cookie exists by making a request
    fetch('/api/2fa/verify-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: 'check' }),
      credentials: 'include'
    }).then(async res => {
      if (!mounted) return;
      
      const data = await res.json();
      if (res.status === 400 && (data.error === 'No pending 2FA verification' || data.error === '2FA doğrulaması beklenmiyor')) {
        // No pending verification, redirect to login
        window.location.href = '/login';
      }
      // If pending exists (200 or other status), stay on page
    }).catch(() => {
      // If check fails, stay on page (might be network issue)
    });
    
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/2fa/verify-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in request/response
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Use window.location.href for full page reload to ensure cookie is read
        // Small delay to ensure cookie is set in browser
        setTimeout(() => {
          if (data.user?.role === 'ADMIN') {
            window.location.href = '/admin';
          } else if (data.user?.role === 'COMPANY' || data.user?.role === 'COMPANY_PENDING') {
            window.location.href = '/company';
          } else {
            window.location.href = '/';
          }
        }, 200);
      } else {
        setError(data.error || 'Geçersiz kod. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">İki Faktörlü Kimlik Doğrulama</h2>
          <p className="text-gray-600">
            Authenticator uygulamanızdan gelen 6 haneli kodu girin
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              6 Haneli Kod
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              maxLength={6}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="123456"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Doğrulanıyor...
              </span>
            ) : (
              'Doğrula ve Giriş Yap'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
            ← Geri dön
          </Link>
        </div>
      </div>
    </div>
  );
}