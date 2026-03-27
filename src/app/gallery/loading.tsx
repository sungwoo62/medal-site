export default function GalleryLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-warm-white">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 스켈레톤 */}
        <div className="text-center mb-12">
          <p className="text-rose text-xs font-semibold tracking-[0.2em] uppercase mb-2">Portfolio</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3">제작 사례</h1>
          <p className="text-sm text-charcoal-light">갤러리를 불러오는 중...</p>
        </div>

        {/* 필터 필 스켈레톤 */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-warm-gray animate-pulse" />
          ))}
        </div>

        {/* 스켈레톤 카드 6개 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-border bg-white">
              <div className="aspect-[4/3] bg-warm-gray animate-pulse" />
              <div className="p-5 space-y-2">
                <div className="h-4 w-3/4 bg-warm-gray rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-warm-gray rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
