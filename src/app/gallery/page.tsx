import { fetchGalleryItems, type GalleryItem } from '@/lib/supabase/gallery'
import GalleryClient from './GalleryClient'

export default async function GalleryPage() {
  let items: GalleryItem[] = []
  let error = false

  try {
    items = await fetchGalleryItems()
  } catch {
    items = []
    error = true
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 bg-warm-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-rose text-xs font-semibold tracking-[0.2em] uppercase mb-2">Portfolio</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-charcoal mb-3">제작 사례</h1>
          </div>
          <div className="bg-rose/10 border border-rose/20 rounded-xl p-8 text-center">
            <h2 className="text-lg font-bold text-charcoal mb-2">갤러리를 불러올 수 없습니다</h2>
            <p className="text-sm text-charcoal-light">잠시 후 다시 시도해 주세요. 문제가 지속되면 고객센터로 연락해 주세요.</p>
          </div>
        </div>
      </div>
    )
  }

  return <GalleryClient items={items} />
}
