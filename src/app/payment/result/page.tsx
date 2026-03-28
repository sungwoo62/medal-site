import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: '결제 결과',
  robots: { index: false, follow: false },
}

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; orderId?: string; message?: string }>
}) {
  const { status, orderId, message } = await searchParams

  const isSuccess = status === 'success'

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-warm-white flex items-start justify-center">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl border border-border p-8">
          {isSuccess ? (
            <>
              <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-charcoal mb-2">결제가 완료되었습니다</h1>
              <p className="text-sm text-charcoal-light mb-6">
                주문이 정상적으로 결제 처리되었습니다.
              </p>
              {orderId && (
                <Link
                  href={`/mypage/orders/${orderId}`}
                  className="inline-flex items-center gap-1.5 px-6 py-3 bg-rose text-white font-semibold rounded-full hover:bg-rose-dark transition-all text-sm"
                >
                  주문 상세 보기
                </Link>
              )}
            </>
          ) : (
            <>
              <XCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-charcoal mb-2">결제에 실패했습니다</h1>
              <p className="text-sm text-charcoal-light mb-6">
                {message || '결제 처리 중 문제가 발생했습니다. 다시 시도해주세요.'}
              </p>
            </>
          )}

          <div className="mt-4">
            <Link
              href="/mypage"
              className="inline-flex items-center gap-1.5 text-sm text-charcoal-light hover:text-rose transition-colors"
            >
              <ArrowLeft size={15} /> 마이페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
