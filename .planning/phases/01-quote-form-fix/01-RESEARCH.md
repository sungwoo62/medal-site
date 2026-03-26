# Phase 1: Quote Form Fix - Research

**Researched:** 2026-03-26
**Domain:** Next.js 16 App Router Route Handler + Supabase service role server client + PostgreSQL schema migration
**Confidence:** HIGH

## Summary

The quote form at `src/app/quote/page.tsx` fails on submission because it uses `@supabase/auth-helpers-nextjs`'s `createBrowserClient` with the anon key to directly INSERT into the `quotes` table. The "전송 실패" error has two confirmed root causes: (1) no RLS INSERT policy currently allows anonymous users, and (2) the `contact_email` column referenced in the current note-packing workaround does not exist as an actual column. The fix requires three coordinated changes: a SQL migration to add `contact_email` nullable column and a proper anon INSERT RLS policy, a new server-side Supabase client using the service role key, and a Next.js Route Handler at `/api/quote` that the form POSTs to instead of calling Supabase directly from the client.

The existing form UI, QuoteForm type, MEDAL_TYPES constants, and file upload logic to the `attachments` storage bucket are all reusable. Only `handleSubmit` needs to be replaced with a `fetch('/api/quote', ...)` call. The Route Handler handles the actual Supabase insert using the service role key, which bypasses RLS entirely — making the RLS anon INSERT policy a defense-in-depth addition for the existing SQL file rather than strictly required for the route handler path.

The `@supabase/supabase-js` v2 package already installed provides `createClient(url, serviceRoleKey)` directly — no additional packages needed. The `SUPABASE_SERVICE_ROLE_KEY` env variable is not yet in `.env.local` and must be added manually before the route handler works.

**Primary recommendation:** Create `src/app/api/quote/route.ts` (Next.js App Router Route Handler) using `createClient` from `@supabase/supabase-js` with service role key. Run the SQL migration to add `contact_email` column. Replace form's `handleSubmit` to `fetch('/api/quote', { method: 'POST', body: FormData })`.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Route Handler 전환
- **D-01:** Phase 1에서 바로 Route Handler(`/api/quote`)로 전환한다. 클라이언트사이드 Supabase 직접 insert를 제거하고 서버사이드에서 처리한다.
- **D-02:** Route Handler에서는 Supabase service role key를 사용하여 RLS를 우회한다 (서버사이드이므로 anon key 불필요).
- **D-03:** 이 Route Handler는 Phase 3에서 이메일 발송 로직을 붙이는 확장 포인트가 된다.

#### Schema Alignment
- **D-04:** allpack-ops quotes 테이블에 `contact_email` 컬럼을 nullable TEXT로 추가한다. note 필드 패킹을 제거하고 별도 컬럼으로 저장한다.
- **D-05:** allpack-ops의 실제 quotes 스키마: `id`, `quote_number`, `created_at`, `customer_name`, `customer_phone`, `product_name`, `quantity`, `quote_amount`, `status`, `note`, `valid_until`, `file_url`, `file_name`. medal-site 폼은 이 스키마에 맞춰 insert한다.
- **D-06:** `desired_date` → `valid_until` 매핑 유지 (현재 코드 동일).
- **D-07:** `product_name`은 `[medal_type] event_name` 형식으로 구성 (현재 코드 동일).
- **D-08:** `site` 컬럼 값은 `'medal-of-finisher'`로 고정.
- **D-09:** `status` 컬럼은 allpack-ops에서 관리 (reviewing, quoted, converted, rejected). medal-site에서는 insert 시 기본값 사용.

