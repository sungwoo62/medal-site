import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const resultCode = formData.get('resultCode') as string
  const resultMsg = formData.get('resultMsg') as string
  const mid = formData.get('mid') as string
  const orderNumber = formData.get('orderNumber') as string
  const authToken = formData.get('authToken') as string
  const authUrl = formData.get('authUrl') as string
  const netCancelUrl = formData.get('netCancelUrl') as string
  const charset = formData.get('charset') as string || 'UTF-8'
  const merchantData = formData.get('merchantData') as string

  // 결제 실패 시
  if (resultCode !== '0000') {
    const redirectUrl = new URL('/payment/result', req.nextUrl.origin)
    redirectUrl.searchParams.set('status', 'fail')
    redirectUrl.searchParams.set('message', resultMsg || '결제에 실패했습니다.')
    return NextResponse.redirect(redirectUrl, 303)
  }

  // 주문 ID 추출 (MEDAL_{orderId}_{timestamp})
  const orderIdMatch = orderNumber.match(/^MEDAL_(.+?)_\d+$/)
  if (!orderIdMatch) {
    const redirectUrl = new URL('/payment/result', req.nextUrl.origin)
    redirectUrl.searchParams.set('status', 'fail')
    redirectUrl.searchParams.set('message', '주문 정보를 확인할 수 없습니다.')
    return NextResponse.redirect(redirectUrl, 303)
  }

  const orderId = orderIdMatch[1]
  const supabase = createServerClient()

  // 주문 조회
  const { data: order } = await supabase
    .from('medal_orders')
    .select('id, total_amount, payment_status')
    .eq('id', orderId)
    .single()

  if (!order) {
    const redirectUrl = new URL('/payment/result', req.nextUrl.origin)
    redirectUrl.searchParams.set('status', 'fail')
    redirectUrl.searchParams.set('message', '주문을 찾을 수 없습니다.')
    return NextResponse.redirect(redirectUrl, 303)
  }

  // 이니시스 승인 요청
  const price = order.total_amount?.toString() || '0'
  const timestamp = Date.now().toString()
  const signKey = process.env.INICIS_SIGN_KEY!
  const signature = crypto.createHash('sha256').update(`authToken=${authToken}&timestamp=${timestamp}`).digest('hex')

  try {
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
      body: new URLSearchParams({
        mid,
        authToken,
        timestamp,
        signature,
        charset,
        price,
        format: 'JSON',
      }),
    })

    const authResult = await authResponse.json()

    if (authResult.resultCode !== '0000') {
      const redirectUrl = new URL('/payment/result', req.nextUrl.origin)
      redirectUrl.searchParams.set('status', 'fail')
      redirectUrl.searchParams.set('message', authResult.resultMsg || '승인에 실패했습니다.')
      return NextResponse.redirect(redirectUrl, 303)
    }

    // 결제 금액 검증
    if (String(authResult.TotPrice) !== price) {
      // 금액 불일치 시 망취소
      await fetch(netCancelUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8' },
        body: new URLSearchParams({
          mid,
          authToken,
          netCancelUrl,
          timestamp,
          signature,
          charset,
          price,
          format: 'JSON',
        }),
      })

      const redirectUrl = new URL('/payment/result', req.nextUrl.origin)
      redirectUrl.searchParams.set('status', 'fail')
      redirectUrl.searchParams.set('message', '결제 금액이 일치하지 않아 취소되었습니다.')
      return NextResponse.redirect(redirectUrl, 303)
    }

    // DB 업데이트
    await supabase
      .from('medal_orders')
      .update({
        payment_status: '결제완료',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    const redirectUrl = new URL('/payment/result', req.nextUrl.origin)
    redirectUrl.searchParams.set('status', 'success')
    redirectUrl.searchParams.set('orderId', orderId)
    return NextResponse.redirect(redirectUrl, 303)
  } catch {
    const redirectUrl = new URL('/payment/result', req.nextUrl.origin)
    redirectUrl.searchParams.set('status', 'fail')
    redirectUrl.searchParams.set('message', '결제 처리 중 오류가 발생했습니다.')
    return NextResponse.redirect(redirectUrl, 303)
  }
}
