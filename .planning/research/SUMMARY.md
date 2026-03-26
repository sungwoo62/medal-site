# Project Research Summary

**Project:** Medal of Finisher
**Domain:** B2C custom manufacturing quote platform (medal fabrication) — Next.js + Supabase
**Researched:** 2026-03-26
**Confidence:** HIGH

## Executive Summary

Medal of Finisher is a Korean-market B2C quote site for medal manufacturing. The existing stack (Next.js 16.2.1, React 19, Tailwind CSS 4, Supabase JS 2) is solid but needs four additions: email notifications via SMTP, Supabase Auth for a customer portal, a dynamic gallery from Supabase Storage, and a mypage showing quote status. The recommended approach is to extend the existing stack minimally — adding only `@supabase/ssr` and `nodemailer` — while moving quote submission from a browser-side Supabase call to a server-side Route Handler. This single architectural shift unblocks email sending, enables proper auth, and is a prerequisite for every other milestone feature.

The most important constraint is the shared Supabase project with `allpack-ops` (the admin app). All schema changes must be nullable, use the existing `site = 'medal-of-finisher'` column filter, and be coordinated across both apps. The current quote form is broken due to an RLS policy blocking anonymous inserts — this is the first thing to fix and everything else is blocked until it works. The customer portal (mypage) follows naturally from a working auth setup, and the dynamic gallery is independent and can proceed in parallel with auth work.

The primary risks are: (1) SMTP email timing in a serverless environment (use fire-and-forget, not blocking await), (2) session handling breaking if the deprecated `@supabase/auth-helpers-nextjs` package is mixed with the new `@supabase/ssr` package, and (3) schema migrations inadvertently breaking `allpack-ops` if new columns are added as NOT NULL. All three risks are well-understood and have clear mitigations.

---

## Key Findings

### Recommended Stack

The existing stack requires only two new runtime packages: `@supabase/ssr` (replaces the deprecated `@supabase/auth-helpers-nextjs`) and `nodemailer` (SMTP email via Google Workspace). Everything else — gallery, mypage data, Storage — is already handled by `@supabase/supabase-js@2` which is already installed. No state management library, no form library, no email templating framework is needed.

The auth-helpers migration is mandatory before any auth or mypage work. The existing `createBrowserClient` import from the deprecated package only works in browser contexts; server-side auth (Server Components, Route Handlers, Middleware) requires `@supabase/ssr`'s `createServerClient`. Running both packages simultaneously causes session state inconsistencies.

**Core technologies:**
- `@supabase/ssr` ~0.6.x: replace deprecated auth-helpers for cookie-based SSR session handling — official Supabase recommendation
- `nodemailer` ~3.1.x: SMTP email via Google Workspace — the only viable option given the SMTP constraint; third-party services (Resend, SendGrid) are explicitly out of scope
- `@supabase/supabase-js@2`: already installed; handles gallery reads, Storage, and all DB queries — no new package needed
- `next/image`: already available via Next.js; handles gallery image optimization with `remotePatterns` configured for `*.supabase.co`

### Expected Features

**Must have (table stakes):**
- Fix quote form submission ("전송에 실패했습니다" bug) — everything downstream is blocked until quotes actually save
- Customer receipt email + admin alert email on form submit — reduces "did it work?" phone calls; highest immediate business value
- Dynamic gallery from Supabase Storage `gallery_items` table — 12 hardcoded items can never be updated without a deploy; admin needs control
- Email/password login + "My quotes" list at `/mypage` with status labels — completes the customer experience loop

**Should have (differentiators):**
- HTML-branded email templates in Korean — plain-text receipts look like spam
- `Reply-To: customer_email` on admin notification emails — lets admin reply directly without copy-pasting
- ISR (revalidation every hour) on gallery page — static-site performance for infrequently-changing content
- Gallery category filter via URL search params — preserves existing discoverability without client-side-only state
- Status progress indicator (접수 → 검토 → 견적발송 → 생산 → 배송) — more premium than a single status label

