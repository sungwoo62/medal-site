'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText } from 'lucide-react'

export default function TaxInvoiceForm({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    business_name: '',
    business_number: '',
    representative: '',
    email: '',
  })

  const set = (key: string, value: string) => setForm({ ...form, [key]: value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/tax-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, ...form }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || '발행 신청에 실패했습니다.')
      return
    }

    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-rose font-semibold hover:underline"
      >
        <FileText size={14} />
        세금계산서 발행 신청
      </button>
    )
  }

  const inputClass = 'w-full px-3 py-2.5 bg-warm-white rounded-lg border border-border text-charcoal text-sm placeholder-charcoal-light/40 focus:outline-none focus:border-rose/50 focus:ring-2 focus:ring-rose/10 transition-all'

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-2">
      <div>
        <label className="block text-xs font-medium text-charcoal mb-1">사업자명</label>
        <input type="text" value={form.business_name} onChange={(e) => set('business_name', e.target.value)} className={inputClass} required />
      </div>
      <div>
        <label className="block text-xs font-medium text-charcoal mb-1">사업자등록번호</label>
        <input type="text" value={form.business_number} onChange={(e) => set('business_number', e.target.value)} placeholder="000-00-00000" className={inputClass} required />
      </div>
      <div>
        <label className="block text-xs font-medium text-charcoal mb-1">대표자명</label>
        <input type="text" value={form.representative} onChange={(e) => set('representative', e.target.value)} className={inputClass} required />
      </div>
      <div>
        <label className="block text-xs font-medium text-charcoal mb-1">수신 이메일</label>
        <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} required />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-rose text-white text-xs font-semibold rounded-full hover:bg-rose-dark disabled:opacity-50 transition-all"
        >
          {loading ? '신청 중...' : '발행 신청'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-xs text-charcoal-light hover:text-charcoal transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  )
}
