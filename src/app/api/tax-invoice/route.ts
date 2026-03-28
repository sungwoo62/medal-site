import { NextRequest, NextResponse } from 'next/server'
import { createAuthServerClient } from '@/lib/supabase/auth-server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabaseAuth = await createAuthServerClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const body = await req.json()
  const { order_id, business_name, business_number, representative, email } = body

  if (!order_id || !business_name || !business_number || !representative || !email) {
    return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 })
  }

  const supabase = createServerClient()

  // 본인 주문인지 확인
  const { data: order } = await supabase
    .from('medal_orders')
    .select('id, user_id')
    .eq('id', order_id)
    .single()

  if (!order || order.user_id !== user.id) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 })
  }

  // 중복 신청 방지
  const { data: existing } = await supabase
    .from('tax_invoices')
    .select('id')
    .eq('order_id', order_id)
    .limit(1)
    .single()

  if (existing) {
    return NextResponse.json({ error: '이미 세금계산서가 신청되었습니다.' }, { status: 409 })
  }

  const { error } = await supabase.from('tax_invoices').insert({
    order_id,
    business_name,
    business_number,
    representative,
    email,
    status: '완료',
    issued_at: new Date().toISOString(),
  })

  if (error) {
    return NextResponse.json({ error: '신청에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
