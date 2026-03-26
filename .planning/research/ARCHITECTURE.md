# Architecture Patterns

**Project:** Medal of Finisher — B2C Quote Platform
**Researched:** 2026-03-26
**Confidence:** HIGH (based on direct codebase analysis + established Supabase/Next.js patterns)

---

## Current State Summary

The codebase is a Next.js 16 App Router project with:
- All pages server-rendered by default; interactive components opt into `'use client'`
- A single Supabase client (`src/lib/supabase/client.ts`) using `createBrowserClient` from `@supabase/auth-helpers-nextjs`
- No server-side Supabase client (no Route Handlers, no Server Actions yet)
- No authentication — all Supabase calls use the anon key with no session context
- Static data arrays hardcoded in page components (gallery, categories, process steps)
- Quote form submits directly from the browser client to Supabase via `supabase.from('quotes').insert()`

This architecture must expand to support four new capabilities without breaking the existing pattern or the allpack-ops shared DB.

---

## Recommended Architecture

### Overview

```
Browser (Client Components)
  |
  ├── Supabase Auth (session management, cookie-based)
  |      └── /mypage — protected route, SSR session check
  |
  ├── Next.js Route Handlers (src/app/api/)
  |      ├── POST /api/quote/submit — server-side insert + email trigger
  |      └── POST /api/quote/submit triggers → Nodemailer SMTP → Google Workspace
  |
  ├── Supabase Browser Client (anon key)
  |      └── Gallery reads from `gallery_items` table (public read)
  |
  └── Supabase Server Client (service role / session)
         ├── /mypage — reads quotes filtered by customer_email + site='medal-of-finisher'
         └── RLS policies enforced per user session

Supabase (Shared with allpack-ops)
  ├── quotes table — site='medal-of-finisher' filter isolates records
  ├── gallery_items table — new, medal-site only writes; public reads
  ├── auth.users — Supabase Auth (email/password)
  ├── Storage: attachments bucket — quote file uploads
  └── Storage: gallery bucket — gallery images managed by allpack-ops admin
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `src/lib/supabase/client.ts` | Browser Supabase client (anon) | Gallery reads, Storage uploads |
| `src/lib/supabase/server.ts` (new) | Server Supabase client (cookie session) | Mypage queries, Route Handlers |
| `src/app/api/quote/submit/route.ts` (new) | Server-side quote insert + email dispatch | Supabase server client, Nodemailer |
| `src/lib/email.ts` (new) | Nodemailer SMTP wrapper | Google Workspace SMTP |
| `src/app/(auth)/` (new route group) | Login, signup pages | Supabase Auth browser client |
| `src/app/mypage/` (new) | Customer portal — view own quotes | Supabase server client, Auth session |
| `src/middleware.ts` (new) | Protect `/mypage` routes, refresh auth tokens | Supabase Auth helpers |
| `src/app/gallery/page.tsx` (refactor) | Fetch gallery items from DB instead of hardcoded | Supabase server client (RSC) |
| allpack-ops admin | Manage quotes, upload gallery images | Same Supabase project, different Next.js app |

---

## Data Flow

### 1. Quote Submission with Email Notification

```
User (browser)
  → fills form in /quote (client component)
  → POST /api/quote/submit (Route Handler)
      → validate server-side
      → supabase.from('quotes').insert({ site: 'medal-of-finisher', ... })
      → on success: sendEmail(customer) + sendEmail(admin)  [Nodemailer SMTP]
      → return { success: true } or { error: ... }
  → client shows success/error state
```

**Key change from current:** Quote insert moves from browser client to Route Handler. This enables:
- Email triggered reliably after confirmed DB insert
- Server-side validation in addition to client-side
- SMTP credentials kept server-side only (not exposed in browser)

**Email sender identity:** `noreply@medaloffinisher.com` or `info@medaloffinisher.com` via Google Workspace SMTP. Two emails per submission: (1) customer confirmation with event name + expected turnaround, (2) admin notification with all form fields.

### 2. Supabase Auth — Customer Login and Mypage

```
User visits /mypage
  → middleware.ts intercepts request
      → createServerClient(cookies) to check session
      → no session → redirect to /login
      → valid session → pass through

