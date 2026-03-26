# Phase 1: Quote Form Fix - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

견적 폼 "전송 실패" 버그를 수정하고, 클라이언트사이드 직접 insert를 서버사이드 Route Handler로 전환한다. allpack-ops quotes 테이블 스키마와 완전히 호환되도록 정렬하며, contact_email 컬럼을 nullable로 추가한다.

</domain>

<decisions>
## Implementation Decisions

### Route Handler 전환
- **D-01:** Phase 1에서 바로 Route Handler(`/api/quote`)로 전환한다. 클라이언트사이드 Supabase 직접 insert를 제거하고 서버사이드에서 처리한다.
- **D-02:** Route Handler에서는 Supabase service role key를 사용하여 RLS를 우회한다 (서버사이드이므로 anon key 불필요).
- **D-03:** 이 Route Handler는 Phase 3에서 이메일 발송 로직을 붙이는 확장 포인트가 된다.

### Schema Alignment
- **D-04:** allpack-ops quotes 테이블에 `contact_email` 컬럼을 nullable TEXT로 추가한다. note 필드 패킹을 제거하고 별도 컬럼으로 저장한다.
- **D-05:** allpack-ops의 실제 quotes 스키마: `id`, `quote_number`, `created_at`, `customer_name`, `customer_phone`, `product_name`, `quantity`, `quote_amount`, `status`, `note`, `valid_until`, `file_url`, `file_name`. medal-site 폼은 이 스키마에 맞춰 insert한다.
- **D-06:** `desired_date` → `valid_until` 매핑 유지 (현재 코드 동일).
- **D-07:** `product_name`은 `[medal_type] event_name` 형식으로 구성 (현재 코드 동일).
- **D-08:** `site` 컬럼 값은 `'medal-of-finisher'`로 고정.
- **D-09:** `status` 컬럼은 allpack-ops에서 관리 (reviewing, quoted, converted, rejected). medal-site에서는 insert 시 기본값 사용.

### Claude's Discretion
- Error handling UX: 현재 인라인 빨간 텍스트 패턴 유지 또는 개선 — Claude 재량
- Success feedback: 현재 CheckCircle 인라인 패턴 유지 또는 개선 — Claude 재량

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Database Schema
- `supabase/site-quotes-table.sql` — RLS 정책 및 site 컬럼 추가 SQL
- allpack-ops `src/app/(dashboard)/quotes/page.tsx` lines 7-21 — quotes 테이블 실제 스키마 (Quote type 정의)

### Current Implementation
- `src/app/quote/page.tsx` — 현재 견적 폼 (클라이언트사이드 insert, 버그 있음)
- `src/lib/supabase/client.ts` — Supabase 클라이언트 팩토리 (deprecated auth-helpers-nextjs 사용 중)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/quote/page.tsx`: QuoteForm 타입, MEDAL_TYPES 상수, 폼 UI 전체를 재활용 가능
- `src/lib/supabase/client.ts`: 클라이언트사이드 Supabase 팩토리 (Route Handler에는 서버사이드 클라이언트 새로 필요)

### Established Patterns
- 'use client' 컴포넌트에서 useState로 폼 상태 관리
- Supabase Storage `attachments` 버킷에 파일 업로드 후 publicUrl 획득
- `set(key, value)` 헬퍼로 폼 필드 업데이트

### Integration Points
- `src/app/quote/page.tsx`의 `handleSubmit`을 Route Handler fetch로 교체
- `src/lib/supabase/client.ts`는 유지하되, 서버용 `src/lib/supabase/server.ts` 신규 생성
- `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY` 환경변수 추가 필요

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-quote-form-fix*
*Context gathered: 2026-03-26*
