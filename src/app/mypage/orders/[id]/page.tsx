import type { Metadata } from 'next'
import { createAuthServerClient } from '@/lib/supabase/auth-server'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Download, FileText, Clock, CheckCircle2 } from 'lucide-react'
import { fetchOrderById, fetchOrderFiles, fetchTaxInvoice, type OrderStatus } from '@/lib/supabase/orders'
import TaxInvoiceForm from './TaxInvoiceForm'
import OrderActions from './OrderActions'
import PaymentButton from './PaymentButton'

export const metadata: Metadata = {
  title: '주문 상세',
  robots: { index: false, follow: false },
}

const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: '견적접수', label: '견적 접수' },
  { key: '견적완료', label: '견적 완료' },
  { key: '발주확정', label: '발주 확정' },
  { key: '제작중', label: '제작 중' },
  { key: '납품완료', label: '납품 완료' },
]

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createAuthServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const order = await fetchOrderById(id)
  if (!order || order.user_id !== user.id) notFound()

  const files = await fetchOrderFiles(id)
  const taxInvoice = await fetchTaxInvoice(id)

  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === order.status)

  const designFiles = files.filter((f) => f.file_type === '시안')
  const quoteFiles = files.filter((f) => f.file_type === '견적서')
  const taxFiles = files.filter((f) => f.file_type === '세금계산서')
  const otherFiles = files.filter((f) => !['시안', '견적서', '세금계산서'].includes(f.file_type))

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-warm-white">
      <div className="max-w-2xl mx-auto">
        {/* 뒤로가기 */}
        <Link href="/mypage" className="inline-flex items-center gap-1.5 text-sm text-charcoal-light hover:text-rose transition-colors mb-6">
          <ArrowLeft size={15} /> 주문 목록으로
        </Link>

        {/* 주문 정보 */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <h1 className="text-lg font-bold text-charcoal mb-1">{order.event_name}</h1>
          <p className="text-xs text-charcoal-light">
            {order.medal_type && `${order.medal_type} · `}수량 {order.quantity}개 · {new Date(order.created_at).toLocaleDateString('ko-KR')} 접수
          </p>
          {order.total_amount && (
            <p className="text-sm font-bold text-charcoal mt-3">
              견적 금액: {order.total_amount.toLocaleString()}원
            </p>
          )}
        </div>

        {/* 결제하기 버튼 */}
        {order.status !== '취소' && (
          <div className="mb-6">
            <PaymentButton
              orderId={order.id}
              paymentStatus={order.payment_status}
              totalAmount={order.total_amount}
            />
          </div>
        )}

        {/* 주문 취소/발주확정 버튼 */}
        {order.status !== '취소' && (
          <div className="mb-6">
            <OrderActions orderId={order.id} status={order.status} />
          </div>
        )}

        {order.status === '취소' && (
          <div className="bg-red-50 rounded-2xl border border-red-200 p-4 mb-6 text-center">
            <p className="text-sm font-semibold text-red-600">이 주문은 취소되었습니다.</p>
          </div>
        )}

        {/* 진행상황 타임라인 */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <h2 className="text-sm font-bold text-charcoal mb-5 flex items-center gap-2">
            <Clock size={15} className="text-rose" />
            진행상황
          </h2>
          <div className="relative">
            <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-4">
              {STATUS_STEPS.map((step, idx) => {
                const isDone = idx <= currentStepIdx
                const isCurrent = idx === currentStepIdx
                return (
                  <div key={step.key} className="flex items-center gap-3 relative">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 shrink-0 ${
                      isDone ? 'bg-rose' : 'bg-gray-200'
                    }`}>
                      {isDone ? (
                        <CheckCircle2 size={14} className="text-white" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                      )}
                    </div>
                    <span className={`text-sm ${isCurrent ? 'font-bold text-rose' : isDone ? 'font-medium text-charcoal' : 'text-charcoal-light'}`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 견적서 PDF */}
        {quoteFiles.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-6 mb-6">
            <h2 className="text-sm font-bold text-charcoal mb-3 flex items-center gap-2">
              <FileText size={15} className="text-rose" />
              견적서
            </h2>
            <div className="space-y-2">
              {quoteFiles.map((f) => (
                <a
                  key={f.id}
                  href={`/api/secure/files?bucket=attachments&path=${encodeURIComponent(f.file_path)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-rose hover:underline"
                >
                  <Download size={14} /> {f.file_name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 시안 파일 */}
        {designFiles.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-6 mb-6">
            <h2 className="text-sm font-bold text-charcoal mb-3 flex items-center gap-2">
              <FileText size={15} className="text-rose" />
              시안 파일
            </h2>
            <div className="space-y-2">
              {designFiles.map((f) => (
                <a
                  key={f.id}
                  href={`/api/secure/files?bucket=attachments&path=${encodeURIComponent(f.file_path)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-rose hover:underline"
                >
                  <Download size={14} /> {f.file_name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 기타 파일 */}
        {otherFiles.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-6 mb-6">
            <h2 className="text-sm font-bold text-charcoal mb-3">기타 파일</h2>
            <div className="space-y-2">
              {otherFiles.map((f) => (
                <a
                  key={f.id}
                  href={`/api/secure/files?bucket=attachments&path=${encodeURIComponent(f.file_path)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-rose hover:underline"
                >
                  <Download size={14} /> {f.file_name} <span className="text-charcoal-light text-xs">({f.file_type})</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 세금계산서 */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <h2 className="text-sm font-bold text-charcoal mb-3 flex items-center gap-2">
            <FileText size={15} className="text-rose" />
            세금계산서
          </h2>

          {taxInvoice ? (
            <div className="text-sm">
              <p className="text-charcoal-light">
                상태: <span className={`font-semibold ${taxInvoice.status === '발행완료' ? 'text-green-600' : 'text-amber-600'}`}>
                  {taxInvoice.status}
                </span>
              </p>
              <p className="text-xs text-charcoal-light mt-1">
                사업자명: {taxInvoice.business_name} · 사업자번호: {taxInvoice.business_number}
              </p>
              {taxFiles.length > 0 && (
                <div className="mt-3 space-y-1">
                  {taxFiles.map((f) => (
                    <a
                      key={f.id}
                      href={`/api/secure/files?bucket=attachments&path=${encodeURIComponent(f.file_path)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-rose hover:underline"
                    >
                      <Download size={14} /> {f.file_name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <TaxInvoiceForm orderId={order.id} />
          )}
        </div>
      </div>
    </div>
  )
}
