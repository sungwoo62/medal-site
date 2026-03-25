import { Phone, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full border-2 border-rose flex items-center justify-center">
                <span className="text-[9px] font-black text-rose">MF</span>
              </div>
              <div>
                <p className="text-sm font-bold leading-none">Medal of Finisher</p>
                <p className="text-[10px] text-rose mt-0.5">메달 전문 제작</p>
              </div>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
              끝까지 해낸 모든 순간을,<br />
              정교한 메달에 새깁니다.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">메뉴</h4>
            <div className="space-y-2.5">
              {[
                { href: '/gallery', label: '제작 사례' },
                { href: '/process', label: '제작 안내' },
                { href: '/quote', label: '견적 신청' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="block text-sm text-white/40 hover:text-rose transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">연락처</h4>
            <div className="space-y-2.5 text-sm text-white/40">
              <div className="flex items-center gap-2.5">
                <Phone size={13} className="text-rose/70" />
                010-1234-5678
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={13} className="text-rose/70" />
                hello@medaloffinisher.com
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin size={13} className="text-rose/70" />
                서울특별시 강남구
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs text-white/20">
          &copy; {new Date().getFullYear()} Medal of Finisher. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
