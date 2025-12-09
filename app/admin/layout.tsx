import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import AdminSidebar from './components/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  
  // Check if user is admin
  if (!session || (typeof session === 'object' && session !== null && session.role !== 'ADMIN')) {
    redirect('/login')
  }

  // Extract userId from session
  const userId = typeof session === 'object' && session !== null ? session.userId : null
  if (!userId) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      <AdminSidebar user={user} />
      <div className="flex-1 flex flex-col ml-0 md:ml-64 lg:ml-72 min-w-0">
        {/* Admin Header would go here if it existed */}
        <main className="flex-1 pt-16 md:pt-0 overflow-x-hidden">
          <div className="w-full p-3 md:p-4 lg:p-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}