---
phase: 04-dynamic-gallery
plan: 02
subsystem: gallery
tags: [ssr, client-component, gallery, loading-skeleton, dynamic-data]
dependency_graph:
  requires: [04-01]
  provides: [gallery-ui-dynamic, landing-gallery-dynamic]
  affects: [src/app/gallery/page.tsx, src/app/gallery/GalleryClient.tsx, src/app/gallery/loading.tsx, src/app/page.tsx]
tech_stack:
  added: []
  patterns: [SSR server component + client filter component split, Next.js streaming loading.tsx, conditional image rendering via signed URL proxy]
key_files:
  created:
    - src/app/gallery/GalleryClient.tsx
    - src/app/gallery/loading.tsx
  modified:
    - src/app/gallery/page.tsx
    - src/app/page.tsx
decisions:
  - Gallery page split into SSR server component (page.tsx fetches data) and client component (GalleryClient.tsx handles filter state)
  - loading.tsx provides Next.js App Router streaming skeleton UI while SSR awaits Supabase data
  - Gallery section on landing page hidden entirely (galleryItems.length > 0 guard) if Supabase fetch fails
metrics:
  duration: 4 minutes
  completed: 2026-03-27
  tasks_completed: 2
  files_modified: 4
---

# Phase 04 Plan 02: Dynamic Gallery UI Summary

**One-liner:** SSR server component fetches gallery_items from Supabase; GalleryClient handles category filter; loading.tsx streams 6 skeleton cards; landing page gallery section uses is_featured items dynamically.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | 갤러리 페이지 SSR + 클라이언트 필터 구조 전환 (loading.tsx 포함) | 692e1b5 | gallery/page.tsx, GalleryClient.tsx, loading.tsx |
| 2 | 랜딩 페이지 갤러리 섹션 동적 데이터 전환 | 8ae3a72 | src/app/page.tsx |

## What Was Built

### gallery/page.tsx (Server Component)
- Removed `'use client'`, `useState`, all hardcoded ITEMS constants
- Async server component calls `fetchGalleryItems()` from `@/lib/supabase/gallery`
- On error: renders error banner with "갤러리를 불러올 수 없습니다" and `bg-rose/10 border border-rose/20 rounded-xl p-8` styling
- On success: passes items array to `<GalleryClient items={items} />`

### gallery/GalleryClient.tsx (Client Component)
- `'use client'` component receiving `items: GalleryItem[]` prop
- Category filter state with `useState('전체')`, CATEGORIES array with 5 entries
- GRADIENTS Record mapping 4 categories to Tailwind gradient classes
- Client-side filtering (no network request on category change)
- Responsive grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5`
- Gallery card: `rounded-2xl`, `aspect-[4/3]` image area with category + year badges
- Image rendering: when `item.image_url` present, renders `<img>` via `/api/secure/files?bucket=gallery&path=...` proxy
- No-image fallback: category gradient background + Award icon
- Empty state (items.length === 0): "아직 등록된 사례가 없습니다" with explanation
- Filtered empty (filtered.length === 0, items.length > 0): "해당 카테고리의 제작 사례가 없습니다"

### gallery/loading.tsx (Next.js Streaming Loading UI)
- Automatically shown by Next.js App Router while page.tsx's async server component awaits data
- Real header text (Portfolio, 제작 사례) with "갤러리를 불러오는 중..." subtitle per UI-SPEC
- 5 filter pill skeleton divs with `animate-pulse`
- 6 skeleton cards with `rounded-2xl`, `aspect-[4/3]`, `bg-warm-gray`, `animate-pulse`
- Each skeleton card has two text placeholder bars in the text area

### src/app/page.tsx (Landing Page)
- Removed hardcoded `GALLERY_ITEMS` constant (6-item array)
- Removed unused `ThumbsUp`, `Clock` icon imports
- Made `HomePage` async
- Fetches `fetchFeaturedGalleryItems()` at SSR time with try/catch
- Gallery section wrapped in `{galleryItems.length > 0 && (...)}` — hides on fetch failure
- Uses `item.category`, `item.description`, `item.id` (aligned with GalleryItem type)
- Conditional image rendering via `/api/secure/files?bucket=gallery` proxy
- TRUST_STATS, CATEGORIES, PROCESS_STEPS, GRADIENTS constants unchanged

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed implicit TypeScript 'any' type for items variable**
- **Found during:** Task 1, TypeScript check
- **Issue:** `let items` without type annotation caused TS7034/TS7005 errors
- **Fix:** Changed to `let items: GalleryItem[] = []` with explicit type import
- **Files modified:** src/app/gallery/page.tsx
- **Commit:** 692e1b5

**2. [Rule 3 - Blocking] Merged main branch into worktree to get Phase 01 dependencies**
- **Found during:** Pre-execution setup
- **Issue:** Worktree branch was missing gallery.ts, api/secure/files/route.ts from Phase 01
- **Fix:** `git merge main` to fast-forward worktree branch
- **Impact:** No code changes, only branch sync

**3. [Rule 3 - Blocking] Installed npm dependencies in worktree**
- **Found during:** TypeScript check
- **Issue:** node_modules absent from worktree, causing nodemailer type resolution failure (pre-existing)
- **Fix:** `npm install --prefer-offline`
- **Impact:** TypeScript check now passes cleanly

## Known Stubs

None — all gallery data is fetched dynamically from Supabase. The gallery section displays real data or hides itself gracefully on failure.

## Self-Check: PASSED

Files verified:
- src/app/gallery/page.tsx: exists, no 'use client', contains fetchGalleryItems import
- src/app/gallery/GalleryClient.tsx: exists, 'use client', useState, GalleryItem type
- src/app/gallery/loading.tsx: exists, 6 skeleton cards, animate-pulse
- src/app/page.tsx: exists, async HomePage, fetchFeaturedGalleryItems, no GALLERY_ITEMS

Commits verified:
- 692e1b5: feat(04-02): convert gallery to SSR + client filter with loading skeleton
- 8ae3a72: feat(04-02): convert landing page gallery section to dynamic Supabase data
