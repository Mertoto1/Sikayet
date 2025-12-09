export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
              <div>
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="ml-auto flex gap-3">
                <div className="h-10 bg-gray-200 rounded-xl w-24"></div>
                <div className="h-10 bg-gray-200 rounded-xl w-24"></div>
                <div className="h-10 bg-gray-200 rounded-xl w-24"></div>
              </div>
            </div>

            <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
            
            <div className="space-y-4 mb-8">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              <div className="h-4 bg-gray-200 rounded w-3/6"></div>
            </div>

            <div className="mt-10">
              <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="aspect-square bg-gray-200 rounded-2xl"></div>
                <div className="aspect-square bg-gray-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}