import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import VerificationActionButtons from './actions'

export default async function AdminVerificationsPage() {
  const session = await getSession()
  
  // Check if user is admin
  if (!session || (typeof session === 'object' && session !== null && session.role !== 'ADMIN')) {
    redirect('/login')
  }

  // Fetch pending verification requests
  const requests = await prisma.companyVerificationRequest.findMany({
    where: {
      status: 'PENDING'
    },
    include: {
      user: true,
      company: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
          Onay Talepleri
        </h1>
        <p className="text-gray-600 text-sm">Şirket kullanıcılarının onay taleplerini yönetin</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-xl font-bold text-gray-900">Bekleyen Talepler ({requests.length})</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {requests.map((request: any) => (
            <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900">{request.user.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {request.company.name}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {request.user.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {request.user.phone || 'Telefon yok'}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    Talep tarihi: {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                
                <VerificationActionButtons id={request.id} />
              </div>
            </div>
          ))}
          
          {requests.length === 0 && (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Bekleyen onay talebi yok</h3>
              <p className="text-gray-500">Yeni talepler geldikçe burada listelenecek</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}