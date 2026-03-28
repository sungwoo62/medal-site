'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    setLoading(false)

    if (authError) {
      setError(authError.message === 'User already registered'
        ? '이미 가입된 이메일입니다.'
        : '회원가입에 실패했습니다. 다시 시도해 주세요.')
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-warm-white">
        <div className="text-center">
          <CheckCircle2 size={52} className="text-rose mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-charcoal mb-2">가입 완료</h2>
          <p className="text-charcoal-light text-sm mb-6">이메일 인증 후 로그인할 수 있습니다.</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 bg-rose text-white font-semibold rounded-full hover:bg-rose-dark transition-all text-sm"
          >
            로그인하기
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
          <h1 className="text-2xl font-bold text-charcoal mb-2">회원가입</h1>
          <p className="text-sm text-charcoal-light">가입 후 견적 진행상황을 확인할 수 있습니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">이름</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" className={inputClass} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">이메일</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" className={inputClass} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">비밀번호</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6자 이상" className={inputClass} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">비밀번호 확인</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="비밀번호 재입력" className={inputClass} required />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-rose text-white font-semibold rounded-full hover:bg-rose-dark disabled:opacity-50 transition-all text-sm"
          >
            <UserPlus size={15} />
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="text-center text-sm text-charcoal-light mt-5">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-rose font-semibold hover:underline">로그인</Link>
        </p>
      </div>
    </div>
  )
}
