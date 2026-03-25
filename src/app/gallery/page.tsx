'use client'

import { useState } from 'react'
import { Award } from 'lucide-react'

const CATEGORIES = ['전체', '마라톤', '체육대회', '시상식', '기업행사']

const ITEMS = [
  { title: '서울국제마라톤 완주메달', cat: '마라톤', year: '2024', desc: '금도금 다이캐스팅, 리본 포함 1,200개' },
  { title: '전국체육대회 금메달', cat: '체육대회', year: '2024', desc: '순금 도금, 고급 케이스 포함 300개' },
  { title: '기업 우수사원 시상패', cat: '시상식', year: '2024', desc: '아크릴+금속 복합소재, 레이저 각인 50개' },
  { title: '창립 30주년 기념메달', cat: '기업행사', year: '2024', desc: '순은 도금, 한정판 시리얼 넘버 500개' },
  { title: '부산 해변마라톤 메달', cat: '마라톤', year: '2024', desc: '앤틱실버 도금, 커스텀 리본 2,000개' },
  { title: '전국 수영대회 메달세트', cat: '체육대회', year: '2023', desc: '금/은/동 3종, 각 100개' },
  { title: '올해의 교사상 시상메달', cat: '시상식', year: '2023', desc: '고급 금도금, 벨벳 케이스 30개' },
  { title: '스타트업 해커톤 메달', cat: '기업행사', year: '2023', desc: '무광 블랙+골드 2톤, 200개' },
  { title: '춘천마라톤 기념메달', cat: '마라톤', year: '2023', desc: '풀컬러 에폭시, 3,000개 대량 제작' },
  { title: '도민체전 종합우승 메달', cat: '체육대회', year: '2023', desc: '프리미엄 금도금, 150개' },
  { title: '봉사 공로상 메달', cat: '시상식', year: '2023', desc: '앤틱골드, 나무 케이스 포함 80개' },
  { title: '연말 시상식 메달세트', cat: '기업행사', year: '2023', desc: '다이캐스팅+에나멜, 금/은/동 각 50개' },
]

const GRADIENTS: Record<string, string> = {
  '마라톤': 'from-amber-100 to-amber-50',
  '체육대회': 'from-blue-100 to-blue-50',
  '시상식': 'from-violet-100 to-violet-50',
  '기업행사': 'from-rose-100 to-rose-50',
}

export default function GalleryPage() {
  const [filter, setFilter] = useState('전체')
  const filtered = filter === '전체' ? ITEMS : ITEMS.filter((i) => i.cat === filter)

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-warm-white">
      <div className="max-w-6xl mx-auto">
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

        {/* 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl overflow-hidden border border-border bg-white hover:shadow-lg transition-all duration-300"
            >
              <div className={`aspect-[4/3] bg-gradient-to-br ${GRADIENTS[item.cat] ?? 'from-gray-100 to-gray-50'} flex items-center justify-center relative`}>
                <Award size={52} className="text-charcoal/8 group-hover:text-rose/25 transition-colors duration-500" />
                <span className="absolute top-3 left-3 text-[10px] font-semibold text-rose bg-rose/10 px-2.5 py-1 rounded-full">{item.cat}</span>
                <span className="absolute top-3 right-3 text-[10px] text-charcoal-light">{item.year}</span>
              </div>
              <div className="p-5">
                <h3 className="text-sm font-bold text-charcoal mb-1">{item.title}</h3>
                <p className="text-xs text-charcoal-light">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
