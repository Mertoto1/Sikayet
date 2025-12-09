import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { logout } from '@/app/actions/auth-actions'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
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
      avatar: true,
      bio: true,
      role: true,
      isVerified: true,
      twoFactorEnabled: true,
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          isApproved: true
        }
      },
      complaints: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          viewCount: true,
          company: {
            select: {
              name: true,
              slug: true,
              logoUrl: true
            }
          }
        }
      },
      _count: {
        select: {
          complaints: true
        }
      }
    }
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Profilim
            </h1>
            <p className="text-gray-600">Hesap bilgilerinizi görüntüleyin ve yönetin</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              href="/complaints/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Şikayet Oluştur</span>
              <span className="sm:hidden">Yeni Şikayet</span>
            </Link>
            <form action={logout} className="hidden md:block w-full sm:w-auto">
              <button 
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Çıkış Yap
              </button>
            </form>
          </div>
        </div>
      </div>

      <ProfileClient user={user} logout={logout} />
    </div>
  )
}