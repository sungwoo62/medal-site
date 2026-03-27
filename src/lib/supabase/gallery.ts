import { createServerClient } from '@/lib/supabase/server'

export type GalleryItem = {
  id: string
  title: string
  category: string
  year: string
  description: string
  image_url: string | null
  display_order: number
  is_featured: boolean
  created_at: string
}

export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('gallery_items')
    .select('id, title, category, year, description, image_url, display_order, is_featured, created_at')
    .order('display_order', { ascending: true })

  if (error) {
    throw new Error(`갤러리 데이터를 불러올 수 없습니다: ${error.message}`)
  }

  return data ?? []
}

export async function fetchFeaturedGalleryItems(): Promise<GalleryItem[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('gallery_items')
    .select('id, title, category, year, description, image_url, display_order, is_featured, created_at')
    .eq('is_featured', true)
    .order('display_order', { ascending: true })

  if (error) {
    throw new Error(`갤러리 데이터를 불러올 수 없습니다: ${error.message}`)
  }

  return data ?? []
}