**Defer to v2+:**
- "Track without account" magic link — high complexity, medium value; revisit if auth adoption is low
- Status change notification emails — requires `allpack-ops` to trigger outbound webhooks; coordinate separately
- Lightbox/fullscreen gallery viewer — useful but not blocking any business process
- Quote PDF attachment in receipt email — requires `@react-pdf/renderer`; significant added complexity
- Attach additional files to existing quote — customer workaround: submit new quote referencing old one

**Explicit anti-features (do not build):**
- In-app chat, online payment/cart, social OAuth, mobile push notifications, customer-editable quotes, public reviews, admin panel inside medal-site, real-time quote status polling

### Architecture Approach

The architecture follows a clear server/client split. Quote submission moves from a browser Supabase call to a Next.js Route Handler — this is the load-bearing change that enables server-side email dispatch, proper validation, and auth-linked submissions. Auth protection uses Next.js Middleware with `@supabase/ssr` to intercept `/mypage/*` routes. The gallery page becomes a Server Component (RSC) fetching from a new `gallery_items` table, replacing the hardcoded array. Two Supabase client factories replace the current single client: one for browser components, one for server contexts. All writes to `quotes` use the `site = 'medal-of-finisher'` filter to isolate records from `allpack-ops` activity.

**Major components:**
1. `src/app/api/quote/submit/route.ts` (new) — server-side quote insert + Nodemailer email dispatch; replaces browser-side Supabase insert
2. `src/lib/supabase/server.ts` (new) — `createServerClient` factory for Server Components and Route Handlers; uses cookie session from `next/headers`
3. `src/middleware.ts` (new) — protects `/mypage/*` routes; refreshes auth tokens on every request via `supabase.auth.getUser()`
4. `src/app/(auth)/login/page.tsx` (new) — email/password login using `supabase.auth.signInWithPassword()`
5. `src/app/mypage/page.tsx` (new) — RSC that fetches authenticated user's quotes via `customer_email = auth.email()` RLS policy
6. `src/app/gallery/page.tsx` (refactor) — remove `'use client'`, fetch `gallery_items` table server-side; pass data to client `GalleryGrid` for filter interaction
7. `src/lib/email.ts` (new) — Nodemailer SMTP wrapper; called from Route Handler after confirmed DB insert

### Critical Pitfalls

1. **RLS blocks the quote form's anon INSERT (current bug)** — Add an explicit `anon` INSERT policy on `quotes`: `WITH CHECK (site = 'medal-of-finisher')`. This is the immediate blocker before any other work.

2. **Mixing deprecated `auth-helpers-nextjs` with `@supabase/ssr`** — Migrate fully to `@supabase/ssr` before building any auth. Remove the old package entirely. The two have incompatible cookie handling; mixed usage causes random session loss.

3. **SMTP email blocking the form response on serverless (Vercel)** — SMTP over TLS adds 800ms–2000ms latency per call and can be killed mid-execution on serverless after `Response.json()` returns. Use `Promise.allSettled([insertRow(), sendEmail()])` — fire-and-forget. Never `await sendEmail()` before returning the HTTP response.

4. **Schema changes breaking `allpack-ops`** — All new columns on `quotes` (e.g., `customer_email`, `user_id`) must be `NULLABLE DEFAULT NULL`. A `NOT NULL` constraint on a column that `allpack-ops` doesn't send breaks admin quote creation. Document every migration in a shared `SCHEMA_CHANGELOG.md`.

5. **Customer quote attachments exposed via public Storage bucket** — `attachments` bucket is currently public; customer-uploaded files (logos, design files) are accessible via guessable URLs. Create a separate public `gallery` bucket for gallery images. Migrate `attachments` to private + signed URLs for admin access.

---

## Implications for Roadmap

Based on the dependency chain identified in architecture research, the build order is fixed by prerequisites, not preference.

### Phase 1: Fix Quote Form + Route Handler Migration

**Rationale:** The current "전송에 실패했습니다" error means every customer submission is silently lost right now. This is a P0 production bug. Additionally, moving the insert to a Route Handler is the foundation that Phase 2 (email) depends on — email must fire server-side after a confirmed DB insert, which requires the Route Handler to exist.

**Delivers:** A working quote form. Server-side quote insertion. `customer_email` column added to `quotes` (nullable, backward-compatible). Orphaned Storage file problem addressed.

