'use client'

import { useState } from 'react'
import { Award } from 'lucide-react'

const CATEGORIES = ['전체', '마라톤', '체육대회', '시상식', '기업행사']

const ITEMS = [
  { title: '서울국제마라톤 완주메달', category: '마라톤', year: '2024', desc: '금도금 다이캐스팅, 리본 포함 1,200개' },
  { title: '전국체육대회 금메달', category: '체육대회', year: '2024', desc: '순금 도금, 고급 케이스 포함 300개' },
  { title: '기업 우수사원 시상패', category: '시상식', year: '2024', desc: '아크릴+금속 복합소재, 레이저 각인 50개' },
  { title: '창립 30주년 기념메달', category: '기업행사', year: '2024', desc: '순은 도금, 한정판 시리얼 넘버 500개' },
  { title: '부산 해변마라톤 메달', category: '마라톤', year: '2024', desc: '앤틱실버 도금, 커스텀 리본 2,000개' },
  { title: '전국 수영대회 메달세트', category: '체육대회', year: '2023', desc: '금/은/동 3종, 각 100개' },
  { title: '올해의 교사상 시상메달', category: '시상식', year: '2023', desc: '고급 금도금, 벨벳 케이스 30개' },
  { title: '스타트업 해커톤 메달', category: '기업행사', year: '2023', desc: '무광 블랙+골드 2톤, 200개' },
  { title: '춘천마라톤 기념메달', category: '마라톤', year: '2023', desc: '풀컬러 에폭시, 3,000개 대량 제작' },
  { title: '도민체전 종합우승 메달', category: '체육대회', year: '2023', desc: '프리미엄 금도금, 150개' },
  { title: '봉사 공로상 메달', category: '시상식', year: '2023', desc: '앤틱골드, 나무 케이스 포함 80개' },
  { title: '연말 시상식 메달세트', category: '기업행사', year: '2023', desc: '다이캐스팅+에나멜, 금/은/동 각 50개' },
]

const GRADIENTS: Record<string, string> = {
  '마라톤': 'from-amber-900/50 to-amber-700/20',
  '체육대회': 'from-yellow-900/50 to-yellow-700/20',
  '시상식': 'from-orange-900/50 to-orange-700/20',
  '기업행사': 'from-amber-800/50 to-amber-600/20',
}

export default function GalleryPage() {
  const [filter, setFilter] = useState('전체')

  const filtered = filter === '전체' ? ITEMS : ITEMS.filter((i) => i.category === filter)

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-3">Portfolio</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">제작 사례</h1>
          <p className="text-white/40">다양한 분야에서 신뢰받는 메달을 제작해 왔습니다.</p>
        </div>

        {/* 필터 */}
        <div className="flex gap-3 justify-center flex-wrap mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === cat
                  ? 'bg-gold text-dark'
                  : 'gold-border text-white/50 hover:text-gold hover:border-gold/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 갤러리 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.title}
              className="group relative rounded-2xl overflow-hidden gold-border hover:border-gold/50 transition-all"
            >
              <div className={`aspect-[4/3] bg-gradient-to-br ${GRADIENTS[item.category] ?? 'from-gray-800 to-gray-900'} flex items-center justify-center`}>
                <Award size={56} className="text-gold/20 group-hover:text-gold/40 transition-colors duration-500" />
              </div>
              <div className="p-5 bg-dark-lighter">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-gold/70 tracking-wider uppercase">{item.category}</span>
                  <span className="text-[10px] text-white/30">{item.year}</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-white/40">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
