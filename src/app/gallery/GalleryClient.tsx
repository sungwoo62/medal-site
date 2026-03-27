'use client'

import { useState } from 'react'
import { Award } from 'lucide-react'
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
  const filtered = filter === '전체' ? items : items.filter((i) => i.category === filter)

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
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl overflow-hidden border border-border bg-white hover:shadow-lg transition-all duration-300"
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
    </div>
  )
}