**Addresses:** Quote form table stakes (FEATURES.md), RLS INSERT policy (Pitfall 2), orphaned files (Pitfall 11), `valid_until`/`desired_date` semantic audit (Pitfall 10)

**Avoids:** Doing email or auth work on a broken foundation

**Research flag:** None — RLS policy fix and Route Handler are well-documented patterns. No phase research needed.

### Phase 2: Email Notifications (Customer Receipt + Admin Alert)

**Rationale:** Highest immediate business value after a working form. Requires Phase 1's Route Handler. Reduces phone calls and gives customers confidence their quote was received. This phase is self-contained — it does not require Auth or mypage.

**Delivers:** Customer confirmation email (Korean, with quote reference and expected turnaround) and admin notification email (all form fields, Reply-To customer) sent via Google Workspace SMTP on every successful quote insert.

**Uses:** `nodemailer` + `@types/nodemailer`; 7 new server-only env vars (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, ADMIN_EMAIL); `src/lib/email.ts` wrapper

**Avoids:** SMTP blocking the serverless response (Pitfall 3), Google App Password misconfiguration (Pitfall 4), secrets in Edge Middleware (Pitfall 13)

**Research flag:** None — Nodemailer + Google Workspace SMTP is a well-established pattern. The fire-and-forget pattern and App Password requirement are documented in PITFALLS.md.

### Phase 3: Dynamic Gallery from Supabase Storage

**Rationale:** Gallery is independent of Auth and can proceed in parallel with Phase 4 if needed. However, it delivers visible business value (admin can finally update portfolio content) and is architecturally simpler than auth — making it a good candidate to complete before auth complexity. The `gallery_items` table and `gallery` Storage bucket must be created before this phase can proceed.

**Delivers:** Gallery page fetches from `gallery_items` DB table instead of hardcoded array. ISR revalidation (1-hour). Category filter via URL search params (RSC-compatible). `next/image` optimization with Supabase `remotePatterns`. Separation of `gallery` (public) and `attachments` (private) Storage buckets.

**Addresses:** Stale hardcoded gallery (FEATURES.md table stakes), gallery client-side fetch waterfall (Pitfall 9), public `attachments` bucket exposure (Pitfall 5), gallery auth gate on admin uploads (Pitfall 15)

**Avoids:** Client-side FOUC on gallery load, unauthorized gallery uploads

**Research flag:** None — Server Component + ISR + Supabase Storage public URL pattern is well-documented.

### Phase 4: Supabase Auth Migration + Customer Mypage

**Rationale:** This is the most complex phase and correctly comes last. It depends on `customer_email` column existing (Phase 1) and requires a clean `@supabase/ssr` migration before any auth code is written. The mypage provides the customer experience loop: submit quote → receive email confirmation → log in → see quote status.

**Delivers:** Full `@supabase/ssr` migration (removes deprecated `auth-helpers-nextjs`). Login and signup pages. Next.js Middleware protecting `/mypage/*`. Mypage showing authenticated customer's quotes with status labels. Korean-language Supabase Auth email templates. RLS policy for customers to read only their own quotes.

**Addresses:** Customer portal table stakes (FEATURES.md), historical quote linking strategy (Pitfall 7), server/client boundary for `cookies()` (Pitfall 8), Supabase Auth email templates in Korean (Pitfall 12), package migration (Pitfall 14)

**Avoids:** Mixing `auth-helpers` and `@supabase/ssr`, `getSession()` server-side (use `getUser()` only), admin users in `auth.users`, schema breakage in `allpack-ops`

**Research flag:** Consider a brief phase research pass on the `@supabase/ssr` migration if the Next.js 16.2.1 + React 19 combination has any known cookie handling edge cases not captured in training data. The version combination is recent enough that community documentation may be sparse.

### Phase Ordering Rationale

- Phase 1 is non-negotiable first: the bug blocks all other work.
- Phase 2 follows immediately: it uses Phase 1's Route Handler and delivers the highest business value per complexity unit.
- Phase 3 is independent but placed before Phase 4 to keep auth complexity isolated in one phase.
- Phase 4 is last because it introduces the most new infrastructure (middleware, auth client factories, RLS policies, login/signup pages) and depends on the schema additions from Phase 1.

