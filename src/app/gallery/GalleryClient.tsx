'use client'

import { useState, useEffect, useCallback } from 'react'
import { Award, X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { GalleryItem } from '@/lib/supabase/gallery'

const CATEGORIES = ['전체', '마라톤', '체육대회', '시상식', '기업행사']

const GRADIENTS: Record<string, string> = {
  '마라톤': 'from-amber-100 to-amber-50',
  '체육대회': 'from-blue-100 to-blue-50',
  '시상식': 'from-violet-100 to-violet-50',
  '기업행사': 'from-rose-100 to-rose-50',
}

export default function GalleryClient({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState('전체')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const filtered = filter === '전체' ? items : items.filter((i) => i.category === filter)

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i))
  }, [])
  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i !== null && i < filtered.length - 1 ? i + 1 : i))
  }, [filtered.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [lightboxIndex, closeLightbox, goPrev, goNext])

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-warm-white">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <p className="text-rose text-xs font-semibold tracking-[0.2em] uppercase mb-2">Portfolio</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3">제작 사례</h1>
          <p className="text-charcoal-light text-sm">다양한 분야에서 신뢰받는 메달을 제작해 왔습니다.</p>
        </div>

        {/* 필터 */}
        <div className="flex gap-2.5 justify-center flex-wrap mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                filter === cat
                  ? 'bg-rose text-white shadow-sm'
                  : 'bg-white text-charcoal-light border border-border hover:border-rose/40 hover:text-rose'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 빈 상태 — 전체 데이터 없음 */}
        {items.length === 0 && (
          <div className="text-center py-20">
            <h2 className="text-base font-bold text-charcoal mb-2">아직 등록된 사례가 없습니다</h2>
            <p className="text-sm text-charcoal-light">곧 새로운 제작 사례를 업로드할 예정입니다. 견적 문의는 언제든지 가능합니다.</p>
          </div>
        )}

        {/* 빈 상태 — 필터 결과 없음 */}
        {items.length > 0 && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sm text-charcoal-light">해당 카테고리의 제작 사례가 없습니다</p>
          </div>
        )}

        {/* 그리드 */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setLightboxIndex(idx)}
                className="group rounded-2xl overflow-hidden border border-border bg-white hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div
                  className={`aspect-[4/3] ${item.image_url ? '' : `bg-gradient-to-br ${GRADIENTS[item.category] ?? 'from-gray-100 to-gray-50'}`} flex items-center justify-center relative overflow-hidden`}
                >
                  {item.image_url ? (
                    <img
                      src={`/api/secure/files?bucket=gallery&path=${item.image_url}`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Award size={52} className="text-charcoal/8 group-hover:text-rose/25 transition-colors duration-500" />
                  )}
                  <span className="absolute top-3 left-3 text-[10px] font-semibold text-rose bg-rose/10 px-2.5 py-1 rounded-full">
                    {item.category}
                  </span>
                  <span className="absolute top-3 right-3 text-[10px] text-charcoal-light">{item.year}</span>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-bold text-charcoal mb-1">{item.title}</h3>
                  <p className="text-xs text-charcoal-light">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 라이트박스 */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            aria-label="닫기"
          >
            <X size={28} />
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              className="absolute left-4 text-white/70 hover:text-white transition-colors"
              aria-label="이전"
            >
              <ChevronLeft size={36} />
            </button>
          )}

          {lightboxIndex < filtered.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext() }}
              className="absolute right-4 text-white/70 hover:text-white transition-colors"
              aria-label="다음"
            >
              <ChevronRight size={36} />
            </button>
          )}

          <div
            className="max-w-4xl max-h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {filtered[lightboxIndex].image_url ? (
              <img
                src={`/api/secure/files?bucket=gallery&path=${filtered[lightboxIndex].image_url}`}
                alt={filtered[lightboxIndex].title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            ) : (
              <div className={`w-[600px] aspect-[4/3] bg-gradient-to-br ${GRADIENTS[filtered[lightboxIndex].category] ?? 'from-gray-100 to-gray-50'} flex items-center justify-center rounded-lg`}>
                <Award size={80} className="text-charcoal/10" />
              </div>
            )}
            <div className="text-center mt-4">
              <h3 className="text-white font-bold">{filtered[lightboxIndex].title}</h3>
              <p className="text-white/60 text-sm mt-1">{filtered[lightboxIndex].description}</p>
              <span className="text-white/40 text-xs">{filtered[lightboxIndex].category} · {filtered[lightboxIndex].year}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
