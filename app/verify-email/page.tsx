'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmailVerificationPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Get user ID and email from localStorage
    const storedUserId = localStorage.getItem('pendingVerificationUserId');
    const storedEmail = localStorage.getItem('pendingVerificationEmail');
    
    if (!storedUserId) {
      router.push('/register');
      return;
    }
    
    setUserId(parseInt(storedUserId));
    setEmail(storedEmail || '');
  }, [router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Lütfen 6 haneli kodu tam olarak girin');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId,
          code: verificationCode
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Clear localStorage
        localStorage.removeItem('pendingVerificationUserId');
        localStorage.removeItem('pendingVerificationEmail');
        
        setSuccess('Email adresiniz başarıyla doğrulandı!');
        
        // Redirect based on user role after a short delay
        setTimeout(() => {
          if (data.user.role === 'ADMIN') {
            window.location.href = '/admin';
          } else if (data.user.role === 'COMPANY' || data.user.role === 'COMPANY_PENDING') {
            window.location.href = '/company';
          } else {
            window.location.href = '/';
          }
        }, 1500);
      } else {
        setError(data.error || 'Doğrulama başarısız oldu');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Yeni doğrulama kodu e-posta adresinize gönderildi');
      } else {
        setError(data.error || 'Kod yeniden gönderilemedi');
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">E-posta Doğrulama</h2>
          <p className="text-gray-600">
            {email ? `${email} adresine` : 'E-posta adresinize'} gönderdiğimiz 6 haneli kodu girin
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {(error || success) && (
            <div className={`${error ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'} border p-4 rounded-xl text-sm flex items-center gap-2`}>
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                {error ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                )}
              </svg>
              {error || success}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 text-center">
              6 Haneli Doğrulama Kodu
            </label>
            <div className="flex justify-center gap-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || code.some(digit => digit === '')}
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
              'Hesabı Doğrula'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={handleResendCode}
            disabled={loading}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Gönderiliyor...' : 'Kodu Yeniden Gönder'}
          </button>
        </div>
      </div>
    </div>
  );
}