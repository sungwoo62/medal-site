import { NextResponse } from 'next/server'
import { fetchGalleryItems } from '@/lib/supabase/gallery'

export async function GET() {
  try {
    const items = await fetchGalleryItems()
    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json(
      { error: '갤러리를 불러올 수 없습니다.' },
      { status: 500 }
    )
  }
}
