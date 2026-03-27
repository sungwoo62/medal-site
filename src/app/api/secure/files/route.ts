import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path')

  if (!path) {
    return NextResponse.json({ error: '파일 경로가 필요합니다.' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data, error } = await supabase.storage
    .from('attachments')
    .createSignedUrl(path, 60 * 60) // 1시간 유효

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: '파일을 찾을 수 없습니다.' }, { status: 404 })
  }

  return NextResponse.redirect(data.signedUrl)
}
