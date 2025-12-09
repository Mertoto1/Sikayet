'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCompanyRequestsClient({ 
  verificationRequests, 
  companyRequests 
}: { 
  verificationRequests: any[]; 
  companyRequests: any[]; 
}) {
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [messages, setMessages] = useState<{[key: string]: {type: string, text: string} | null}>({});
  const router = useRouter();

  const handleAction = async (endpoint: string, action: string, id: number, type: string) => {
    const key = `${type}-${id}-${action}`;
    
    // Set loading state
    setLoading(prev => ({ ...prev, [key]: true }));
    setMessages(prev => ({ ...prev, [key]: null }));
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessages(prev => ({ ...prev, [key]: { type: 'success', text: data.message || `${type === 'verification' ? 'Başvuru' : 'Talep'} ${action === 'approve' ? 'onaylandı' : 'reddedildi'}` } }));
        // Refresh the page after a short delay to show updated status
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setMessages(prev => ({ ...prev, [key]: { type: 'error', text: data.error || 'İşlem başarısız oldu' } }));
      }
    } catch (error) {
      setMessages(prev => ({ ...prev, [key]: { type: 'error', text: 'Bir hata oluştu' } }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div>
      {/* Existing Verification Requests */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mevcut Şirket Temsilcisi Başvuruları</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase">
                <th className="p-4">Kullanıcı</th>
                <th className="p-4">E-posta</th>
                <th className="p-4">Şirket</th>
                <th className="p-4">Pozisyon</th>
                <th className="p-4">Tarih</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {verificationRequests.map((request: any) => {
                const approveKey = `verification-${request.id}-approve`;
                const rejectKey = `verification-${request.id}-reject`;
                
                return (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{request.fullName}</div>
                    </td>
                    <td className="p-4 text-gray-600">{request.email}</td>
                    <td className="p-4">
                      <a 
                        href={`/companies/${request.company.slug}`} 
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        {request.company.name}
                      </a>
                    </td>
                    <td className="p-4 text-gray-600">{request.title}</td>
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex flex-col gap-2">
                        {(messages[approveKey] || messages[rejectKey]) && (
                          <div className={`text-sm p-2 rounded ${
                            (messages[approveKey]?.type === 'success' || messages[rejectKey]?.type === 'success') 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {messages[approveKey]?.text || messages[rejectKey]?.text}
                          </div>
                        )}
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleAction(`/api/admin/company-requests/${request.id}/approve`, 'approve', request.id, 'verification')}
                            disabled={loading[approveKey]}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition disabled:opacity-50"
                          >
                            {loading[approveKey] ? 'Onaylanıyor...' : 'Onayla'}
                          </button>
                          <button 
                            onClick={() => handleAction(`/api/admin/company-requests/${request.id}/reject`, 'reject', request.id, 'verification')}
                            disabled={loading[rejectKey]}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition disabled:opacity-50"
                          >
                            {loading[rejectKey] ? 'Reddediliyor...' : 'Reddet'}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {verificationRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Bekleyen şirket temsilcisi başvurusu bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Company Requests */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Yeni Şirket Kayıt Talepleri</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 uppercase">
                <th className="p-4">Şirket Adı</th>
                <th className="p-4">Sektör</th>
                <th className="p-4">Başvuran</th>
                <th className="p-4">E-posta</th>
                <th className="p-4">Tarih</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {companyRequests.map((request: any) => {
                const approveKey = `company-${request.id}-approve`;
                const rejectKey = `company-${request.id}-reject`;
                
                return (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {request.companyLogo ? (
                          <img 
                            src={request.companyLogo} 
                            alt={request.companyName} 
                            className="w-10 h-10 rounded-full object-contain border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-500">
                              {request.companyName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{request.companyName}</div>
                          {request.companyDescription && (
                            <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                              {request.companyDescription.substring(0, 50)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{request.companySector}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{request.fullName}</div>
                    </td>
                    <td className="p-4 text-gray-600">{request.email}</td>
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex flex-col gap-2">
                        {(messages[approveKey] || messages[rejectKey]) && (
                          <div className={`text-sm p-2 rounded ${
                            (messages[approveKey]?.type === 'success' || messages[rejectKey]?.type === 'success') 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {messages[approveKey]?.text || messages[rejectKey]?.text}
                          </div>
                        )}
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleAction(`/api/company-requests/${request.id}/approve`, 'approve', request.id, 'company')}
                            disabled={loading[approveKey]}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition disabled:opacity-50"
                          >
                            {loading[approveKey] ? 'Onaylanıyor...' : 'Onayla'}
                          </button>
                          <button 
                            onClick={() => handleAction(`/api/company-requests/${request.id}/reject`, 'reject', request.id, 'company')}
                            disabled={loading[rejectKey]}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition disabled:opacity-50"
                          >
                            {loading[rejectKey] ? 'Reddediliyor...' : 'Reddet'}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {companyRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Bekleyen yeni şirket kayıt talebi bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}