/login page (client component)
  → supabase.auth.signInWithPassword({ email, password })
  → on success: session stored in cookie by Supabase Auth helpers
  → redirect to /mypage

/mypage page (Server Component — RSC)
  → createServerClient(cookies) — reads session from cookie
  → supabase.from('quotes').select().eq('site', 'medal-of-finisher')
      .eq('customer_email', session.user.email)  ← RLS + explicit filter
  → render quote list with status
```

**Auth data model note:** The current `quotes` table stores `customer_phone` but not a standalone `customer_email` column — email is packed into the `note` field as `"이메일: foo@bar.com"`. For mypage to link quotes to auth users, quotes need a dedicated `customer_email` column OR a `user_id` foreign key to `auth.users`. Since allpack-ops shares this schema, adding `customer_email` as a nullable column is the least-invasive option and backward-compatible with allpack-ops.

### 3. Dynamic Gallery — Supabase Storage + DB

```
allpack-ops admin (separate app)
  → uploads image to Supabase Storage gallery bucket
  → inserts row into gallery_items table:
      { id, title, category, year, description, image_path, display_order, site }

/gallery page (Server Component — RSC, no 'use client' needed)
  → createServerClient() or anon client
  → supabase.from('gallery_items').select().order('display_order')
  → renders grid with <Image> from Storage public URLs
  → filter state still client-side via URL search params or client wrapper
```

**gallery_items table schema:**
```sql
id            uuid primary key default gen_random_uuid()
title         text not null
category      text not null          -- '마라톤', '체육대회', '시상식', '기업행사'
year          text                   -- '2024'
description   text
image_path    text                   -- Storage path: gallery/{filename}
display_order integer default 0
site          text default 'medal-of-finisher'
created_at    timestamptz default now()
```

Gallery page becomes a Server Component that fetches on each request (or with revalidation). The category filter moves to URL search params (`/gallery?cat=마라톤`) so RSC can filter server-side, or a thin client wrapper handles filter UI while RSC provides initial data.

### 4. Shared DB with allpack-ops

The `site` column pattern already exists on `quotes`. The architecture extends this to:

- `gallery_items` table: `site` column set by allpack-ops when uploading
- Both apps use the same Supabase project URL and anon key
- RLS policies separate write access: allpack-ops writes gallery_items; medal-site reads them
- allpack-ops never touches `auth.users` from medal-site (different user bases — admin users vs customers)

**Coordination constraint:** Any schema change to `quotes` (e.g., adding `customer_email`) must be verified against allpack-ops column expectations before migration. Use `ALTER TABLE quotes ADD COLUMN customer_email text;` — nullable, no default — so allpack-ops inserts continue without specifying the column.

---

## Patterns to Follow

### Pattern 1: Dual Supabase Client Files

Create two clients instead of the current one:

```typescript
// src/lib/supabase/client.ts — existing, browser only
export function createClient() {
  return createBrowserClient(url, anonKey)
}

