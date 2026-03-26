import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.event_name?.trim() || !body.contact_name?.trim() || !body.contact_phone?.trim()) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { error } = await supabase.from('quotes').insert({
    product_name: `[${body.medal_type}] ${body.event_name.trim()}`,
    customer_name: body.contact_name.trim(),
    customer_phone: body.contact_phone.trim(),
    quantity: body.quantity ? parseInt(body.quantity) : 1,
    valid_until: body.desired_date || null,
    note: body.note?.trim() || null,
    contact_email: body.contact_email?.trim() || null,
    file_url: body.file_url || null,
    file_name: body.file_name || null,
    site: 'medal-of-finisher',
  })

  if (error) {
    return NextResponse.json({ error: '전송에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
