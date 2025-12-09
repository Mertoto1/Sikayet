'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminComplaintDetailClient({ complaint }: { complaint: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  async function handleDelete() {
    console.log('handleDelete function called!');
    // Temporarily bypass confirm for testing
    // if (!confirm('Bu şikayeti silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

    setLoading(true);
    try {
      console.log('Deleting complaint:', complaint.id);
      const res = await fetch(`/api/admin/complaints/${complaint.id}/delete`, {
        method: 'POST'
      });
      
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);
      
      if (res.ok) {
        router.push('/admin/complaints');
        router.refresh();
      } else {
        const errorData = await res.json();
        console.error('Error response:', errorData);
        alert('Silme işlemi başarısız: ' + (errorData.error || 'Bilinmeyen hata'));
      }
    } catch (err) {
      console.error('Delete error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      alert('Hata oluştu: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link 
          href="/admin/complaints" 
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Onay Bekleyen Şikayetler
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center font-bold text-white text-xl md:text-2xl shadow-lg">
              {complaint.user.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-gray-900 text-xl">{complaint.user.name}</div>
              <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(complaint.createdAt).toLocaleDateString('tr-TR')}
              </div>
            </div>
            <div className="ml-auto flex gap-3">
              <button
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ön İzleme
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Sil
                  </>
                )}
              </button>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">{complaint.title}</h1>
          
          <div className="prose prose-lg prose-indigo max-w-none text-gray-700 mb-8">
            {complaint.content.split('\n').map((line: string, i: number) => (
              <p key={i} className="mb-4 last:mb-0 text-lg leading-relaxed">{line}</p>
            ))}
          </div>

          {complaint.images.length > 0 && (
            <div className="mt-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Kanıt Fotoğrafları
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {complaint.images.map((img: any, index: number) => (
                  <div 
                    key={img.id} 
                    className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group"
                    onClick={() => window.open(img.url, '_blank')}
                  >
                    <img 
                      src={img.url} 
                      alt={`Kanıt ${index + 1}`} 
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" 
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Şikayet Önizlemesi</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white text-lg">
                    {complaint.user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{complaint.user.name}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(complaint.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{complaint.title}</h2>
                
                <div className="prose max-w-none text-gray-700">
                  {complaint.content.split('\n').map((line: string, i: number) => (
                    <p key={i} className="mb-3 last:mb-0">{line}</p>
                  ))}
                </div>
              </div>
              
              {complaint.images.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Kanıt Fotoğrafları</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {complaint.images.map((img: any, index: number) => (
                      <div key={img.id} className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                        <img 
                          src={img.url} 
                          alt={`Kanıt ${index + 1}`} 
                          className="w-full h-full object-contain p-2" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}