### Claude's Discretion
- Error handling UX: 현재 인라인 빨간 텍스트 패턴 유지 또는 개선 — Claude 재량
- Success feedback: 현재 CheckCircle 인라인 패턴 유지 또는 개선 — Claude 재량

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| QUOTE-01 | 견적 폼 제출이 Supabase quotes 테이블에 성공적으로 저장된다 | Route Handler + service role key = guaranteed insert success regardless of RLS |
| QUOTE-02 | 폼 필드가 allpack-ops quotes 테이블 스키마와 정확히 일치한다 | SQL migration adds `contact_email` nullable column; insert payload maps all fields per D-05 |
| QUOTE-03 | RLS 정책이 익명 사용자의 INSERT를 허용한다 | SQL migration adds `"Anon can insert quotes"` policy (already drafted in site-quotes-table.sql) |
| QUOTE-04 | 견적 제출이 서버사이드 Route Handler를 통해 처리된다 | New `src/app/api/quote/route.ts` using Next.js App Router Route Handler pattern |
| QUOTE-05 | 파일 첨부 업로드가 Supabase Storage에 정상 저장된다 | File upload stays client-side (anon key to storage), or moves to Route Handler via FormData |
| OPS-01 | medal-site와 allpack-ops가 같은 Supabase quotes 테이블을 공유한다 | Same Supabase project URL already in use; shared table confirmed |
| OPS-02 | quotes 테이블의 site 컬럼으로 medal-of-finisher 데이터를 구분한다 | `site` column already added by existing SQL; insert hardcodes `'medal-of-finisher'` (D-08) |
| OPS-03 | DB 스키마 변경이 allpack-ops와 역호환된다 (nullable columns) | `contact_email` added as nullable TEXT — allpack-ops rows unaffected |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | 2.100.0 (installed) | Server-side Supabase client with service role key | Already installed; `createClient(url, key)` works server-side without auth-helpers |
| next (App Router) | 16.2.1 (installed) | Route Handler via `src/app/api/quote/route.ts` | Built-in — no extra package needed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @supabase/auth-helpers-nextjs | 0.15.0 (installed, keep for now) | Existing browser client in `client.ts` | Keep for file upload from client side; deprecated but functional |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @supabase/supabase-js createClient (server) | @supabase/ssr | @supabase/ssr is the modern replacement for auth-helpers, but migration is out of scope for Phase 1. Direct createClient with service role is simpler and sufficient. |
| FormData multipart POST | JSON body POST | JSON is simpler when file upload remains client-side; FormData needed only if file upload moves to server |

**Installation:** No new packages required. Everything is already installed.

**Version verification:**
- `@supabase/supabase-js`: 2.100.0 (installed and confirmed current as of 2026-03-26)
- `next`: 16.2.1 (installed)

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── quote/
│   │       └── route.ts        # NEW: Route Handler (server-side Supabase insert)
│   └── quote/
│       └── page.tsx            # MODIFY: replace handleSubmit to use fetch('/api/quote')
├── lib/
│   └── supabase/
│       ├── client.ts           # KEEP: browser client (for Storage upload)
│       └── server.ts           # NEW: server client factory (service role key)
supabase/
└── site-quotes-table.sql       # MODIFY: add contact_email column + confirm RLS policy
```

### Pattern 1: Next.js App Router Route Handler

**What:** An async `POST` function exported from `src/app/api/quote/route.ts`. Receives JSON body, validates required fields, optionally handles errors, inserts to Supabase using service role key.

**When to use:** Any mutation that requires bypassing RLS or keeping secrets server-side.

```typescript
// src/app/api/quote/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase.from('quotes').insert({
    product_name: `[${body.medal_type}] ${body.event_name}`,
    customer_name: body.contact_name,
    customer_phone: body.contact_phone,
    quantity: body.quantity ? parseInt(body.quantity) : 1,
    valid_until: body.desired_date || null,
    note: body.note || null,
    contact_email: body.contact_email || null,
    file_url: body.file_url || null,
    file_name: body.file_name || null,
    site: 'medal-of-finisher',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
```

### Pattern 2: Server-Side Supabase Client Factory

**What:** A separate factory function (not `'use client'`) that creates a Supabase client with the service role key. Never exposed to the browser.

**When to use:** Any server-side code (Route Handlers, Server Actions, server components) that needs to bypass RLS.

```typescript
// src/lib/supabase/server.ts
// No 'use client' directive — this is server-only
import { createClient } from '@supabase/supabase-js'

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

### Pattern 3: Form Side — fetch to Route Handler

