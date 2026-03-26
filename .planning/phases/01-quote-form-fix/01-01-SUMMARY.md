---
phase: 01-quote-form-fix
plan: 01
subsystem: api
tags: [supabase, route-handler, next-js, postgresql, server-side]

# Dependency graph
requires: []
provides:
  - Server-side Supabase client factory using service role key (src/lib/supabase/server.ts)
  - POST /api/quote Route Handler for server-side quote form submission
  - SQL migration adding contact_email nullable column to quotes table
affects:
  - 01-02 (quote form client-side update to call /api/quote instead of direct Supabase insert)
  - Phase 3 (email notification — Route Handler is the extension point)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server-side Supabase client via service role key (src/lib/supabase/server.ts)
    - Next.js App Router Route Handler pattern for API endpoints (src/app/api/quote/route.ts)
    - Env var startup guard (throw Error if SUPABASE_SERVICE_ROLE_KEY not set)

key-files:
  created:
    - supabase/site-quotes-table.sql (updated — added contact_email column)
    - src/lib/supabase/server.ts
    - src/app/api/quote/route.ts
  modified:
    - supabase/site-quotes-table.sql

key-decisions:
  - "Use service role key in Route Handler to bypass RLS — server-side only, not exposed to client"
  - "contact_email stored as dedicated column (not packed into note field) for allpack-ops compatibility"
  - "site hardcoded to 'medal-of-finisher' on every insert for multi-tenant DB separation"
  - "Route Handler is the Phase 3 extension point for email notifications"

patterns-established:
  - "Server client pattern: createServerClient() in src/lib/supabase/server.ts — no use client, uses SUPABASE_SERVICE_ROLE_KEY"
  - "Route Handler pattern: NextRequest/NextResponse, validate required fields first, return typed JSON errors"

requirements-completed: [QUOTE-01, QUOTE-02, QUOTE-03, QUOTE-04, OPS-01, OPS-02, OPS-03]

# Metrics
duration: 2min
completed: 2026-03-26
---

# Phase 01 Plan 01: Server Infrastructure for Quote Submission

**Server-side Route Handler at POST /api/quote using Supabase service role key, with contact_email column migration for allpack-ops schema alignment**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-26T05:47:20Z
- **Completed:** 2026-03-26T05:48:52Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created SQL migration with contact_email nullable column (OPS-03 backward-compatible with allpack-ops)
- Created src/lib/supabase/server.ts — server-side client factory with SUPABASE_SERVICE_ROLE_KEY guard
- Created POST /api/quote Route Handler that validates fields, inserts to quotes table with full allpack-ops schema, and returns typed JSON responses

## Task Commits

Each task was committed atomically:

1. **Task 1: Update SQL migration and create server Supabase client** - `e9ef69a` (feat)
2. **Task 2: Create Route Handler for quote submission** - `5d354bc` (feat)

**Plan metadata:** (see final commit below)

## Files Created/Modified

- `supabase/site-quotes-table.sql` - Added contact_email nullable TEXT column via `alter table ... add column if not exists`
- `src/lib/supabase/server.ts` - Server-side Supabase client factory using SUPABASE_SERVICE_ROLE_KEY, with startup guard
- `src/app/api/quote/route.ts` - POST Route Handler: validates required fields, maps form→quotes schema, returns 400/500/200

## Decisions Made

- Used service role key (not anon key) in Route Handler — server-side code bypasses RLS entirely, eliminating the client-side RLS block that caused "전송 실패"
- contact_email stored as its own column per D-04 (not packed into note field as the original client-side code did)
- status field intentionally omitted from insert — allpack-ops manages status via its own defaults (D-09)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. Build passed cleanly on first attempt with TypeScript strict mode.

## User Setup Required

**External services require manual configuration before this Route Handler works end-to-end:**

1. **Add to `.env.local`:**
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
   Source: Supabase Dashboard → Settings → API → service_role (secret)

2. **Run SQL migration in Supabase Dashboard → SQL Editor:**
   Paste contents of `supabase/site-quotes-table.sql`

3. **Verify Storage bucket** — Supabase Dashboard → Storage → attachments → Policies → confirm anon uploads allowed

## Next Phase Readiness

- Route Handler ready at POST /api/quote — plan 01-02 updates the client quote form to fetch this endpoint instead of direct Supabase insert
- contact_email column migration ready to run in Supabase Dashboard
- Phase 3 email extension point established in route.ts

---
*Phase: 01-quote-form-fix*
*Completed: 2026-03-26*
