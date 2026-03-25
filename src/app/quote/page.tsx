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
    const supabase = createClient()

    let file_url: string | null = null
    let file_name: string | null = null

    if (file) {
      const ext = file.name.split('.').pop()
      const path = `quote-files/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('attachments').upload(path, file)
      if (!uploadErr) {
        const { data } = supabase.storage.from('attachments').getPublicUrl(path)
        file_url = data.publicUrl
        file_name = file.name
      }
    }

    const { error: insertErr } = await supabase.from('site_quotes').insert({
      event_name: form.event_name.trim(),
      medal_type: form.medal_type,
      quantity: form.quantity ? parseInt(form.quantity) : null,
      desired_date: form.desired_date || null,
      note: form.note.trim() || null,
      contact_name: form.contact_name.trim(),
      contact_phone: form.contact_phone.trim(),
      contact_email: form.contact_email.trim() || null,
      file_url,
      file_name,
    })

    setSubmitting(false)
    if (insertErr) {
      setError('전송에 실패했습니다. 다시 시도해 주세요.')
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-16">
        <div className="text-center animate-fade-in-up">
          <CheckCircle2 size={56} className="text-gold mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3">견적 신청이 완료되었습니다</h2>
          <p className="text-white/40 mb-8">24시간 내에 연락드리겠습니다.</p>
          <button
            onClick={() => { setDone(false); setForm(EMPTY); setFile(null) }}
            className="px-6 py-2.5 gold-border text-gold rounded-lg hover:bg-gold/10 transition-colors text-sm font-semibold"
          >
            새 견적 신청
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-3">Free Quote</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">견적 신청</h1>
          <p className="text-white/40">아래 양식을 작성해 주시면 빠르게 견적을 보내드립니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-lighter rounded-2xl gold-border p-6 sm:p-8 space-y-5">
          {/* 행사명 */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              행사명 <span className="text-gold">*</span>
            </label>
            <input
              type="text"
              placeholder="예: 2025 서울마라톤"
              value={form.event_name}
              onChange={(e) => set('event_name', e.target.value)}
              className="w-full px-4 py-3 bg-dark rounded-lg border border-dark-border text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* 메달 종류 */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">메달 종류</label>
              <select
                value={form.medal_type}
                onChange={(e) => set('medal_type', e.target.value)}
                className="w-full px-4 py-3 bg-dark rounded-lg border border-dark-border text-white text-sm focus:outline-none focus:border-gold/50 transition-colors"
              >
                {MEDAL_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* 수량 */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">수량</label>
              <input
                type="number"
                min="1"
                placeholder="예: 500"
                value={form.quantity}
                onChange={(e) => set('quantity', e.target.value)}
                className="w-full px-4 py-3 bg-dark rounded-lg border border-dark-border text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
          </div>

          {/* 희망납기일 */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">희망 납기일</label>
            <input
              type="date"
              value={form.desired_date}
              onChange={(e) => set('desired_date', e.target.value)}
              className="w-full px-4 py-3 bg-dark rounded-lg border border-dark-border text-white text-sm focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          {/* 요청사항 */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">요청사항</label>
            <textarea
              rows={4}
              placeholder="디자인 참고 사항, 소재 선호, 특이사항 등을 적어주세요."
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
              className="w-full px-4 py-3 bg-dark rounded-lg border border-dark-border text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors resize-none"
            />
          </div>

          {/* 파일 업로드 */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">참고 파일</label>
            <label className="flex items-center gap-2 px-4 py-3 bg-dark rounded-lg border border-dark-border text-sm text-white/30 cursor-pointer hover:border-gold/30 transition-colors">
              <Paperclip size={15} className="text-gold/50" />
              <span className="truncate">{file ? file.name : '디자인 시안, 로고 파일 등'}</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="border-t border-dark-border my-2" />

          {/* 연락처 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                이름 <span className="text-gold">*</span>
              </label>
              <input
                type="text"
                value={form.contact_name}
                onChange={(e) => set('contact_name', e.target.value)}
                className="w-full px-4 py-3 bg-dark rounded-lg border border-dark-border text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                연락처 <span className="text-gold">*</span>
              </label>
              <input
                type="tel"
                placeholder="010-0000-0000"
                value={form.contact_phone}
                onChange={(e) => set('contact_phone', e.target.value)}
                className="w-full px-4 py-3 bg-dark rounded-lg border border-dark-border text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">이메일</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={form.contact_email}
              onChange={(e) => set('contact_email', e.target.value)}
              className="w-full px-4 py-3 bg-dark rounded-lg border border-dark-border text-white text-sm placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gold text-dark font-semibold rounded-lg hover:bg-gold-light disabled:opacity-50 transition-all text-sm"
          >
            <Send size={16} />
            {submitting ? '전송 중...' : '견적 신청하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
