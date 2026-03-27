---
phase: 04-dynamic-gallery
plan: 01
subsystem: api, database
tags: [supabase, gallery, sql, rls, signed-url]

# Dependency graph
requires:
  - phase: 03-email-notifications
    provides: POST /api/quote route handler and Supabase service role client pattern
provides:
  - GalleryItem TypeScript type with 9 fields
  - fetchGalleryItems and fetchFeaturedGalleryItems Supabase query functions
  - GET /api/gallery endpoint returning gallery_items JSON
  - GET /api/secure/files?bucket=gallery signed URL proxy
  - supabase/gallery-seed.sql with CREATE TABLE + RLS + 12 INSERT rows
affects: [04-02-dynamic-gallery-frontend, 04-03-landing-gallery-excerpt]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ALLOWED_BUCKETS allowlist pattern for multi-bucket signed URL proxy"
    - "fetchXxx/fetchFeaturedXxx paired query functions for full list vs featured subset"

key-files:
  created:
    - src/lib/supabase/gallery.ts
    - src/app/api/gallery/route.ts
    - src/app/api/secure/files/route.ts
    - supabase/gallery-seed.sql
  modified: []

key-decisions:
  - "gallery 버킷 signed URL을 기존 /api/secure/files 프록시에 ALLOWED_BUCKETS 확장으로 통합 — 새 엔드포인트 불필요"
  - "fetchFeaturedGalleryItems 별도 함수 제공 — 랜딩 페이지 발췌 전용 (is_featured=true 필터)"

patterns-established:
  - "ALLOWED_BUCKETS 배열로 허용 버킷 검증 — 새 버킷 추가 시 배열에만 추가하면 됨"
  - "createServerClient() 사용 — 모든 서버사이드 Supabase 접근은 service role key"

requirements-completed: [GALLERY-01, GALLERY-02, GALLERY-04]

# Metrics
duration: 5min
completed: 2026-03-27
---

# Phase 4 Plan 01: Gallery Backend Infrastructure Summary

**gallery_items 테이블 쿼리 함수, GET /api/gallery 엔드포인트, gallery 버킷 signed URL 지원, 12개 항목 SQL seed 스크립트 구축**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-27T01:42:50Z
- **Completed:** 2026-03-27T01:48:00Z
- **Tasks:** 2
- **Files modified:** 4 created

## Accomplishments

- GalleryItem 타입 정의 및 fetchGalleryItems / fetchFeaturedGalleryItems 쿼리 함수 생성
- GET /api/gallery 엔드포인트 — gallery_items 전체 목록을 JSON으로 반환
- GET /api/secure/files?bucket=gallery signed URL 지원 추가 (ALLOWED_BUCKETS 검증 포함)
- supabase/gallery-seed.sql — 테이블 생성 + RLS 정책 + 12개 항목 INSERT

## Task Commits

Each task was committed atomically:

1. **Task 1: GalleryItem 타입 및 데이터 접근 레이어 생성** - `cb55f9c` (feat)
2. **Task 2: Gallery API 라우트 + signed URL 프록시 확장 + SQL seed 스크립트** - `bd42dd6` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/lib/supabase/gallery.ts` - GalleryItem 타입, fetchGalleryItems, fetchFeaturedGalleryItems
- `src/app/api/gallery/route.ts` - GET /api/gallery 엔드포인트
- `src/app/api/secure/files/route.ts` - bucket 파라미터 추가, ALLOWED_BUCKETS 검증
- `supabase/gallery-seed.sql` - gallery_items 테이블 생성 + RLS + 12개 항목 INSERT

## Decisions Made

- gallery 버킷 signed URL을 새 엔드포인트 대신 기존 /api/secure/files 프록시에 통합. ALLOWED_BUCKETS 확장으로 충분하며 불필요한 라우트 중복 방지.
- fetchFeaturedGalleryItems 별도 함수 제공 — 랜딩 페이지가 is_featured=true 항목만 필요하므로 전용 함수로 분리.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] npm install 실행 — 워크트리에 node_modules 없음**
- **Found during:** Task 2 (TypeScript 컴파일 검증)
- **Issue:** 워크트리에 node_modules가 없어 `npx tsc --noEmit` 실행 시 nodemailer 타입 에러 발생
- **Fix:** npm install 실행하여 의존성 설치
- **Files modified:** 없음 (이미 package.json에 nodemailer 존재)
- **Verification:** npx tsc --noEmit 재실행 후 exit 0 확인
- **Committed in:** bd42dd6 (Task 2 commit에 포함, package 파일 변경 없음)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** npm install은 워크트리 환경 설정 문제로 코드 변경 없음.

## Issues Encountered

- 워크트리가 main 브랜치 최신 커밋보다 오래된 상태 — rebase로 해결. `src/app/api/secure/` 디렉토리가 미추적 상태였으므로 계획에 따라 새로 생성.

## User Setup Required

**External services require manual configuration.** Supabase Dashboard에서 다음 작업 필요:

1. **SQL Editor에서 gallery-seed.sql 실행** — gallery_items 테이블 생성 + RLS + 12개 초기 데이터
2. **Storage에서 'gallery' 버킷 생성** — Private 버킷으로 생성
3. **RLS 정책 확인** — gallery_items SELECT to anon 정책이 적용되었는지 확인

## Next Phase Readiness

- GalleryItem 타입과 fetchGalleryItems 함수가 04-02 갤러리 페이지 동적화에 바로 사용 가능
- fetchFeaturedGalleryItems는 04-03 랜딩 페이지 갤러리 발췌에 사용 가능
- Supabase에 gallery-seed.sql 실행 전까지 /api/gallery는 빈 배열 반환

---
*Phase: 04-dynamic-gallery*
*Completed: 2026-03-27*

## Self-Check: PASSED

- FOUND: src/lib/supabase/gallery.ts
- FOUND: src/app/api/gallery/route.ts
- FOUND: src/app/api/secure/files/route.ts
- FOUND: supabase/gallery-seed.sql
- FOUND commit: cb55f9c (Task 1)
- FOUND commit: bd42dd6 (Task 2)