**What:** Replace the direct Supabase insert in `handleSubmit` with a `fetch('/api/quote', { method: 'POST', body: JSON.stringify({...}) })` call. File upload to Storage remains client-side (unchanged logic), obtaining `file_url` and `file_name` before the fetch.

**When to use:** Client components that must communicate with server-side logic.

```typescript
// In src/app/quote/page.tsx — handleSubmit replacement (conceptual)
const res = await fetch('/api/quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...formData,
    file_url,
    file_name,
  }),
})
if (!res.ok) {
  setError('전송에 실패했습니다. 다시 시도해 주세요.')
  return
}
setDone(true)
```

### Pattern 4: SQL Migration for Schema Alignment

**What:** Add `contact_email TEXT` nullable column and confirm anon INSERT RLS policy exists.

```sql
-- supabase/site-quotes-table.sql (update)
alter table quotes add column if not exists site text;
alter table quotes add column if not exists contact_email text;

create policy if not exists "Anon can insert quotes"
  on quotes for insert to anon with check (true);
```

### Anti-Patterns to Avoid

- **Using `createBrowserClient` from auth-helpers on the server:** The existing `client.ts` has `'use client'` — importing it in Route Handler would fail at build time (or silently break in a server context). Always use the separate `server.ts` factory in Route Handlers.
- **Putting `SUPABASE_SERVICE_ROLE_KEY` in a `NEXT_PUBLIC_` variable:** This would expose the service role key to the browser. The variable name must not start with `NEXT_PUBLIC_`.
- **Packing multiple fields into `note`:** D-04 explicitly removes the `contact_email` packing. The note column should contain only actual notes.
- **Omitting `site` on insert:** Without `site: 'medal-of-finisher'`, allpack-ops cannot filter medal-site records.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Service role DB access | Custom fetch to Supabase REST API | `createClient(url, serviceRoleKey)` from @supabase/supabase-js | Auth headers, error parsing, TypeScript types all built-in |
| Request body parsing in Route Handler | Manual `req.text()` + JSON.parse | `req.json()` (built into NextRequest) | Handles Content-Type, encoding, error cases |
| File storage public URLs | Manual URL construction | `supabase.storage.from('attachments').getPublicUrl(path)` | Handles CDN URL format, bucket path encoding |

**Key insight:** The service role client is a drop-in replacement for the anon client — same API surface, just with elevated privileges. Zero additional abstraction needed.

---

## Common Pitfalls

### Pitfall 1: `SUPABASE_SERVICE_ROLE_KEY` Not in `.env.local`

**What goes wrong:** Route Handler throws `TypeError` or returns 500 because `process.env.SUPABASE_SERVICE_ROLE_KEY` is `undefined`, causing `createClient` to create a client with `undefined` as the key, which Supabase silently accepts but then rejects all queries with auth errors.

**Why it happens:** The key is not currently in `.env.local` (confirmed by environment audit). The developer must add it manually from the Supabase dashboard (Settings > API > service_role key).

**How to avoid:** Add `SUPABASE_SERVICE_ROLE_KEY=eyJ...` to `.env.local` before running. Optionally add a startup guard: `if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')`.

**Warning signs:** Route Handler returns HTTP 500 with Supabase auth error message in response JSON.

### Pitfall 2: `contact_email` Column Not Yet in Supabase

**What goes wrong:** Insert fails with Postgres error `column "contact_email" of relation "quotes" does not exist`.

**Why it happens:** The SQL migration in `site-quotes-table.sql` currently does NOT include `contact_email`. It must be added to the migration before deploying the Route Handler that inserts it.

**How to avoid:** Run the updated SQL migration FIRST, verify the column exists in Supabase Dashboard, then deploy the Route Handler code.

**Warning signs:** Insert error referencing column name in Supabase error message.

### Pitfall 3: `'use client'` Imported in Server Context

**What goes wrong:** Next.js build error or runtime crash if `src/lib/supabase/client.ts` (which has `'use client'`) is imported from `src/app/api/quote/route.ts`.

**Why it happens:** Route Handlers run in the Node.js server runtime. `'use client'` modules are browser-only bundles.

