import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '메달 견적 문의 | 빠른 견적 상담',
  description: '맞춤 메달 견적을 빠르게 받아보세요. 수량, 디자인, 납기 등 원하는 조건을 입력하면 담당자가 신속하게 연락드립니다.',
  alternates: { canonical: 'https://medaloffinisher.com/quote' },
  openGraph: {
    title: '메달 견적 문의 | 빠른 견적 상담',
    description: '맞춤 메달 견적을 빠르게 받아보세요.',
    url: 'https://medaloffinisher.com/quote',
  },
}

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return children
}
