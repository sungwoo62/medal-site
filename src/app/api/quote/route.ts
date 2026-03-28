import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAuthServerClient } from '@/lib/supabase/auth-server'
import { sendCustomerConfirmation, sendAdminNotification } from '@/lib/email'

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const eventName = formData.get('event_name') as string | null
  const contactName = formData.get('contact_name') as string | null
  const contactPhone = formData.get('contact_phone') as string | null

  if (!eventName?.trim() || !contactName?.trim() || !contactPhone?.trim()) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
  }

  const supabase = createServerClient()

  // 파일 업로드 (service role 키 사용)
  let fileUrl: string | null = null
  let fileName: string | null = null
  const file = formData.get('file') as File | null

  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    const path = `quote-files/${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('attachments')
      .upload(path, file, { upsert: true })

    if (uploadErr) {
      console.error('[POST /api/quote] upload failed:', uploadErr.message)
    } else {
      const origin = req.nextUrl.origin
      fileUrl = `${origin}/api/secure/files?path=${encodeURIComponent(path)}`
      fileName = file.name
    }
  }

  const medalType = (formData.get('medal_type') as string) || ''
  const quantity = formData.get('quantity') as string | null
  const desiredDate = (formData.get('desired_date') as string) || null
  const note = (formData.get('note') as string) || null
  const contactEmail = (formData.get('contact_email') as string) || null

  // 메달 커스텀 옵션
  const medalPlating = (formData.get('medal_plating') as string) || ''
  const medalPaint = (formData.get('medal_paint') as string) || ''
  const medalRing = (formData.get('medal_ring') as string) || ''
  const medalLanyard = (formData.get('medal_lanyard') as string) || ''
  const medalPackaging = (formData.get('medal_packaging') as string) || ''
  const optionParts = [medalPlating, medalPaint, medalRing, medalLanyard, medalPackaging].filter(Boolean)
  const optionSummary = optionParts.length > 0
    ? `[옵션] 도금:${medalPlating} / 칠:${medalPaint} / 고리:${medalRing} / 끈:${medalLanyard} / 포장:${medalPackaging}`
    : ''
  const fullNote = [optionSummary, note?.trim()].filter(Boolean).join('\n') || null

  const { error } = await supabase.from('quotes').insert({
    product_name: `[${medalType}] ${eventName.trim()}`,
    customer_name: contactName.trim(),
    customer_phone: contactPhone.trim(),
    quantity: quantity ? parseInt(quantity) : 1,
    valid_until: desiredDate || null,
    note: fullNote,
    contact_email: contactEmail?.trim() || null,
    file_url: fileUrl,
    file_name: fileName,
    site: 'medal-of-finisher',
  })

  if (error) {
    return NextResponse.json({ error: '전송에 실패했습니다.' }, { status: 500 })
  }

  // 로그인 유저면 orders 테이블에 주문 자동 생성
  try {
    const supabaseAuth = await createAuthServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()

    if (user) {
      await supabase.from('medal_orders').insert({
        user_id: user.id,
        event_name: eventName.trim(),
        medal_type: medalType || null,
        quantity: quantity ? parseInt(quantity) : 1,
        desired_date: desiredDate || null,
        note: fullNote,
        contact_name: contactName.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail?.trim() || null,
        status: '견적접수',
        site: 'medal-of-finisher',
      })
    }
  } catch {
    // 주문 생성 실패해도 견적 접수는 성공 처리
  }

  // 이메일 발송 (비차단: 실패해도 견적 접수 성공 응답 반환)
  const emailData = {
    eventName: eventName.trim(),
    medalType,
    quantity: quantity ? parseInt(quantity) : 1,
    contactName: contactName.trim(),
    contactPhone: contactPhone.trim(),
    contactEmail: contactEmail?.trim() || null,
    desiredDate: desiredDate || null,
    note: fullNote,
    fileUrl,
    fileName,
  }

  await Promise.allSettled([
    sendCustomerConfirmation(emailData),
    sendAdminNotification(emailData),
  ])

  return NextResponse.json({ ok: true })
}
