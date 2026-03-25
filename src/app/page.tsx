import Link from 'next/link'
import { ArrowRight, Palette, Hammer, Truck, Award, Users, ThumbsUp, Clock, Trophy } from 'lucide-react'

const TRUST_STATS = [
  { value: '50,000+', label: '누적 제작', suffix: '개' },
  { value: '98%', label: '고객 만족도', suffix: '' },
  { value: '5일', label: '최단 납기', suffix: '' },
  { value: '500+', label: '거래처', suffix: '곳' },
]

const CATEGORIES = [
  {
    icon: Trophy,
    title: '마라톤 메달',
    desc: '완주의 감동을 메달에 담습니다. 풀/하프/10K 등 다양한 규격.',
    gradient: 'from-amber-50 to-orange-50',
    iconColor: 'text-amber-600',
  },
  {
    icon: Award,
    title: '체육대회 메달',
    desc: '금·은·동 세트 제작. 학교, 지역, 전국 대회 맞춤 디자인.',
    gradient: 'from-blue-50 to-sky-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Users,
    title: '시상식 메달',
    desc: '우수사원, 공로상, 감사패. 격식 있는 시상에 어울리는 품격.',
    gradient: 'from-violet-50 to-purple-50',
    iconColor: 'text-violet-600',
  },
  {
    icon: Hammer,
    title: '기업행사 메달',
    desc: '창립기념, 워크숍, 해커톤. 브랜드를 담은 특별한 기념품.',
    gradient: 'from-rose-50 to-pink-50',
    iconColor: 'text-rose-600',
  },
]

const PROCESS_STEPS = [
  {
    num: '01',
    icon: Palette,
    title: '디자인 상담',
    desc: '원하시는 컨셉을 전달해 주세요. 전문 디자이너가 시안을 제작하여 확인드립니다.',
  },
  {
    num: '02',
    icon: Hammer,
    title: '정밀 제작',
    desc: '승인된 디자인으로 금형을 제작하고, 최고급 소재로 정밀하게 제작합니다.',
  },
  {
    num: '03',
    icon: Truck,
    title: '품질검수 & 납품',
    desc: '전수 검사를 거쳐 안전하게 포장, 원하시는 장소로 배송해 드립니다.',
  },
]

const GALLERY_ITEMS = [
  { title: '서울국제마라톤 완주 메달', cat: '마라톤', detail: '금도금 다이캐스팅 · 1,200개' },
  { title: '전국체육대회 금·은·동', cat: '체육대회', detail: '3종 세트 · 각 100개' },
  { title: '기업 우수사원 시상패', cat: '시상식', detail: '아크릴+금속 복합 · 50개' },
  { title: '창립 30주년 기념 메달', cat: '기업행사', detail: '순은 도금 한정판 · 500개' },
  { title: '부산 해변마라톤 완주 메달', cat: '마라톤', detail: '앤틱실버 · 2,000개' },
  { title: '올해의 교사상 시상메달', cat: '시상식', detail: '고급 금도금 · 30개' },
]

const GRADIENTS: Record<string, string> = {
  '마라톤': 'from-amber-100 to-amber-50',
  '체육대회': 'from-blue-100 to-blue-50',
  '시상식': 'from-violet-100 to-violet-50',
  '기업행사': 'from-rose-100 to-rose-50',
}

