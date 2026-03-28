'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, AlertTriangle, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  orderId: string
  status: string
}

const CONFIRM_CHECKS = [
  '제작 시작 후 취소/변경이 불가함을 확인합니다',
  '교환 및 환불이 불가함을 확인합니다',
  '발주 내용을 최종 확인하였습니다',
]

export default function OrderActions({ orderId, status }: Props) {
  const router = useRouter()
  const [cancelling, setCancelling] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [checks, setChecks] = useState<boolean[]>(CONFIRM_CHECKS.map(() => false))
  const [confirming, setConfirming] = useState(false)

  const canCancel = status === '견적접수' || status === '견적완료'
  const canConfirm = status === '견적완료'

  const handleCancel = async () => {
    if (!confirm('주문을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return

    setCancelling(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('medal_orders')
      .update({ status: '취소', updated_at: new Date().toISOString() })
      .eq('id', orderId)

    setCancelling(false)

    if (error) {
      alert('주문 취소에 실패했습니다. 다시 시도해 주세요.')
      return
    }

    router.refresh()
  }

  const handleConfirmOrder = async () => {
    setConfirming(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('medal_orders')
      .update({ status: '발주확정', updated_at: new Date().toISOString() })
      .eq('id', orderId)

    setConfirming(false)

    if (error) {
      alert('발주확정에 실패했습니다. 다시 시도해 주세요.')
      return
    }

    setShowConfirmModal(false)
    router.refresh()
  }

  const toggleCheck = (idx: number) => {
    setChecks((prev) => prev.map((v, i) => (i === idx ? !v : v)))
  }

  const allChecked = checks.every(Boolean)

  if (!canCancel && !canConfirm) return null

  return (
    <>
      <div className="flex gap-3">
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex-1 px-4 py-3 border border-border text-charcoal-light font-semibold rounded-full hover:bg-gray-50 disabled:opacity-50 transition-all text-sm"
          >
            {cancelling ? '취소 중...' : '주문 취소'}
          </button>
        )}
        {canConfirm && (
          <button
            onClick={() => { setShowConfirmModal(true); setChecks(CONFIRM_CHECKS.map(() => false)) }}
            className="flex-1 px-4 py-3 bg-rose text-white font-semibold rounded-full hover:bg-rose-dark transition-all text-sm"
          >
            발주확정
          </button>
        )}
      </div>

      {/* 발주확정 모달 */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
                <ShieldCheck size={18} className="text-rose" />
                발주확정 안내
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-charcoal-light hover:text-charcoal transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="bg-amber-50 rounded-xl p-4 flex gap-3">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 leading-relaxed">
                  발주확정 후에는 취소/변경/교환/환불이 불가합니다.
                  제작이 즉시 시작되며 모든 책임은 고객에게 있습니다.
                  아래 사항에 동의하셨음을 확인합니다.
                </p>
              </div>

              <div className="space-y-3">
                {CONFIRM_CHECKS.map((label, idx) => (
                  <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={checks[idx]}
                      onChange={() => toggleCheck(idx)}
                      className="mt-0.5 rounded border-border text-rose focus:ring-rose/30"
                    />
                    <span className="text-sm text-charcoal group-hover:text-rose transition-colors">
                      {label}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-3 border border-border text-charcoal-light font-semibold rounded-full hover:bg-gray-50 transition-all text-sm"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmOrder}
                  disabled={!allChecked || confirming}
                  className="flex-1 px-4 py-3 bg-rose text-white font-semibold rounded-full hover:bg-rose-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                >
                  {confirming ? '확정 중...' : '발주확정'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
