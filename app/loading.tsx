export default function Loading() {
    return (
        <div className="container py-12 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 h-64">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