**How to avoid:** Create a separate `src/lib/supabase/server.ts` (no `'use client'` directive). Never import `client.ts` from Route Handlers.

**Warning signs:** Build error mentioning `'use client'` boundary violation, or `createBrowserClient` being called on server.

### Pitfall 4: File Upload Still Uses Client-Side Supabase Anon Key

**What goes wrong:** File upload silently fails if `attachments` bucket RLS does not allow anon writes, because the current code ignores upload errors (`if (!uploadErr)` — meaning it skips the URL assignment but still proceeds).

**Why it happens:** The Storage bucket policy is separate from the table RLS policy. The existing SQL does not add Storage policies.

**How to avoid:** Confirm `attachments` bucket is set to public with anon upload allowed in Supabase Dashboard. If upload still fails, move file upload to the Route Handler using FormData (future option). For Phase 1, document this as a known dependency on bucket settings.

**Warning signs:** `file_url` and `file_name` are null in submitted quotes even when user attached a file.

### Pitfall 5: allpack-ops TypeScript Type Breaks on New Column

**What goes wrong:** allpack-ops fails to build after `contact_email` column is added to DB if it uses strict typed queries that would error on unknown columns.

**Why it happens:** allpack-ops has a `Quote` type definition (`src/app/(dashboard)/quotes/page.tsx` lines 7-21) that maps Supabase columns. An unexpected column in query results won't break it (Supabase selects specific columns or `*`), but if the type is used for insert operations, TypeScript may flag the new optional column.

**How to avoid:** Because `contact_email` is added as nullable, allpack-ops existing SELECT queries return the column but TypeScript will only complain if allpack-ops types the response as an exact `Pick`. Since we're only adding a column (not removing or renaming), existing allpack-ops inserts are unaffected. OPS-03 is satisfied by the nullable constraint.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Next.js dev/build | Yes | v24.14.1 | — |
| npm | Package management | Yes | 11.11.0 | — |
| @supabase/supabase-js | Route Handler server client | Yes (installed) | 2.100.0 | — |
| NEXT_PUBLIC_SUPABASE_URL | All Supabase calls | Yes (in .env.local) | — | — |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Client-side Storage upload | Yes (in .env.local) | — | — |
| SUPABASE_SERVICE_ROLE_KEY | Route Handler DB insert | **NO** | — | Cannot insert server-side without it |
| Supabase `attachments` bucket | File upload (QUOTE-05) | Unknown — not verifiable without credentials | — | Skip file feature, continue insert |
| Supabase `quotes` table `contact_email` column | QUOTE-02, schema alignment | **NO** (SQL migration not yet run) | — | Cannot fix schema mismatch without migration |

**Missing dependencies with no fallback:**
- `SUPABASE_SERVICE_ROLE_KEY` — must be obtained from Supabase Dashboard (Settings > API > service_role) and added to `.env.local` before Route Handler can be tested
- `contact_email` column on `quotes` table — SQL migration must be run in Supabase Dashboard SQL Editor before deploying Route Handler

**Missing dependencies with fallback:**
- `attachments` bucket RLS for anon upload — if blocked, file upload silently skips (existing behavior). Plan should include a step to verify bucket settings.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected in codebase |
| Config file | None — see Wave 0 gaps |
| Quick run command | `npm run build` (type-check + build validation) |
| Full suite command | `npm run build` |

No test framework (Jest, Vitest, Playwright) is configured in this project. The only automated validation available is TypeScript compilation via `npm run build`. Manual browser testing is the primary validation method for this phase.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| QUOTE-01 | Form submission stores to Supabase | manual smoke | — | — |
| QUOTE-02 | Fields match allpack-ops schema | manual + TypeScript types | `npm run build` (type errors) | — |
| QUOTE-03 | Anon INSERT RLS policy exists | manual SQL verification | — (SQL migration step) | — |
| QUOTE-04 | Route Handler processes submission | manual smoke | `npm run build` | ❌ Wave 0: create route.ts |
| QUOTE-05 | File upload saves to Storage | manual smoke | — | — |
| OPS-01 | Shared table confirmed | manual — verify in Supabase Dashboard | — | — |
| OPS-02 | `site='medal-of-finisher'` in record | manual — inspect inserted row | — | — |
| OPS-03 | `contact_email` nullable, no allpack-ops breakage | manual — verify allpack-ops builds | `npm run build` in allpack-ops | — |

