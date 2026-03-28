'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/mypage/settings`,
    })

    setLoading(false)

    if (resetError) {
      setError('비밀번호 재설정 이메일 발송에 실패했습니다. 다시 시도해 주세요.')
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-warm-white">
        <div className="text-center">
          <CheckCircle2 size={52} className="text-rose mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-charcoal mb-2">이메일을 확인해주세요</h2>
          <p className="text-charcoal-light text-sm mb-6">
            {email}으로 비밀번호 재설정 링크를 보내드렸습니다.<br />
            이메일이 보이지 않으면 스팸함을 확인해 주세요.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 bg-rose text-white font-semibold rounded-full hover:bg-rose-dark transition-all text-sm"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const inputClass = 'w-full px-4 py-3 bg-white rounded-xl border border-border text-charcoal text-sm placeholder-charcoal-light/40 focus:outline-none focus:border-rose/50 focus:ring-2 focus:ring-rose/10 transition-all'

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-warm-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-charcoal mb-2">비밀번호 찾기</h1>
          <p className="text-sm text-charcoal-light">가입한 이메일을 입력하시면 재설정 링크를 보내드립니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className={inputClass}
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-rose text-white font-semibold rounded-full hover:bg-rose-dark disabled:opacity-50 transition-all text-sm"
          >
            <Mail size={15} />
            {loading ? '발송 중...' : '재설정 링크 받기'}
          </button>
        </form>

        <p className="text-center text-sm text-charcoal-light mt-5">
          <Link href="/login" className="text-rose font-semibold hover:underline">로그인으로 돌아가기</Link>
        </p>
      </div>
    </div>
  )
}
