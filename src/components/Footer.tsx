import { Medal, Phone, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-dark-light border-t border-dark-border">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Medal size={20} className="text-gold" />
              <span className="text-lg font-bold">
                <span className="text-gold">MEDAL</span>
                <span className="text-white/80">CRAFT</span>
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">
              당신의 특별한 순간을 최고 품질의<br />
              맞춤 메달로 기록합니다.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white/80 mb-4">메뉴</h4>
            <div className="space-y-2.5">
              {[
                { href: '/gallery', label: '제작 사례' },
                { href: '/process', label: '제작 안내' },
                { href: '/quote', label: '견적 신청' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="block text-sm text-white/40 hover:text-gold transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white/80 mb-4">연락처</h4>
            <div className="space-y-2.5 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gold/60" />
                010-1234-5678
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-gold/60" />
                info@medalcraft.kr
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-gold/60" />
                서울특별시 강남구
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-dark-border text-center text-xs text-white/20">
          &copy; {new Date().getFullYear()} MEDALCRAFT. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
