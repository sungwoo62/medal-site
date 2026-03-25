'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const navItems = [
  { href: '/', label: '홈' },
  { href: '/gallery', label: '제작 사례' },
  { href: '/process', label: '제작 안내' },
  { href: '/quote', label: '견적 신청' },
]

export default function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isHome = pathname === '/'
  const headerBg = scrolled || !isHome
    ? 'bg-white/95 backdrop-blur-md shadow-sm'
    : 'bg-transparent'
  const textColor = scrolled || !isHome ? 'text-charcoal' : 'text-white'
  const logoColor = scrolled || !isHome ? 'border-rose text-rose' : 'border-white/60 text-white'
  const logoText = scrolled || !isHome ? 'text-charcoal' : 'text-white'

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-colors ${logoColor}`}>
            <span className="text-[10px] font-black tracking-tight">MF</span>
          </div>
          <div className={`hidden sm:block transition-colors ${logoText}`}>
            <p className="text-sm font-bold leading-none tracking-tight">Medal of Finisher</p>
            <p className="text-[10px] text-rose font-medium">메달 전문 제작</p>
          </div>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-7">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-[13px] font-medium transition-colors ${
                pathname === href
                  ? 'text-rose'
                  : `${textColor} opacity-70 hover:opacity-100`
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/quote"
            className="px-5 py-2 bg-rose text-white text-[13px] font-semibold rounded-full hover:bg-rose-dark transition-colors"
          >
            견적 신청
          </Link>
        </nav>

        {/* Mobile */}
        <button onClick={() => setOpen(!open)} className={`md:hidden ${textColor}`}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-border anim-fade-in">
          <nav className="max-w-6xl mx-auto px-6 py-4 space-y-1">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`block py-2.5 text-sm font-medium ${
                  pathname === href ? 'text-rose' : 'text-charcoal/70'
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/quote"
              onClick={() => setOpen(false)}
              className="block text-center mt-3 px-5 py-2.5 bg-rose text-white text-sm font-semibold rounded-full"
            >
              견적 신청
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
