import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: '메달제작 전문 | 당신의 순간을 금속에 새기다',
  description: '마라톤, 체육대회, 시상식, 기업행사 메달 전문 제작. 소량부터 대량까지, 최고 품질의 맞춤 메달을 제작합니다.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