The `site = 'medal-of-finisher'` column pattern provides safe isolation throughout — all new queries and RLS policies filter by this value, keeping medal-site data separated from `allpack-ops` data in the shared Supabase project.

### Research Flags

Phases needing deeper research during planning:
- **Phase 4:** Verify `@supabase/ssr` v0.6.x cookie handler compatibility with Next.js 16.2.1's `cookies()` API before writing auth code. The version combination is recent (Next.js 16 + React 19) and may have edge cases not in training data.

Phases with standard patterns (skip research-phase):
- **Phase 1:** Route Handler migration and RLS policy fix are standard Next.js + Supabase patterns, fully documented.
- **Phase 2:** Nodemailer + Google Workspace SMTP is a well-established pattern; PITFALLS.md covers all known edge cases.
- **Phase 3:** Supabase Storage public bucket + Server Component ISR is documented boilerplate.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Dependency delta is minimal (2 packages). Migration path from auth-helpers to @supabase/ssr is officially documented. Google Workspace SMTP App Password requirement is a known and verified policy. |
| Features | HIGH | Requirements derive directly from PROJECT.md and codebase analysis. B2C quote platform feature expectations are well-established. Anti-features are explicitly validated against project constraints. |
| Architecture | HIGH | Route Handler, RSC, Middleware, and dual Supabase client patterns are standard Next.js App Router architecture. RLS policy designs follow Supabase's published multi-tenant patterns. |
| Pitfalls | HIGH (codebase-verified) / MEDIUM (deployment) | Code-level pitfalls verified against actual source files. Serverless SMTP behavior and Vercel Edge Runtime variable scoping are from community consensus, not direct test. |

**Overall confidence:** HIGH

### Gaps to Address

- **Google Workspace SMTP App Password**: Requires the actual Workspace admin to generate an App Password before Phase 2 can be tested. This is an operational dependency, not a technical one — flag early so it doesn't block Phase 2 completion.

- **`valid_until` column semantics**: Must audit `allpack-ops` source before Phase 1 migration to confirm whether `valid_until` means "quote expiry" or is currently storing `desired_date`. If the meaning differs, a separate `desired_date` column is needed — this affects Phase 1 scope.

- **`gallery_items` table creation in Supabase**: Phase 3 depends on this table and the `gallery` Storage bucket existing and being seeded with the 12 current hardcoded gallery items. Coordinate with `allpack-ops` to seed the initial data before Phase 3 begins.

- **`@supabase/ssr` with Next.js 16.2.1**: Training data cutoff is August 2025; Next.js 16 is a recent release. Verify `cookies()` API compatibility in the `createServerClient` factory before Phase 4 auth code is written.

---

## Sources

### Primary (HIGH confidence)
- `/Users/william/medal-site/src/` — direct codebase inspection; quote form, gallery page, Supabase client, package.json
- `/Users/william/medal-site/.planning/PROJECT.md` — validated requirements and out-of-scope decisions
- `/Users/william/medal-site/.planning/codebase/CONCERNS.md` — known gaps and fragile areas
- `/Users/william/medal-site/.planning/codebase/INTEGRATIONS.md` — Supabase schema, bucket config, auth setup
- `/Users/william/medal-site/supabase/site-quotes-table.sql` — live quotes table schema and RLS policies

### Secondary (MEDIUM confidence)
- Training data: Supabase Auth migration guide (auth-helpers → @supabase/ssr), 2024 deprecation announcement
- Training data: Nodemailer v3.x API and Google Workspace SMTP App Password requirement
- Training data: Next.js App Router Server Components, Route Handlers, Middleware patterns
- Training data: Supabase RLS multi-tenant patterns (`site` column isolation, `auth.uid()` row-level filtering)
- Training data: Vercel serverless function behavior with outbound SMTP connections

### Tertiary (LOW confidence — validate before use)
- Nodemailer + Vercel serverless SMTP timing: community-reported; verify with actual Vercel function logs in Phase 2
- `@supabase/ssr` v0.6.x compatibility with Next.js 16.2.1: inferred from package timeline; run `npm info @supabase/ssr` and check peer deps before Phase 4

---
*Research completed: 2026-03-26*
*Ready for roadmap: yes*
