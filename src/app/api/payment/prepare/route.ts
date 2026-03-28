import { NextRequest, NextResponse } from 'next/server'
import { createAuthServerClient } from '@/lib/supabase/auth-server'
import { createServerClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const supabaseAuth = await createAuthServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { order_id } = await req.json()

    if (!order_id) {
      return NextResponse.json({ error: '주문 ID가 필요합니다.' }, { status: 400 })
    }

    const mid = process.env.INICIS_MID
    const signKey = process.env.INICIS_SIGN_KEY

    if (!mid || !signKey) {
      return NextResponse.json({ error: '결제 설정이 올바르지 않습니다.' }, { status: 500 })
    }

    const supabase = createServerClient()

    const { data: order, error: dbError } = await supabase
      .from('medal_orders')
      .select('id, user_id, total_amount, event_name, payment_status')
      .eq('id', order_id)
      .single()

    if (dbError || !order || order.user_id !== user.id) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (!order.total_amount || order.total_amount <= 0) {
      return NextResponse.json({ error: '결제 금액이 없습니다.' }, { status: 400 })
    }

    if (order.payment_status === '결제완료') {
      return NextResponse.json({ error: '이미 결제가 완료된 주문입니다.' }, { status: 409 })
    }

    const timestamp = Date.now().toString()
    const oid = `MEDAL_${order.id.substring(0, 8)}_${Math.floor(Date.now() / 1000)}`
    const price = order.total_amount.toString()

    const mKey = crypto.createHash('sha256').update(signKey).digest('hex')
    const signature = crypto.createHash('sha256').update(`oid=${oid}&price=${price}&timestamp=${timestamp}`).digest('hex')
    const verification = crypto.createHash('sha256').update(`oid=${oid}&price=${price}&signKey=${signKey}&timestamp=${timestamp}`).digest('hex')

    const isTest = process.env.INICIS_MODE === 'test'
    const origin = req.headers.get('origin') || req.nextUrl.origin
    const returnUrl = `${origin}/api/payment/complete`
    const closeUrl = `${origin}/payment/result?status=close`

    return NextResponse.json({
      mid,
      oid,
      price,
      timestamp,
      signature,
      verification,
      mKey,
      goodname: order.event_name,
      buyername: user.user_metadata?.name || '',
      buyertel: user.user_metadata?.phone || '',
      buyeremail: user.email || '',
      returnUrl,
      closeUrl,
      gopaymethod: 'Card',
      acceptmethod: 'below1000',
      currency: 'WON',
      payViewType: 'overlay',
      isTest,
    })
  } catch {
    return NextResponse.json({ error: '결제 준비 중 서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
