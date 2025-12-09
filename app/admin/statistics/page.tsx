import { prisma } from '@/lib/db'

// Helper function to get date ranges
function getDateRanges() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const monthAgo = new Date(today)
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  const yearAgo = new Date(today)
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)

  return { today, weekAgo, monthAgo, yearAgo }
}

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic'

export default async function AdminStatisticsPage() {
  const { today, weekAgo, monthAgo, yearAgo } = getDateRanges()

  // Complaints statistics
  const [
    totalComplaints,
    dailyComplaints,
    weeklyComplaints,
    monthlyComplaints,
    yearlyComplaints,
    solvedComplaints,
    dailySolved,
    weeklySolved,
    monthlySolved,
    yearlySolved,
    answeredComplaints,
    dailyAnswered,
    weeklyAnswered,
    monthlyAnswered,
    yearlyAnswered,
    publishedComplaints,
    dailyPublished,
    weeklyPublished,
    monthlyPublished,
    yearlyPublished,
    pendingComplaints,
    dailyPending,
    weeklyPending,
    monthlyPending,
    yearlyPending,
    totalUsers,
    dailyUsers,
    weeklyUsers,
    monthlyUsers,
    yearlyUsers,
    totalCompanies,
    dailyCompanies,
    weeklyCompanies,
    monthlyCompanies,
    yearlyCompanies,
    approvedCompanies,
    dailyApprovedCompanies,
    weeklyApprovedCompanies,
    monthlyApprovedCompanies,
    yearlyApprovedCompanies,
    totalSectors,
    totalResponses,
    dailyResponses,
    weeklyResponses,
    monthlyResponses,
    yearlyResponses,
    totalViews,
    dailyViews,
    weeklyViews,
    monthlyViews,
    yearlyViews
  ] = await Promise.all([
    // Total complaints
    prisma.complaint.count(),
    prisma.complaint.count({ where: { createdAt: { gte: today } } }),
    prisma.complaint.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.complaint.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.complaint.count({ where: { createdAt: { gte: yearAgo } } }),

    // Solved complaints
    prisma.complaint.count({ where: { status: 'SOLVED' } }),
    prisma.complaint.count({ where: { status: 'SOLVED', createdAt: { gte: today } } }),
    prisma.complaint.count({ where: { status: 'SOLVED', createdAt: { gte: weekAgo } } }),
    prisma.complaint.count({ where: { status: 'SOLVED', createdAt: { gte: monthAgo } } }),
    prisma.complaint.count({ where: { status: 'SOLVED', createdAt: { gte: yearAgo } } }),

    // Answered complaints
    prisma.complaint.count({ where: { status: 'ANSWERED' } }),
    prisma.complaint.count({ where: { status: 'ANSWERED', createdAt: { gte: today } } }),
    prisma.complaint.count({ where: { status: 'ANSWERED', createdAt: { gte: weekAgo } } }),
    prisma.complaint.count({ where: { status: 'ANSWERED', createdAt: { gte: monthAgo } } }),
    prisma.complaint.count({ where: { status: 'ANSWERED', createdAt: { gte: yearAgo } } }),

    // Published complaints
    prisma.complaint.count({ where: { status: 'PUBLISHED' } }),
    prisma.complaint.count({ where: { status: 'PUBLISHED', createdAt: { gte: today } } }),
    prisma.complaint.count({ where: { status: 'PUBLISHED', createdAt: { gte: weekAgo } } }),
    prisma.complaint.count({ where: { status: 'PUBLISHED', createdAt: { gte: monthAgo } } }),
    prisma.complaint.count({ where: { status: 'PUBLISHED', createdAt: { gte: yearAgo } } }),

    // Pending complaints
    prisma.complaint.count({ where: { status: 'PENDING_MODERATION' } }),
    prisma.complaint.count({ where: { status: 'PENDING_MODERATION', createdAt: { gte: today } } }),
    prisma.complaint.count({ where: { status: 'PENDING_MODERATION', createdAt: { gte: weekAgo } } }),
    prisma.complaint.count({ where: { status: 'PENDING_MODERATION', createdAt: { gte: monthAgo } } }),
    prisma.complaint.count({ where: { status: 'PENDING_MODERATION', createdAt: { gte: yearAgo } } }),

    // Users
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: yearAgo } } }),

    // Companies
    prisma.company.count(),
    prisma.company.count({ where: { createdAt: { gte: today } } }),
    prisma.company.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.company.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.company.count({ where: { createdAt: { gte: yearAgo } } }),

    // Approved companies
    prisma.company.count({ where: { isApproved: true } }),
    prisma.company.count({ where: { isApproved: true, createdAt: { gte: today } } }),
    prisma.company.count({ where: { isApproved: true, createdAt: { gte: weekAgo } } }),
    prisma.company.count({ where: { isApproved: true, createdAt: { gte: monthAgo } } }),
    prisma.company.count({ where: { isApproved: true, createdAt: { gte: yearAgo } } }),

    // Sectors
    prisma.sector.count(),

    // Responses
    prisma.complaintResponse.count(),
    prisma.complaintResponse.count({ where: { createdAt: { gte: today } } }),
    prisma.complaintResponse.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.complaintResponse.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.complaintResponse.count({ where: { createdAt: { gte: yearAgo } } }),

    // Views (sum of viewCount)
    prisma.complaint.aggregate({ _sum: { viewCount: true } }).then(r => r._sum.viewCount || 0),
    prisma.complaint.aggregate({ 
      where: { createdAt: { gte: today } },
      _sum: { viewCount: true } 
    }).then(r => r._sum.viewCount || 0),
    prisma.complaint.aggregate({ 
      where: { createdAt: { gte: weekAgo } },
      _sum: { viewCount: true } 
    }).then(r => r._sum.viewCount || 0),
    prisma.complaint.aggregate({ 
      where: { createdAt: { gte: monthAgo } },
      _sum: { viewCount: true } 
    }).then(r => r._sum.viewCount || 0),
    prisma.complaint.aggregate({ 
      where: { createdAt: { gte: yearAgo } },
      _sum: { viewCount: true } 
    }).then(r => r._sum.viewCount || 0)
  ])

  const stats = [
    {
      title: 'Toplam Şikayet',
      icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
      color: 'from-indigo-500 to-purple-600',
      values: {
        total: totalComplaints,
        daily: dailyComplaints,
        weekly: weeklyComplaints,
        monthly: monthlyComplaints,
        yearly: yearlyComplaints
      }
    },
    {
      title: 'Çözülen Şikayetler',
      icon: 'M5 13l4 4L19 7',
      color: 'from-green-500 to-emerald-600',
      values: {
        total: solvedComplaints,
        daily: dailySolved,
        weekly: weeklySolved,
        monthly: monthlySolved,
        yearly: yearlySolved
      }
    },
    {
      title: 'Yanıtlanan Şikayetler',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      color: 'from-blue-500 to-cyan-600',
      values: {
        total: answeredComplaints,
        daily: dailyAnswered,
        weekly: weeklyAnswered,
        monthly: monthlyAnswered,
        yearly: yearlyAnswered
      }
    },
    {
      title: 'Yayınlanan Şikayetler',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'from-purple-500 to-pink-600',
      values: {
        total: publishedComplaints,
        daily: dailyPublished,
        weekly: weeklyPublished,
        monthly: monthlyPublished,
        yearly: yearlyPublished
      }
    },
    {
      title: 'Bekleyen Şikayetler',
      icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'from-orange-500 to-red-600',
      values: {
        total: pendingComplaints,
        daily: dailyPending,
        weekly: weeklyPending,
        monthly: monthlyPending,
        yearly: yearlyPending
      }
    },
    {
      title: 'Toplam Kullanıcı',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      color: 'from-blue-500 to-indigo-600',
      values: {
        total: totalUsers,
        daily: dailyUsers,
        weekly: weeklyUsers,
        monthly: monthlyUsers,
        yearly: yearlyUsers
      }
    },
    {
      title: 'Toplam Şirket',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      color: 'from-emerald-500 to-teal-600',
      values: {
        total: totalCompanies,
        daily: dailyCompanies,
        weekly: weeklyCompanies,
        monthly: monthlyCompanies,
        yearly: yearlyCompanies
      }
    },
    {
      title: 'Onaylı Şirketler',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      color: 'from-green-500 to-emerald-600',
      values: {
        total: approvedCompanies,
        daily: dailyApprovedCompanies,
        weekly: weeklyApprovedCompanies,
        monthly: monthlyApprovedCompanies,
        yearly: yearlyApprovedCompanies
      }
    },
    {
      title: 'Toplam Sektör',
      icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
      color: 'from-violet-500 to-purple-600',
      values: {
        total: totalSectors,
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0
      }
    },
    {
      title: 'Toplam Yanıt',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      color: 'from-cyan-500 to-blue-600',
      values: {
        total: totalResponses,
        daily: dailyResponses,
        weekly: weeklyResponses,
        monthly: monthlyResponses,
        yearly: yearlyResponses
      }
    },
    {
      title: 'Toplam Görüntülenme',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
      color: 'from-amber-500 to-orange-600',
      values: {
        total: totalViews,
        daily: dailyViews,
        weekly: weeklyViews,
        monthly: monthlyViews,
        yearly: yearlyViews
      }
    }
  ]

  return (
    <div className="space-y-3 md:space-y-4 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
          İstatistikler
        </h1>
        <p className="text-gray-600 text-sm">Detaylı platform istatistikleri ve analizler</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Gradient Header */}
            <div className={`bg-gradient-to-r ${stat.color} px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">{stat.title}</h3>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Total */}
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-1">{stat.values.total.toLocaleString('tr-TR')}</div>
                <div className="text-sm text-gray-500">Toplam</div>
              </div>

              {/* Time Periods */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{stat.values.daily.toLocaleString('tr-TR')}</div>
                  <div className="text-xs text-gray-500 mt-1">Günlük</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stat.values.weekly.toLocaleString('tr-TR')}</div>
                  <div className="text-xs text-gray-500 mt-1">Haftalık</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stat.values.monthly.toLocaleString('tr-TR')}</div>
                  <div className="text-xs text-gray-500 mt-1">Aylık</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stat.values.yearly.toLocaleString('tr-TR')}</div>
                  <div className="text-xs text-gray-500 mt-1">Yıllık</div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Çözüm Oranı</h3>
            <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-4xl font-bold mb-2">
            {totalComplaints > 0 
              ? ((solvedComplaints + answeredComplaints) / totalComplaints * 100).toFixed(1)
              : '0'
            }%
          </div>
          <p className="text-white/80 text-sm">
            {solvedComplaints + answeredComplaints} / {totalComplaints} şikayet çözüldü
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Yanıt Oranı</h3>
            <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="text-4xl font-bold mb-2">
            {totalComplaints > 0 
              ? (answeredComplaints / totalComplaints * 100).toFixed(1)
              : '0'
            }%
          </div>
          <p className="text-white/80 text-sm">
            {answeredComplaints} şikayet yanıtlandı
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Ortalama Görüntülenme</h3>
            <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div className="text-4xl font-bold mb-2">
            {totalComplaints > 0 
              ? Math.round(totalViews / totalComplaints).toLocaleString('tr-TR')
              : '0'
            }
          </div>
          <p className="text-white/80 text-sm">
            Şikayet başına ortalama görüntülenme
          </p>
        </div>
      </div>
    </div>
  )
}

