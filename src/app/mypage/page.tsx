import type { Metadata } from 'next'
import { createAuthServerClient } from '@/lib/supabase/auth-server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Package, ChevronRight, LogOut } from 'lucide-react'
import { fetchUserOrders, type Order, type OrderStatus } from '@/lib/supabase/orders'

export const metadata: Metadata = {
  title: '마이페이지',
  robots: { index: false, follow: false },
}

const STATUS_STEPS: OrderStatus[] = ['견적접수', '시안작업', '시안확인', '제작중', '납품완료']

const STATUS_COLORS: Record<OrderStatus, string> = {
  '견적접수': 'bg-gray-100 text-gray-600',
  '시안작업': 'bg-blue-100 text-blue-600',
  '시안확인': 'bg-amber-100 text-amber-600',
  '제작중': 'bg-violet-100 text-violet-600',
  '납품완료': 'bg-green-100 text-green-600',
}

function StatusBar({ status }: { status: OrderStatus }) {
  const currentIdx = STATUS_STEPS.indexOf(status)
  return (
    <div className="flex items-center gap-1 mt-3">
      {STATUS_STEPS.map((step, idx) => (
        <div key={step} className="flex items-center gap-1 flex-1">
          <div
            className={`h-1.5 rounded-full flex-1 ${
              idx <= currentIdx ? 'bg-rose' : 'bg-gray-200'
            }`}
          />
        </div>
      ))}
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  return (
    <Link
      href={`/mypage/orders/${order.id}`}
      className="block bg-white rounded-xl border border-border p-5 hover:shadow-md hover:border-rose/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
              {order.status}
            </span>
            {order.medal_type && (
              <span className="text-[10px] text-charcoal-light">{order.medal_type}</span>
            )}
          </div>
          <h3 className="text-sm font-bold text-charcoal truncate">{order.event_name}</h3>
          <p className="text-xs text-charcoal-light mt-1">
            수량 {order.quantity}개 · {new Date(order.created_at).toLocaleDateString('ko-KR')}
          </p>
        </div>
        <ChevronRight size={18} className="text-charcoal-light shrink-0 mt-1" />
      </div>
      <StatusBar status={order.status} />
    </Link>
  )
}

export default async function MypagePage() {
  const supabase = await createAuthServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let orders: Order[] = []
  try {
    orders = await fetchUserOrders(user.id)
  } catch {
    // 테이블 없을 수 있음 — 빈 배열
  }

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || '고객'

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 bg-warm-white">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">마이페이지</h1>
            <p className="text-sm text-charcoal-light mt-1">{userName}님, 안녕하세요.</p>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-1.5 text-xs text-charcoal-light hover:text-rose transition-colors"
            >
              <LogOut size={14} />
              로그아웃
            </button>
          </form>
        </div>

        {/* 주문 목록 */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">
            <Package size={18} className="text-rose" />
            주문 내역
          </h2>
          <span className="text-xs text-charcoal-light">{orders.length}건</span>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <Package size={40} className="text-charcoal-light/30 mx-auto mb-4" />
            <p className="text-sm text-charcoal-light mb-4">아직 주문 내역이 없습니다.</p>
            <Link
              href="/quote"
              className="inline-block px-6 py-2.5 bg-rose text-white font-semibold rounded-full hover:bg-rose-dark transition-all text-sm"
            >
              견적 신청하기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
