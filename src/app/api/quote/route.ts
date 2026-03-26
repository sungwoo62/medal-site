import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendCustomerConfirmation, sendAdminNotification } from '@/lib/email'

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

  // 이메일 발송 (비차단: 실패해도 견적 접수 성공 응답 반환)
  const emailData = {
    eventName: body.event_name.trim(),
    medalType: body.medal_type || '',
    quantity: body.quantity ? parseInt(body.quantity) : 1,
    contactName: body.contact_name.trim(),
    contactPhone: body.contact_phone.trim(),
    contactEmail: body.contact_email?.trim() || null,
    desiredDate: body.desired_date || null,
    note: body.note?.trim() || null,
  }

  await Promise.allSettled([
    sendCustomerConfirmation(emailData),
    sendAdminNotification(emailData),
  ])

  return NextResponse.json({ ok: true })
}
