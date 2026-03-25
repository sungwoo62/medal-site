import { Palette, Layers, Hammer, Sparkles, Truck, Shield, Clock, CheckCircle2 } from 'lucide-react'

const MATERIALS = [
  { name: '아연합금 (다이캐스팅)', desc: '가장 보편적인 소재. 정밀한 디테일 표현에 탁월하며, 금/은/동 도금 가능.' },
  { name: '구리/황동', desc: '고급스러운 질감과 무게감. 앤틱 처리 시 클래식한 분위기 연출.' },
  { name: '스테인리스', desc: '가볍고 내구성이 뛰어남. 레이저 각인에 적합.' },
  { name: '순금/순은 도금', desc: '최고급 마감. 프리미엄 시상 및 기념 용도에 적합.' },
]

const TECHNIQUES = [
  { icon: Layers, name: '다이캐스팅', desc: '금형으로 정밀 주조. 복잡한 3D 형상 구현 가능.' },
  { icon: Palette, name: '에나멜/에폭시', desc: '선명한 컬러 표현. 로고와 디자인에 생동감 부여.' },
  { icon: Hammer, name: '프레스 가공', desc: '얇고 가벼운 메달 제작. 대량 생산에 유리.' },
  { icon: Sparkles, name: '레이저 각인', desc: '정밀한 텍스트와 패턴. 개인 맞춤 각인 가능.' },
]

const TIMELINE = [
  { step: '1', title: '상담 & 견적', desc: '요청사항 확인 후 견적서 발송', days: '1일' },
  { step: '2', title: '디자인 시안', desc: '전문 디자이너가 시안 제작', days: '2~3일' },
  { step: '3', title: '시안 확인', desc: '고객 피드백 반영 및 최종 승인', days: '1~2일' },
  { step: '4', title: '금형 제작', desc: '승인된 디자인으로 금형 가공', days: '3~5일' },
  { step: '5', title: '메달 제작', desc: '주조, 도금, 도색, 조립', days: '5~7일' },
  { step: '6', title: '품질 검수 & 납품', desc: '전수 검사 후 안전 포장 배송', days: '1~2일' },
]

export default function ProcessPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-3">How We Make</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">제작 안내</h1>
          <p className="text-white/40">소재 선택부터 납품까지, 투명한 제작 과정을 안내합니다.</p>
        </div>

        {/* 소재 안내 */}
        <section className="mb-20">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield size={20} className="text-gold" />
            소재 안내
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MATERIALS.map((m) => (
              <div key={m.name} className="bg-dark-lighter rounded-xl gold-border p-5 hover:border-gold/40 transition-colors">
                <h3 className="text-sm font-bold text-gold mb-1.5">{m.name}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 공법 안내 */}
        <section className="mb-20">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Hammer size={20} className="text-gold" />
            주요 공법
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TECHNIQUES.map(({ icon: Icon, name, desc }) => (
              <div key={name} className="bg-dark-lighter rounded-xl gold-border p-5 hover:border-gold/40 transition-colors flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-gold" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{name}</h3>
                  <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 납기 타임라인 */}
        <section className="mb-20">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock size={20} className="text-gold" />
            제작 일정 (표준 납기 약 14~20일)
          </h2>
          <div className="relative">
            {/* 라인 */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-dark-border" />

            <div className="space-y-6">
              {TIMELINE.map((item) => (
                <div key={item.step} className="flex gap-5 relative">
                  <div className="w-10 h-10 rounded-full gold-border bg-dark-lighter flex items-center justify-center shrink-0 z-10">
                    <span className="text-xs font-bold text-gold">{item.step}</span>
                  </div>
                  <div className="bg-dark-lighter rounded-xl gold-border p-4 flex-1 hover:border-gold/40 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-white">{item.title}</h3>
                      <span className="text-[10px] font-semibold text-gold/70 bg-gold/10 px-2 py-0.5 rounded-full">{item.days}</span>
                    </div>
                    <p className="text-xs text-white/40">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 참고사항 */}
        <section className="bg-dark-lighter rounded-2xl gold-border gold-glow p-6 sm:p-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-gold" />
            참고사항
          </h2>
          <ul className="space-y-2.5 text-sm text-white/50">
            <li className="flex gap-2">
              <span className="text-gold shrink-0">•</span>
              소량 주문 (10개~)부터 대량 주문 (10,000개+)까지 모두 가능합니다.
            </li>
            <li className="flex gap-2">
              <span className="text-gold shrink-0">•</span>
              긴급 납기 (7일 이내)도 상담 후 대응 가능합니다. (별도 비용 발생)
            </li>
            <li className="flex gap-2">
              <span className="text-gold shrink-0">•</span>
              디자인 시안은 무료로 제공되며, 3회까지 수정 가능합니다.
            </li>
            <li className="flex gap-2">
              <span className="text-gold shrink-0">•</span>
              리본, 케이스, 거치대 등 부자재도 함께 제작 가능합니다.
            </li>
            <li className="flex gap-2">
              <span className="text-gold shrink-0">•</span>
              샘플 제작이 필요한 경우 별도 안내드립니다.
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