// src/lib/supabase/server.ts — new, Server Components + Route Handlers
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(url, anonKey, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
      set: (name, value, options) => cookieStore.set({ name, value, ...options }),
      remove: (name, options) => cookieStore.set({ name, value: '', ...options }),
    },
  })
}
```

Note: `@supabase/auth-helpers-nextjs` is being superseded by `@supabase/ssr`. The existing `createBrowserClient` import from `auth-helpers-nextjs` still works but new server-side code should use `@supabase/ssr` directly. Install `@supabase/ssr` alongside the existing package.

### Pattern 2: Route Handler for Quote Submission

Move the `supabase.from('quotes').insert()` call from the browser client component into a Route Handler. The client POSTs JSON; the server inserts and fires email.

```typescript
// src/app/api/quote/submit/route.ts
export async function POST(req: Request) {
  const body = await req.json()
  const supabase = createServerSupabaseClient()  // or service role client
  const { error } = await supabase.from('quotes').insert({ ...body, site: 'medal-of-finisher' })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  await sendQuoteEmails(body)  // fire-and-forget or awaited
  return Response.json({ success: true })
}
```

### Pattern 3: Middleware for Auth Protection

```typescript
// src/middleware.ts
import { updateSession } from '@/lib/supabase/middleware'
export async function middleware(request: NextRequest) {
  return await updateSession(request)  // refreshes Supabase session cookie
}
export const config = { matcher: ['/mypage/:path*'] }
```

### Pattern 4: Server Component Gallery Fetch

```typescript
// src/app/gallery/page.tsx — remove 'use client', fetch server-side
export default async function GalleryPage({ searchParams }) {
  const supabase = createServerSupabaseClient()
  const { data: items } = await supabase
    .from('gallery_items')
    .select('*')
    .order('display_order', { ascending: true })
  // pass items to a client component for filter UI interaction
  return <GalleryGrid items={items ?? []} />
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Triggering Email from the Browser Client
**What:** Calling an email API or SMTP directly from a `'use client'` component.
**Why bad:** Exposes SMTP credentials in the browser bundle. Unreliable (tab close, network interruption). No way to confirm DB insert happened before email sends.
**Instead:** Route Handler that inserts to DB, confirms success, then sends email.

### Anti-Pattern 2: Using anon Key for Mypage Queries Without RLS
**What:** Fetching all quotes server-side with anon key and filtering by email in application code.
**Why bad:** Anyone with the anon key can query any quote. The filter is only in app code — not enforced at DB level.
**Instead:** Set RLS policy on `quotes` so authenticated users can only SELECT rows where `customer_email = auth.email()`. Service role key (for Route Handlers) bypasses RLS intentionally — use with care.

### Anti-Pattern 3: Blocking Gallery on Auth
**What:** Requiring login to view gallery items.
**Why bad:** Gallery is marketing content — blocking it hurts conversion. Gallery reads are public.
**Instead:** Gallery table has public SELECT via RLS. Only writes are restricted to service role (allpack-ops admin).

### Anti-Pattern 4: Storing Admin Users in auth.users
**What:** Using the same Supabase Auth for allpack-ops admin logins as for medal-site customer logins.
**Why bad:** Admin accounts pollute customer auth space. No clear role separation.
**Instead:** allpack-ops uses its own auth mechanism (separate Supabase project, or basic auth, or internal tool auth). medal-site `auth.users` is exclusively for customers. This is already implied by PROJECT.md — allpack-ops is a separate project.

### Anti-Pattern 5: Parsing Email from the `note` Column
**What:** Extracting `customer_email` by parsing the `note` text field (`"이메일: foo@bar.com"`) for mypage linking.
**Why bad:** Brittle string parsing. Fails if format changes. Cannot index for queries.
**Instead:** Add `customer_email` as a proper nullable column to `quotes`. Update the form submission to populate it directly.

---

## Build Order

Dependencies determine this order. Each phase unblocks the next.

### Phase 1: Fix quote submission + migrate to Route Handler

**Dependency:** Everything downstream (email, mypage) requires reliable quote insertion.

- Create `src/app/api/quote/submit/route.ts`
- Move insert logic out of browser client
- Diagnose and fix the current "전송 실패" error (likely RLS policy blocking anon inserts, or schema mismatch — the form sends `event_name` but the existing architecture doc mentions `product_name` mapping; verify against allpack-ops schema)
- Add `customer_email` column to `quotes` (nullable, backward-compatible)
- Update quote form to POST to Route Handler instead of calling Supabase directly

### Phase 2: Email notifications

**Dependency:** Requires working Route Handler from Phase 1.

- Install `nodemailer` + `@types/nodemailer`
- Create `src/lib/email.ts` with `sendQuoteEmails(formData)` function
- Add SMTP env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ADMIN_EMAIL`
- Invoke `sendQuoteEmails` inside the Route Handler after confirmed insert
- Two templates: customer confirmation (Korean), admin notification (all fields)

### Phase 3: Dynamic gallery

**Dependency:** Requires `gallery_items` table and Storage bucket in Supabase. Independent of auth.

- Create `gallery_items` table in Supabase (schema above)
- Create `gallery` Storage bucket (public read, restricted write)
- Refactor `src/app/gallery/page.tsx` from `'use client'` hardcoded array to async Server Component
- Create `src/components/GalleryGrid.tsx` as client component (handles filter state)
- allpack-ops seeds initial gallery data (migrate the 12 hardcoded items)

### Phase 4: Supabase Auth + Mypage

**Dependency:** Requires `customer_email` column on `quotes` (Phase 1). Requires `@supabase/ssr` package.

- Install `@supabase/ssr`
- Create `src/lib/supabase/server.ts` (server client factory)
- Create `src/middleware.ts` (session refresh + route protection)
- Create `src/app/(auth)/login/page.tsx` and `src/app/(auth)/signup/page.tsx`
- Create `src/app/mypage/page.tsx` (Server Component, shows user's quotes)
- Set RLS policies: customers can SELECT own quotes by `customer_email`
- Add login/mypage link to Header

---

## RLS Policy Design

```sql
-- quotes: anyone (anon) can INSERT (needed for quote form without auth)
CREATE POLICY "public insert quotes" ON quotes
  FOR INSERT TO anon WITH CHECK (site = 'medal-of-finisher');

-- quotes: authenticated customers can SELECT their own records
CREATE POLICY "customers read own quotes" ON quotes
  FOR SELECT TO authenticated
  USING (customer_email = auth.email() AND site = 'medal-of-finisher');

-- gallery_items: public SELECT
CREATE POLICY "public read gallery" ON gallery_items
  FOR SELECT TO anon USING (true);

-- gallery_items: only service role can INSERT/UPDATE/DELETE (allpack-ops uses service key)
-- no permissive policies for INSERT = only service role bypasses RLS
```

---

## Environment Variables

```bash
# Existing
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# New — server-side only (not NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=   # for Route Handlers that need to bypass RLS
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@medaloffinisher.com
SMTP_PASS=                   # Google Workspace app password
ADMIN_EMAIL=info@medaloffinisher.com
```

---

## Scalability Considerations

| Concern | Current (now) | At 100 quotes/day | At 1000 quotes/day |
|---------|--------------|-------------------|-------------------|
| Email delivery | Nodemailer SMTP direct | Fine | Consider queued delivery (Supabase Edge Functions + resend.com) |
| Gallery images | Supabase Storage public CDN | Fine | Fine (CDN handles it) |
| Auth session | Cookie-based, stateless | Fine | Fine (Supabase Auth scales) |
| DB shared load | Single Supabase project | Fine | Monitor connection pooling |

The current traffic profile (B2C quote business) makes this a low-volume system. The Nodemailer/SMTP approach is appropriate — no need for a transactional email provider unless daily volume exceeds ~200 emails.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Route Handler pattern | HIGH | Standard Next.js App Router pattern, well-established |
| Supabase Auth with @supabase/ssr | HIGH | Official recommended approach as of 2025 |
| Nodemailer + Google Workspace SMTP | HIGH | Mature library, Google Workspace supports app passwords |
| RLS policy design | HIGH | Standard Supabase multi-tenant pattern |
| gallery_items table schema | MEDIUM | Schema is proposed; allpack-ops admin UI needs to match it |
| auth-helpers vs ssr package | MEDIUM | `@supabase/auth-helpers-nextjs` still works but `@supabase/ssr` is the forward path; verify version compatibility with Next.js 16 |

---

*Architecture analysis: 2026-03-26*
