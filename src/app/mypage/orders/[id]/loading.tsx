export default function OrderDetailLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-warm-white">
      <div className="max-w-2xl mx-auto">
        {/* 뒤로가기 */}
        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-6" />

        {/* 주문 정보 */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-3 w-36 bg-gray-100 rounded animate-pulse mb-3" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* 결제 버튼 */}
        <div className="mb-6">
          <div className="h-12 w-full bg-gray-200 rounded-full animate-pulse" />
        </div>

        {/* 진행상황 */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-5" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse shrink-0" />
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* 세금계산서 */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-3" />
          <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
