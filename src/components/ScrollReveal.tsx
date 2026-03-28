'use client'
import { useEffect } from 'react'
export default function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')

    // viewport 밖에 있는 요소에만 .animate 추가
    els.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top >= window.innerHeight || rect.bottom <= 0) {
        el.classList.add('animate')
      }
    })

    // IntersectionObserver로 viewport 진입 시 .visible 추가
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    )

    els.forEach((el) => {
      if (el.classList.contains('animate')) {
        observer.observe(el)
      }
    })

    return () => observer.disconnect()
  }, [])
  return null
}
