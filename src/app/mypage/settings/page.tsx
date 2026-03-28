'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Lock, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 비밀번호 변경
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setName(user.user_metadata?.name || '')
      setPhone(user.user_metadata?.phone || '')
      setLoading(false)
    }
    load()
  }, [router])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({
      data: { name, phone },
    })

    setSaving(false)

    if (updateError) {
      setError('정보 수정에 실패했습니다. 다시 시도해 주세요.')
      return
    }

    setSuccess('회원정보가 수정되었습니다.')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')

    if (newPassword.length < 6) {
      setPwError('비밀번호는 6자 이상이어야 합니다.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('비밀번호가 일치하지 않습니다.')
      return
    }

    setPwSaving(true)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setPwSaving(false)

    if (updateError) {
      setPwError('비밀번호 변경에 실패했습니다. 다시 시도해 주세요.')
      return
    }

    setPwSuccess('비밀번호가 변경되었습니다.')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setPwSuccess(''), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 bg-warm-white">
        <div className="max-w-lg mx-auto text-center text-charcoal-light text-sm py-20">불러오는 중...</div>
      </div>
    )
  }

  const inputClass = 'w-full px-4 py-3 bg-white rounded-xl border border-border text-charcoal text-sm placeholder-charcoal-light/40 focus:outline-none focus:border-rose/50 focus:ring-2 focus:ring-rose/10 transition-all'

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-warm-white">
      <div className="max-w-lg mx-auto">
        <Link href="/mypage" className="inline-flex items-center gap-1.5 text-sm text-charcoal-light hover:text-rose transition-colors mb-6">
          <ArrowLeft size={15} /> 마이페이지로
        </Link>

        <h1 className="text-2xl font-bold text-charcoal mb-8">설정</h1>

        {/* 회원정보 수정 */}
        <form onSubmit={handleProfileSave} className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4 mb-6">
          <h2 className="text-sm font-bold text-charcoal flex items-center gap-2">
            <Save size={15} className="text-rose" />
            회원정보 수정
          </h2>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">연락처</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 size={14} /> {success}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full px-6 py-3 bg-rose text-white font-semibold rounded-full hover:bg-rose-dark disabled:opacity-50 transition-all text-sm"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </form>

        {/* 비밀번호 변경 */}
        <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-charcoal flex items-center gap-2">
            <Lock size={15} className="text-rose" />
            비밀번호 변경
          </h2>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">새 비밀번호</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="6자 이상"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">새 비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 재입력"
              className={inputClass}
              required
            />
          </div>

          {pwError && <p className="text-sm text-red-500">{pwError}</p>}
          {pwSuccess && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 size={14} /> {pwSuccess}
            </p>
          )}

          <button
            type="submit"
            disabled={pwSaving}
            className="w-full px-6 py-3 bg-charcoal text-white font-semibold rounded-full hover:bg-charcoal/90 disabled:opacity-50 transition-all text-sm"
          >
            {pwSaving ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </div>
    </div>
  )
}
