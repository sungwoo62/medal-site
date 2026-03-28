import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MessageSquare, PenTool, CheckSquare, Hammer, Truck } from 'lucide-react'

export const metadata: Metadata = {
  title: '메달 제작 프로세스 | 주문부터 납품까지',
  description: 'Medal of Finisher 맞춤 메달 제작 과정을 안내합니다. 상담, 디자인, 제작, 납품까지 전 과정을 투명하게 공개합니다.',
  alternates: { canonical: 'https://medaloffinisher.com/process' },
  openGraph: {
    title: '메달 제작 프로세스 | 주문부터 납품까지',
    description: '상담부터 납품까지 전 과정을 안내합니다.',
    url: 'https://medaloffinisher.com/process',
  },
}

const STEPS = [
  {
    num: '01',
    icon: MessageSquare,
    title: '문의 및 견적',
    desc: '원하시는 메달 디자인, 수량, 용도를 알려주세요. 견적서를 이메일로 보내드립니다.',
  },
  {
    num: '02',
    icon: PenTool,
    title: '시안 확인',
    desc: '전문 디자이너가 제작한 시안을 검토해주세요. 수정은 2회까지 가능합니다.',
  },
  {
    num: '03',
    icon: CheckSquare,
    title: '최종 확인 및 결제',
    desc: '시안 확정 후 제작에 들어갑니다.',
  },
  {
    num: '04',
    icon: Hammer,
    title: '제작',
    desc: '정밀한 공정을 거쳐 메달을 제작합니다.',
  },
  {
    num: '05',
    icon: Truck,
    title: '납품',
    desc: '완성된 메달을 검수 후 배송해드립니다.',
  },
]

export default function ProcessPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-warm-white">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <p className="text-rose text-xs font-semibold tracking-[0.2em] uppercase mb-2">Process</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3">주문 프로세스</h1>
          <p className="text-charcoal-light text-sm">문의부터 납품까지, 간편한 5단계로 진행됩니다.</p>
        </div>

        {/* 타임라인 */}
        <section className="mb-20">
          <div className="relative">
            <div className="absolute left-[23px] top-0 bottom-0 w-px bg-border hidden sm:block" />
            <div className="space-y-6">
              {STEPS.map(({ num, icon: Icon, title, desc }) => (
                <div key={num} className="reveal flex gap-5 relative">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-rose flex items-center justify-center shrink-0 z-10 shadow-sm">
                    <Icon size={20} className="text-rose" />
                  </div>
                  <div className="bg-white rounded-2xl border border-border p-5 flex-1 hover:shadow-md hover:border-rose/30 transition-all">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-[10px] font-bold text-rose bg-rose/10 px-2.5 py-0.5 rounded-full">STEP {num}</span>
                      <h3 className="text-sm font-bold text-charcoal">{title}</h3>
                    </div>
                    <p className="text-sm text-charcoal-light leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 제작 기간 안내 */}
        <section className="mb-20 reveal">
          <div className="bg-white rounded-2xl border border-border p-6 sm:p-8">
            <h2 className="text-lg font-bold text-charcoal mb-4">제작 기간</h2>
            <p className="text-sm text-charcoal-light leading-relaxed mb-4">
              주문 확정 후 <span className="font-semibold text-charcoal">약 30~40일</span>이 소요됩니다.
            </p>
            <p className="text-sm text-charcoal-light leading-relaxed">
              메달 제작은 금형 제작, 주조, 도금, 마감 등 여러 공정을 거치기 때문에 충분한 시간이 필요합니다.
              납기 단축은 어렵습니다. <span className="font-semibold text-charcoal">여유 있게 문의해 주세요.</span>
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center reveal">
          <Link
            href="/quote"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-rose text-white font-semibold rounded-full hover:bg-rose-dark transition-all text-sm hover:shadow-lg hover:shadow-rose/25"
          >
            무료 견적 신청하기 <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  )
}
