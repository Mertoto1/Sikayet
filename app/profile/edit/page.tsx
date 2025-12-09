import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EditProfileForm from '@/components/EditProfileForm'
import { getSession } from '@/lib/session'

export default async function EditProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  // Extract userId from session
  const userId = typeof session === 'object' && session !== null ? session.userId : null
  if (!userId) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      surname: true,
      username: true,
      phone: true,
      // @ts-ignore - Prisma client will be regenerated
      avatar: true,
      // @ts-ignore - Prisma client will be regenerated
      bio: true
    }
  }) as any

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/profile" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Geri Dön
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Profili Düzenle
        </h1>
        <p className="text-gray-600">Hesap bilgilerinizi güncelleyin</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Profil Düzenle</h2>
        </div>
        <div className="p-6">
          <EditProfileForm user={user} />
        </div>
      </div>

      {/* 2FA Section */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">İki Faktörlü Kimlik Doğrulama</h2>
        </div>
        <div className="p-6">
          <Link 
            href="/profile/2fa" 
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            2FA Ayarlarını Yönet
          </Link>
        </div>
      </div>
    </div>
  )
}