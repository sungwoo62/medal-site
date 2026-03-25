'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-gold">MEDAL</span>
          <span className="text-white/80">CRAFT</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                pathname === href ? 'text-gold' : 'text-white/60 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/quote"
            className="px-5 py-2 bg-gold text-dark text-sm font-semibold rounded-lg hover:bg-gold-light transition-colors"
          >
            무료 견적
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white/70">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-dark-light border-t border-dark-border animate-fade-in">
          <nav className="max-w-6xl mx-auto px-6 py-4 space-y-3">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`block text-sm font-medium py-2 ${
                  pathname === href ? 'text-gold' : 'text-white/60'
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/quote"
              onClick={() => setOpen(false)}
              className="block text-center mt-3 px-5 py-2.5 bg-gold text-dark text-sm font-semibold rounded-lg"
            >
              무료 견적
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
