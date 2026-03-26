'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Paperclip, CheckCircle2 } from 'lucide-react'

const MEDAL_TYPES = ['마라톤', '체육대회', '시상식', '기업행사', '기타']

type QuoteForm = {
  event_name: string
  medal_type: string
  quantity: string
  desired_date: string
  note: string
  contact_name: string
  contact_phone: string
  contact_email: string
}

const EMPTY: QuoteForm = {
  event_name: '',
  medal_type: '마라톤',
  quantity: '',
  desired_date: '',
  note: '',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
}

export default function QuotePage() {
  const [form, setForm] = useState<QuoteForm>(EMPTY)
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (key: keyof QuoteForm, value: string) => setForm({ ...form, [key]: value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.event_name.trim() || !form.contact_name.trim() || !form.contact_phone.trim()) {
      setError('행사명, 이름, 연락처는 필수입니다.')
      return
    }
    setSubmitting(true)

    let file_url: string | null = null
    let file_name: string | null = null
    if (file) {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `quote-files/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('attachments').upload(path, file)
      if (!uploadErr) {
        const { data } = supabase.storage.from('attachments').getPublicUrl(path)
        file_url = data.publicUrl
        file_name = file.name
      }
    }

    const res = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        file_url,
        file_name,
      }),
    })

    setSubmitting(false)
    if (!res.ok) {
      setError('전송에 실패했습니다. 다시 시도해 주세요.')
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-16 bg-warm-white">
        <div className="text-center anim-fade-up">
          <CheckCircle2 size={52} className="text-rose mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-charcoal mb-2">견적이 접수되었습니다</h2>
          <p className="text-charcoal-light text-sm mb-8">1-2 영업일 내 연락드리겠습니다.</p>
          <button
            onClick={() => { setDone(false); setForm(EMPTY); setFile(null) }}
            className="px-6 py-2.5 border border-rose text-rose rounded-full hover:bg-rose/5 transition-colors text-sm font-semibold"
          >
            새 견적 신청
          </button>
        </div>
      </div>
    )
  }

  const inputClass = 'w-full px-4 py-3 bg-white rounded-xl border border-border text-charcoal text-sm placeholder-charcoal-light/40 focus:outline-none focus:border-rose/50 focus:ring-2 focus:ring-rose/10 transition-all'

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-warm-white">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-rose text-xs font-semibold tracking-[0.2em] uppercase mb-2">Free Estimate</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3">견적 신청</h1>
          <p className="text-charcoal-light text-sm">아래 양식을 작성해 주시면 빠르게 견적을 보내드립니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              행사명 <span className="text-rose">*</span>
            </label>
            <input type="text" placeholder="예: 2025 서울마라톤" value={form.event_name} onChange={(e) => set('event_name', e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">메달 종류</label>
              <select value={form.medal_type} onChange={(e) => set('medal_type', e.target.value)} className={inputClass}>
                {MEDAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">수량</label>
              <input type="number" min="1" placeholder="예: 500" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">희망 납기일</label>
            <input type="date" value={form.desired_date} onChange={(e) => set('desired_date', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">요청사항</label>
            <textarea rows={4} placeholder="디자인 참고 사항, 소재 선호, 특이사항 등을 적어주세요." value={form.note} onChange={(e) => set('note', e.target.value)} className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">참고 파일</label>
            <label className={`flex items-center gap-2 ${inputClass} cursor-pointer hover:border-rose/40`}>
              <Paperclip size={15} className="text-rose/50" />
              <span className="truncate text-charcoal-light/50">{file ? file.name : '디자인 시안, 로고 파일 등'}</span>
              <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          <div className="border-t border-border pt-5">
            <p className="text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-4">연락처 정보</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">이름 <span className="text-rose">*</span></label>
                <input type="text" value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">연락처 <span className="text-rose">*</span></label>
                <input type="tel" placeholder="010-0000-0000" value={form.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="mt-5">
              <label className="block text-sm font-medium text-charcoal mb-1.5">이메일</label>
              <input type="email" placeholder="example@email.com" value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)} className={inputClass} />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-rose text-white font-semibold rounded-full hover:bg-rose-dark disabled:opacity-50 transition-all text-sm"
          >
            <Send size={15} />
            {submitting ? '전송 중...' : '견적 신청하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
