import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ScrollReveal from '@/components/ScrollReveal'

export const metadata: Metadata = {
  metadataBase: new URL('https://medaloffinisher.com'),
  title: {
    default: 'Medal of Finisher | 맞춤 메달 전문 제작',
    template: '%s | Medal of Finisher',
  },
  description: '마라톤, 체육대회, 시상식, 기업행사 맞춤 메달 전문 제작. 소량부터 대량까지 최고 품질의 커스텀 메달을 제작합니다. 빠른 납기, 합리적인 가격.',
  keywords: ['맞춤 메달', '커스텀 메달', '메달 제작', '마라톤 메달', '체육대회 메달', '시상식 메달', '기업행사 메달', '소량 메달 제작', '대량 메달 제작', 'Medal of Finisher'],
  authors: [{ name: '주식회사 올팩마이스터' }],
  creator: '주식회사 올팩마이스터',
  publisher: '주식회사 올팩마이스터',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://medaloffinisher.com',
    siteName: 'Medal of Finisher',
    title: 'Medal of Finisher | 맞춤 메달 전문 제작',
    description: '마라톤, 체육대회, 시상식, 기업행사 맞춤 메달 전문 제작. 소량부터 대량까지 최고 품질의 커스텀 메달을 제작합니다.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Medal of Finisher 맞춤 메달 전문 제작' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Medal of Finisher | 맞춤 메달 전문 제작',
    description: '마라톤, 체육대회, 시상식, 기업행사 맞춤 메달 전문 제작.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://medaloffinisher.com',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Medal of Finisher',
  description: '맞춤 메달 전문 제작 업체. 마라톤, 체육대회, 시상식, 기업행사 메달 제작.',
  url: 'https://medaloffinisher.com',
  telephone: '1551-3797',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '길주로 411번길 20 디아크원 618,619호',
    addressLocality: '부천시',
    addressRegion: '경기도',
    addressCountry: 'KR',
  },
  priceRange: '₩₩',
  openingHours: 'Mo-Fr 09:00-18:00',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-warm-white text-charcoal">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ScrollReveal />
      </body>
    </html>
  )
}
