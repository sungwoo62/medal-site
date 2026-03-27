import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const ALLOWED_BUCKETS = ['attachments', 'gallery']

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path')

  if (!path) {
    return NextResponse.json({ error: '파일 경로가 필요합니다.' }, { status: 400 })
  }

  const bucket = req.nextUrl.searchParams.get('bucket') ?? 'attachments'

  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return NextResponse.json({ error: '허용되지 않은 버킷입니다.' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60) // 1시간 유효

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: '파일을 찾을 수 없습니다.' }, { status: 404 })
  }

  return NextResponse.redirect(data.signedUrl)
}
