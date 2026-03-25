import Link from 'next/link'
import { ArrowRight, Award, Palette, Truck, Users, ThumbsUp, Clock, CheckCircle2 } from 'lucide-react'

const PROCESS_STEPS = [
  {
    step: '01',
    icon: Palette,
    title: '디자인 상담',
    desc: '원하시는 디자인과 사양을 상담합니다. 시안을 제작하여 확인드립니다.',
  },
  {
    step: '02',
    icon: Award,
    title: '제작 진행',
    desc: '승인된 디자인으로 최고급 소재를 사용하여 정밀 제작합니다.',
  },
  {
    step: '03',
    icon: Truck,
    title: '납품 완료',
    desc: '꼼꼼한 품질 검수 후 안전하게 포장하여 납품합니다.',
  },
]

const GALLERY_ITEMS = [
  { title: '서울국제마라톤 완주 메달', category: '마라톤', color: 'from-amber-900/40 to-amber-700/20' },
  { title: '전국체육대회 금메달', category: '체육대회', color: 'from-yellow-900/40 to-yellow-700/20' },
  { title: '기업 우수사원 시상패', category: '시상식', color: 'from-orange-900/40 to-orange-700/20' },
  { title: '창립기념 한정판 메달', category: '기업행사', color: 'from-amber-800/40 to-amber-600/20' },
  { title: '대학 체육대회 메달 세트', category: '체육대회', color: 'from-yellow-800/40 to-yellow-600/20' },
  { title: '자선행사 기념 메달', category: '기업행사', color: 'from-orange-800/40 to-orange-600/20' },
]

const TRUST_STATS = [
  { icon: Users, value: '2,500+', label: '납품 고객사' },
  { icon: Award, value: '15,000+', label: '제작 메달 수' },
  { icon: ThumbsUp, value: '99.2%', label: '고객 만족도' },
  { icon: Clock, value: '7일~', label: '최소 납기' },
]

export default function HomePage() {
  return (
    <>
      {/* 히어로 */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 배경 그라디언트 */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark to-dark-light" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-16">
          <div className="animate-fade-in-up">
            <p className="text-gold text-sm font-semibold tracking-[0.3em] uppercase mb-6">
              Premium Medal Manufacturing
            </p>
          </div>

          <h1 className="animate-fade-in-up animate-delay-1 text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6">
            당신의 순간을<br />
            <span className="gold-shimmer">금속에 새기다</span>
          </h1>

          <p className="animate-fade-in-up animate-delay-2 text-white/40 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            마라톤 완주의 감동, 시상의 영광, 기념의 순간까지.<br />
            최고급 소재와 장인 정신으로 하나뿐인 메달을 제작합니다.
          </p>

          <div className="animate-fade-in-up animate-delay-3 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quote"
              className="px-8 py-3.5 bg-gold text-dark font-semibold rounded-lg hover:bg-gold-light transition-all hover:shadow-lg hover:shadow-gold/20"
            >
              무료 견적 신청
            </Link>
            <Link
              href="/gallery"
              className="px-8 py-3.5 gold-border text-gold font-semibold rounded-lg hover:bg-gold/10 transition-all flex items-center justify-center gap-2"
            >
              제작 사례 보기
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 제작 프로세스 */}
      <section className="py-24 bg-dark-light">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-3">Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">간편한 3단계 제작</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROCESS_STEPS.map(({ step, icon: Icon, title, desc }) => (
              <div
                key={step}
                className="relative bg-dark-lighter rounded-2xl p-8 gold-border gold-glow hover:border-gold/50 transition-all group"
              >
                <div className="text-gold/20 text-5xl font-black absolute top-4 right-6">{step}</div>
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                  <Icon size={22} className="text-gold" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 제작 사례 */}
      <section className="py-24 bg-dark">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-3">Portfolio</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">제작 사례</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GALLERY_ITEMS.map((item) => (
              <div
                key={item.title}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden gold-border hover:border-gold/50 transition-all cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color}`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Award size={48} className="text-gold/30 group-hover:text-gold/50 transition-colors" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
                  <span className="text-[10px] font-semibold text-gold/80 tracking-wider uppercase">{item.category}</span>
                  <h3 className="text-sm font-semibold text-white mt-1">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-gold text-sm font-semibold hover:text-gold-light transition-colors"
            >
              전체 사례 보기 <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* 신뢰 지표 */}
      <section className="py-20 bg-dark-light border-y border-dark-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {TRUST_STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <Icon size={24} className="text-gold mx-auto mb-3" />
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{value}</p>
                <p className="text-sm text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-dark relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold/5 blur-[100px]" />
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <CheckCircle2 size={40} className="text-gold mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            지금 바로 견적을 받아보세요
          </h2>
          <p className="text-white/40 mb-8 leading-relaxed">
            전문 상담사가 24시간 내에 맞춤 견적을 보내드립니다.<br />
            소량 주문도 환영합니다.
          </p>
          <Link
            href="/quote"
            className="inline-block px-10 py-4 bg-gold text-dark font-bold rounded-xl hover:bg-gold-light transition-all hover:shadow-lg hover:shadow-gold/20 text-lg"
          >
            무료 견적 신청하기
          </Link>
        </div>
      </section>
    </>
  )
}
