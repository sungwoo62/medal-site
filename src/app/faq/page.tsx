import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: '자주 묻는 질문 (FAQ) | 메달 제작 견적·납기·소재·디자인 안내',
  description: '맞춤 메달 제작에 관한 자주 묻는 질문과 답변. 메달 제작 비용, 최소 주문 수량, 납기일, 소재 종류(아연합금·황동·스테인리스), 디자인 시안, 마라톤 메달·체육대회 메달·시상식 메달 제작 과정을 안내합니다.',
  alternates: { canonical: 'https://medaloffinisher.com/faq' },
  openGraph: {
    title: '자주 묻는 질문 (FAQ) | 맞춤 메달 제작 안내',
    description: '메달 제작 비용, 최소 수량, 납기일, 소재, 디자인 과정 등 궁금한 점을 확인하세요.',
    url: 'https://medaloffinisher.com/faq',
  },
}

const FAQ_ITEMS = [
  {
    q: '최소 주문 수량이 있나요?',
    a: '최소 100개부터 주문 가능합니다.',
  },
  {
    q: '디자인 파일이 없어도 제작할 수 있나요?',
    a: '로고나 참고 이미지만 있어도 제작 가능합니다. 디자이너가 시안을 제작해드립니다.',
  },
  {
    q: '시안 수정은 몇 번까지 가능한가요?',
    a: '유료 디자인 기준 2회까지 수정 가능합니다.',
  },
  {
    q: '샘플을 먼저 받아볼 수 있나요?',
    a: '고객 디자인 기반의 샘플 제작은 어렵습니다. 기 제작된 샘플은 요청 시 확인 가능하나, 재고 상황에 따라 불가할 수 있습니다.',
  },
  {
    q: '리본 색상도 커스텀할 수 있나요?',
    a: '네, 리본 색상과 디자인 커스텀이 가능합니다.',
  },
  {
    q: '뒷면 각인도 되나요?',
    a: '네, 대회명, 날짜, 텍스트 각인 가능합니다.',
  },
  {
    q: '급하게 필요한데 빨리 받을 수 있나요?',
    a: '제작 공정 특성상 납기 단축은 어렵습니다. 여유 있게 문의해 주세요.',
  },
  {
    q: '견적은 어떻게 받나요?',
    a: '상단 견적 문의 폼을 작성해주시면 이메일로 견적서를 보내드립니다.',
  },
  {
    q: '단체/기업 대량 주문 할인이 되나요?',
    a: '수량에 따라 할인이 가능합니다. 문의 시 수량을 함께 알려주세요.',
  },
]

function FaqJsonLd() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  )
}

export default function FaqPage() {
  return (
    <>
      <FaqJsonLd />
      <div className="min-h-screen pt-24 pb-16 px-6 bg-warm-white">
        <div className="max-w-3xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-14">
            <p className="text-rose text-xs font-semibold tracking-[0.2em] uppercase mb-2">FAQ</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3">자주 묻는 질문</h1>
            <p className="text-charcoal-light text-sm">
              맞춤 메달 제작에 관해 궁금한 점을 확인하세요.
              <br className="sm:hidden" /> 추가 문의는{' '}
              <Link href="/quote" className="text-rose font-semibold hover:underline">
                견적 신청
              </Link>
              을 이용해 주세요.
            </p>
          </div>

          {/* FAQ 목록 */}
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-xl border border-border hover:border-rose/30 transition-colors"
              >
                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-semibold text-charcoal select-none">
                  <span>{item.q}</span>
                  <span className="ml-4 text-rose text-lg group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-5 pb-4 text-sm text-charcoal-light leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-14 text-center bg-white rounded-2xl border border-border p-8">
            <h2 className="text-lg font-bold text-charcoal mb-2">원하는 답변을 찾지 못하셨나요?</h2>
            <p className="text-sm text-charcoal-light mb-5">
              메달 제작에 관한 어떤 질문이든 편하게 문의해 주세요.
            </p>
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 px-7 py-3 bg-rose text-white font-semibold rounded-full hover:bg-rose-dark transition-all text-sm"
            >
              무료 견적 신청하기 <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