export default function HomePage() {
  return (
    <>
      {/* ── 히어로 ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 배경 이미지 대용 (다크 그라디언트) */}
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center pt-16">
          <p className="anim-fade-up text-rose text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase mb-5">
            Medal of Finisher
          </p>

          <h1 className="anim-fade-up anim-d1 text-3xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.2] mb-5">
            끝까지 해낸<br />모든 순간을,<br />
            <span className="text-rose">메달에 새기다</span>
          </h1>

          <p className="anim-fade-up anim-d2 text-white/50 text-sm sm:text-base max-w-lg mx-auto mb-10 leading-relaxed">
            마라톤, 체육대회, 시상식 —<br className="sm:hidden" />
            당신의 성취를 정교한 메달로 기록합니다
          </p>

          <div className="anim-fade-up anim-d3">
            <Link
              href="/quote"
              className="inline-block px-8 py-3.5 bg-rose text-white font-semibold rounded-full hover:bg-rose-dark transition-all hover:shadow-lg hover:shadow-rose/25 text-sm"
            >
              무료 견적 받기
            </Link>
          </div>
        </div>

        {/* 하단 스크롤 힌트 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ── 신뢰 지표 ── */}
      <section className="py-16 bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {TRUST_STATS.map(({ value, label, suffix }) => (
              <div key={label} className="reveal text-center">
                <p className="text-3xl sm:text-4xl font-bold text-charcoal">
                  {value}
                </p>
                <p className="text-sm text-charcoal-light mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 제품 카테고리 ── */}
      <section className="py-20 sm:py-24 bg-warm-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14 reveal">
            <p className="text-rose text-xs font-semibold tracking-[0.2em] uppercase mb-2">Products</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal">제품 카테고리</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map(({ icon: Icon, title, desc, gradient, iconColor }) => (
              <div
                key={title}
                className={`reveal group bg-gradient-to-br ${gradient} rounded-2xl p-6 border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
              >
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Icon size={20} className={iconColor} />
                </div>
                <h3 className="text-base font-bold text-charcoal mb-2">{title}</h3>
                <p className="text-xs text-charcoal-light leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 제작 공정 ── */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14 reveal">
            <p className="text-rose text-xs font-semibold tracking-[0.2em] uppercase mb-2">Process</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal">간편한 3단계 제작</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROCESS_STEPS.map(({ num, icon: Icon, title, desc }) => (
              <div key={num} className="reveal text-center">
                <div className="relative inline-block mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-rose/10 flex items-center justify-center mx-auto">
                    <Icon size={26} className="text-rose" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-rose text-white text-xs font-bold flex items-center justify-center">
                    {num}
                  </span>
                </div>
                <h3 className="text-base font-bold text-charcoal mb-2">{title}</h3>
                <p className="text-xs text-charcoal-light leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 제작 사례 갤러리 ── */}
      <section className="py-20 sm:py-24 bg-warm-gray">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14 reveal">
            <p className="text-rose text-xs font-semibold tracking-[0.2em] uppercase mb-2">Portfolio</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal">제작 사례</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GALLERY_ITEMS.map((item) => (
              <div
                key={item.title}
                className={`reveal group rounded-2xl overflow-hidden border border-border bg-white hover:shadow-lg transition-all duration-300`}
              >
                <div className={`aspect-[4/3] bg-gradient-to-br ${GRADIENTS[item.cat] ?? 'from-gray-100 to-gray-50'} flex items-center justify-center relative`}>
                  <Award size={48} className="text-charcoal/10 group-hover:text-rose/30 transition-colors duration-500" />
                  <span className="absolute top-3 left-3 text-[10px] font-semibold text-rose bg-rose/10 px-2.5 py-1 rounded-full">{item.cat}</span>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-bold text-charcoal mb-1">{item.title}</h3>
                  <p className="text-xs text-charcoal-light">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 reveal">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-rose text-sm font-semibold hover:gap-3 transition-all"
            >
              전체 사례 보기 <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 견적 CTA ── */}
      <section className="py-20 sm:py-24 bg-rose relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <div className="reveal">
            <p className="text-white/70 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Free Estimate</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
              지금 바로 견적 받기
            </h2>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              전문 상담사가 24시간 내에 맞춤 견적서를 보내드립니다.<br />
              소량 주문도 환영합니다.
            </p>
            <Link
              href="/quote"
              className="inline-block px-10 py-3.5 bg-white text-rose font-bold rounded-full hover:shadow-xl transition-all text-sm"
            >
              무료 견적 신청하기
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
