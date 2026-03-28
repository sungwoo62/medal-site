'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/mypage'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (authError) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      return
    }

    router.push(redirect)
    router.refresh()
  }

  const inputClass = 'w-full px-4 py-3 bg-white rounded-xl border border-border text-charcoal text-sm placeholder-charcoal-light/40 focus:outline-none focus:border-rose/50 focus:ring-2 focus:ring-rose/10 transition-all'

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-warm-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-charcoal mb-2">로그인</h1>
          <p className="text-sm text-charcoal-light">마이페이지에서 주문 현황을 확인하세요.</p>
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

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
            <LogIn size={15} />
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="text-center text-sm text-charcoal-light mt-5 space-y-2">
          <p>
            비밀번호를 잊으셨나요?{' '}
            <Link href="/forgot-password" className="text-rose font-semibold hover:underline">비밀번호 찾기</Link>
          </p>
          <p>
            아직 계정이 없으신가요?{' '}
            <Link href="/signup" className="text-rose font-semibold hover:underline">회원가입</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
