'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard } from 'lucide-react'

type Props = {
  orderId: string
  paymentStatus: string | null
  totalAmount: number | null
}

declare global {
  interface Window {
    INIStdPay?: {
      pay: (formId: string) => void
    }
  }
}

export default function PaymentButton({ orderId, paymentStatus, totalAmount }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const shouldShow = paymentStatus !== '결제완료' && totalAmount && totalAmount > 0

  useEffect(() => {
    if (!shouldShow) return

    const existing = document.querySelector('script[src*="INIStdPay"]')
    if (existing) {
      setScriptLoaded(true)
      return
    }

    // 서버에서 isTest 결정 전이므로 prefetch 시 test URL 사용, pay 시점에 교체됨
    const script = document.createElement('script')
    script.src = 'https://stgstdpay.inicis.com/stdjs/INIStdPay.js'
    script.charset = 'UTF-8'
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => setScriptLoaded(false)
    document.head.appendChild(script)
  }, [shouldShow])

  if (!shouldShow) return null

  const handlePayment = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/payment/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
      })

      const payData = await res.json().catch(() => null)

      if (!res.ok || !payData) {
        alert(payData?.error || '결제 준비에 실패했습니다.')
        setLoading(false)
        return
      }

      // 히든 폼 생성
      const existingForm = document.getElementById('inicis_pay_form')
      if (existingForm) existingForm.remove()

      const form = document.createElement('form')
      form.id = 'inicis_pay_form'
      form.method = 'POST'
      form.acceptCharset = 'UTF-8'
      form.style.display = 'none'

      const fields: Record<string, string> = {
        version: '1.0',
        mid: payData.mid,
        oid: payData.oid,
        goodname: payData.goodname,
        price: payData.price,
        currency: payData.currency,
        buyername: payData.buyername,
        buyertel: payData.buyertel,
        buyeremail: payData.buyeremail,
        timestamp: payData.timestamp,
        signature: payData.signature,
        verification: payData.verification,
        mKey: payData.mKey,
        returnUrl: payData.returnUrl,
        closeUrl: payData.closeUrl,
        gopaymethod: payData.gopaymethod,
        acceptmethod: payData.acceptmethod,
        payViewType: payData.payViewType,
      }

      for (const [key, value] of Object.entries(fields)) {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value || ''
        form.appendChild(input)
      }

      document.body.appendChild(form)

      if (window.INIStdPay) {
        window.INIStdPay.pay('inicis_pay_form')
      } else {
        alert('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      }
    } catch {
      alert('결제 준비 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading || !scriptLoaded}
      className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2"
    >
      <CreditCard size={16} />
      {loading ? '결제 준비 중...' : `${totalAmount.toLocaleString()}원 결제하기`}
    </button>
  )
}
