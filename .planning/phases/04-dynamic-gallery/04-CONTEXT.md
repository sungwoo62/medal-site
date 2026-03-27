# Phase 4: Dynamic Gallery - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

갤러리 페이지를 하드코딩 데이터에서 Supabase DB + Storage 기반 동적 로딩으로 전환한다. gallery_items 테이블 생성, 기존 12개 항목 마이그레이션, 카테고리 필터 유지, 이미지 signed URL 프록시 적용. allpack-ops에 갤러리 관리 CRUD UI도 포함한다.

</domain>

<decisions>
## Implementation Decisions

### Data Model
- **D-01:** gallery_items 테이블에 확장 필드 포함: title, category, year, description, image_url, display_order (정렬), is_featured (랜딩 페이지 발췌용), created_at
- **D-02:** allpack-ops에서 갤러리 항목 관리(추가/수정/삭제) 가능해야 한다 — medal-site는 읽기 전용, allpack-ops에 CRUD UI 구현

### Image Handling
- **D-03:** 기존 `/api/secure/files` signed URL 프록시 패턴 재활용 — private 버킷 + signed URL (Phase 1에서 구현됨)
- **D-04:** Storage 버킷명: `gallery` (기존 `attachments`와 분리)

### Data Fetching
- **D-05:** Claude 재량 — SSR + 클라이언트 필터 or 클라이언트 전체 fetch 중 최적 방식 결정

### Migration
- **D-06:** SQL seed 스크립트로 현재 ITEMS 배열의 12개 항목을 gallery_items 테이블에 INSERT. 이미지 없이 데이터만 먼저 마이그레이션하고, 이미지는 allpack-ops에서 나중에 업로드

### Claude's Discretion
- Image fallback UI: 이미지 없는 항목의 표시 방식 (현재 그라데이션 유지, 플레이스홀더 등)
- Data fetching 전략: SSR vs CSR 선택
- allpack-ops 갤러리 관리 페이지 UI/UX 세부사항
- RLS 정책: gallery_items 테이블 읽기 권한 설정

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Gallery Code
- `src/app/gallery/page.tsx` — 현재 하드코딩 갤러리 (ITEMS 배열, CATEGORIES, GRADIENTS, 필터 UI). 이 파일을 동적 로딩으로 전환
- `src/app/page.tsx` — 랜딩 페이지 갤러리 발췌 섹션 (GALLERY_ITEMS). is_featured 활용 지점

### Signed URL Proxy
- `src/app/api/secure/files/route.ts` — 기존 signed URL 프록시 구현. gallery 버킷에도 동일 패턴 적용

### Server Infrastructure
- `src/lib/supabase/server.ts` — 서버사이드 Supabase 클라이언트 (service role key)
- `src/lib/supabase/client.ts` — 브라우저사이드 Supabase 클라이언트

### allpack-ops Reference
- `~/allpack-ops/src/app/(dashboard)/products/page.tsx` — allpack-ops CRUD 페이지 패턴 (모달 폼, 테이블, 검색, 인라인 수정). 갤러리 관리 페이지 구현 시 참고
- `~/allpack-ops/src/app/(dashboard)/CLAUDE.md` — 대시보드 페이지 패턴 가이드

### Requirements
- `.planning/REQUIREMENTS.md` §Gallery — GALLERY-01~05 요구사항

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/gallery/page.tsx`: CATEGORIES 배열, GRADIENTS 매핑, 필터 UI 전체를 동적 버전으로 전환
- `src/app/api/secure/files/route.ts`: signed URL 프록시 — gallery 버킷도 동일하게 사용 가능
- `src/lib/supabase/server.ts`: 서버사이드 클라이언트 패턴

### Established Patterns
- 'use client' + useState로 필터 상태 관리 (gallery)
- allpack-ops: 클라이언트 컴포넌트 CRUD 패턴 (모달 폼, supabase.from().select/insert/update/delete)
- allpack-ops: Supabase Storage 파일 업로드 (attachments 버킷 패턴)

### Integration Points
- gallery_items 테이블 생성 (Supabase)
- gallery Storage 버킷 생성 (Supabase)
- allpack-ops에 `/gallery` 대시보드 페이지 추가 (Sidebar 네비게이션 포함)
- 랜딩 페이지 갤러리 발췌 섹션도 동적 데이터로 전환 가능 (is_featured 활용)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

- **GALLERY-06**: next/image 최적화 (blur placeholder) — v2 요구사항으로 이미 분류됨

</deferred>

---

*Phase: 04-dynamic-gallery*
*Context gathered: 2026-03-27*
