export default function MypageLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-warm-white">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-7 w-32 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded mt-2 animate-pulse" />
          </div>
          <div className="flex gap-4">
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* 주문 내역 타이틀 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="h-6 w-28 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* 주문 카드 스켈레톤 */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-4 w-14 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex gap-1 mt-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-1.5 flex-1 bg-gray-200 rounded-full animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