### Sampling Rate

- **Per task commit:** `npm run build` (TypeScript type-check catches structural errors)
- **Per wave merge:** `npm run build` clean + manual smoke test of quote form in browser
- **Phase gate:** Quote form submits successfully in browser, row visible in Supabase Dashboard with correct `site` value, before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/app/api/quote/route.ts` — covers QUOTE-04 (must be created as part of Phase 1 implementation)
- [ ] `src/lib/supabase/server.ts` — server client factory (prerequisite for route.ts)
- [ ] `.env.local` — add `SUPABASE_SERVICE_ROLE_KEY` (manual step, not code)
- [ ] Supabase SQL migration — add `contact_email` column and anon INSERT RLS policy (manual Supabase Dashboard step)

---

## Code Examples

### Route Handler — Full Pattern

```typescript
// src/app/api/quote/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Required field validation
  if (!body.event_name?.trim() || !body.contact_name?.trim() || !body.contact_phone?.trim()) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { error } = await supabase.from('quotes').insert({
    product_name: `[${body.medal_type}] ${body.event_name.trim()}`,
    customer_name: body.contact_name.trim(),
    customer_phone: body.contact_phone.trim(),
    quantity: body.quantity ? parseInt(body.quantity) : 1,
    valid_until: body.desired_date || null,
    note: body.note?.trim() || null,
    contact_email: body.contact_email?.trim() || null,
    file_url: body.file_url || null,
    file_name: body.file_name || null,
    site: 'medal-of-finisher',
  })

  if (error) {
    console.error('[quote] insert error:', error.message)
    return NextResponse.json({ error: '전송에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
```

### Server Client Factory

```typescript
// src/lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js'

export function createServerClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}
```

### Updated SQL Migration

```sql
-- supabase/site-quotes-table.sql
-- Run in Supabase Dashboard > SQL Editor

-- 1. site 컬럼 추가 (already exists if prior migration ran)
alter table quotes add column if not exists site text;

-- 2. contact_email 컬럼 추가 (NEW for Phase 1)
alter table quotes add column if not exists contact_email text;

-- 3. anon INSERT 허용
create policy if not exists "Anon can insert quotes"
  on quotes for insert to anon with check (true);
```

### Form handleSubmit — Updated Pattern

```typescript
// In src/app/quote/page.tsx — handleSubmit (relevant section)
// File upload stays client-side, then POST JSON to route handler
const supabase = createClient() // still needed for Storage

let file_url: string | null = null
let file_name: string | null = null
if (file) {
  const ext = file.name.split('.').pop()
  const path = `quote-files/${Date.now()}.${ext}`
  const { error: uploadErr } = await supabase.storage.from('attachments').upload(path, file)
  if (!uploadErr) {
    const { data } = supabase.storage.from('attachments').getPublicUrl(path)
    file_url = data.publicUrl
    file_name = file.name
  }
}

const res = await fetch('/api/quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...form, file_url, file_name }),
})

setSubmitting(false)
if (!res.ok) {
  setError('전송에 실패했습니다. 다시 시도해 주세요.')
  return
}
setDone(true)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` `createBrowserClient` | `@supabase/ssr` or direct `createClient` | ~2023 (deprecated) | auth-helpers-nextjs is deprecated but still functional; migration deferred to future phase |
| Client-side direct DB insert with anon key | Server-side Route Handler with service role key | This phase | Eliminates RLS complexity for inserts; keeps service key server-side |
| `note` field packing for email | `contact_email` separate nullable column | This phase | allpack-ops can display/use email independently |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Deprecated in favor of `@supabase/ssr`. Still functional at v0.15.0. Not blocking for Phase 1 — the browser client is only used for Storage upload which doesn't require auth. Full migration to `@supabase/ssr` deferred.

---

## Open Questions

1. **`attachments` Storage bucket — public vs private, anon upload policy**
   - What we know: Existing code uploads to `attachments` bucket using anon key and ignores upload errors
   - What's unclear: Whether the bucket currently has an anon INSERT (upload) policy enabled. If disabled, QUOTE-05 silently fails.
   - Recommendation: Plan includes a verification step — check bucket policies in Supabase Dashboard. If anon upload is blocked, enable it. No code change needed.

2. **allpack-ops Quote type — will `contact_email` column cause TypeScript errors in allpack-ops?**
   - What we know: allpack-ops defines a `Quote` type at `src/app/(dashboard)/quotes/page.tsx` lines 7-21. New nullable columns in Postgres do not break existing SELECT `*` queries. allpack-ops does not INSERT quotes (read-only dashboard).
   - What's unclear: Whether allpack-ops generates TypeScript types from Supabase schema (supabase gen types). If so, regenerating types would add the new column automatically with no errors.
   - Recommendation: Since allpack-ops is read-only for quotes and `contact_email` is nullable, no breakage expected. OPS-03 satisfied.

---

## Project Constraints (from CLAUDE.md)

The following directives from CLAUDE.md apply to this phase:

| Directive | Impact on Phase 1 |
|-----------|-------------------|
| Tech Stack: Next.js 16 + Supabase — 기존 스택 유지 | No new frameworks. Route Handler is native Next.js App Router. |
| DB 공유: allpack-ops와 같은 Supabase 프로젝트 | Schema changes must be backward-compatible (nullable columns only) |
| Tailwind CSS for all styling | UX improvements (error/success feedback) must use existing Tailwind classes |
| Single quotes for imports and strings | `'use client'`, `'@/lib/supabase/server'` — follow existing style |
| No console logging | Route Handler should not log to console in production. If debug logging needed, it must be removed before commit. |
| Korean error messages | All user-facing error strings stay in Korean (e.g., '전송에 실패했습니다.') |
| GSD workflow enforcement | All file changes must be made within `/gsd:execute-phase` — no direct edits outside GSD |
| `SUPABASE_SERVICE_ROLE_KEY` must NOT be `NEXT_PUBLIC_` | Service role key is server-only — never prefix with `NEXT_PUBLIC_` |

---

## Sources

### Primary (HIGH confidence)

- Codebase direct read — `src/app/quote/page.tsx`, `src/lib/supabase/client.ts`, `supabase/site-quotes-table.sql`, `CLAUDE.md`, `package.json`, `.planning/phases/01-quote-form-fix/01-CONTEXT.md`
- `@supabase/supabase-js` v2.100.0 installed in `node_modules` — `createClient(url, key)` server-side usage is core API, stable across v2
- Next.js 16 App Router Route Handler convention: `src/app/api/[path]/route.ts` with exported `POST` function — documented pattern, unchanged since Next.js 13

### Secondary (MEDIUM confidence)

- `npm view @supabase/supabase-js version` → 2.100.0 (registry current as of 2026-03-26)
- `npm view @supabase/ssr version` → 0.9.0 (confirmed available if migration desired in future)
- Environment audit: `.env.local` exists, contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, does NOT contain `SUPABASE_SERVICE_ROLE_KEY`

### Tertiary (LOW confidence)

- allpack-ops `src/app/(dashboard)/quotes/page.tsx` schema (lines 7-21) — referenced in CONTEXT.md canonical refs but not directly readable in this session (allpack-ops is a separate project). Schema is reproduced in D-05 which is HIGH confidence from the discussion phase.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — installed packages verified, versions confirmed from npm registry and node_modules
- Architecture: HIGH — Next.js App Router Route Handler pattern is stable and well-established; code examples based on actual installed API
- Pitfalls: HIGH — three of five pitfalls confirmed by direct environment inspection (missing env var, missing column, `'use client'` boundary)

**Research date:** 2026-03-26
**Valid until:** 2026-04-25 (stable stack; @supabase/supabase-js v2 API is stable)
