---
phase: 01-quote-form-fix
plan: 02
subsystem: ui
tags: [next-js, supabase, fetch, form, route-handler]

# Dependency graph
requires:
  - phase: 01-01
    provides: POST /api/quote Route Handler (server-side Supabase insert with service role key)
provides:
  - Updated quote form client that POSTs JSON to /api/quote instead of direct Supabase insert
  - contact_email sent as dedicated JSON field (not packed into note)
  - File upload preserved client-side via Supabase Storage (anon key still used for attachments)
affects:
  - Phase 3 (email — form now uses Route Handler which is the extension point)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - fetch POST to internal Route Handler from 'use client' component
    - Conditional createClient() inside if(file) block (Storage-only, not for DB writes)

key-files:
  created: []
  modified:
    - src/app/quote/page.tsx

key-decisions:
  - "createClient() moved inside if(file) block — anon client only needed for Storage upload, not DB insert"
  - "contact_email sent as separate JSON field — Route Handler stores it in dedicated column (D-04 compliant)"
  - "noteParts email-packing removed — eliminates data leakage into note field"

patterns-established:
  - "Form fetch pattern: fetch('/api/quote', { method: 'POST', headers: { Content-Type: application/json }, body: JSON.stringify({...form, file_url, file_name}) })"

requirements-completed: [QUOTE-01, QUOTE-05, OPS-02]

# Metrics
duration: 5min
completed: 2026-03-26
---

# Phase 01 Plan 02: Quote Form Client Update

**Quote form now POSTs JSON to /api/quote Route Handler instead of direct Supabase insert, eliminating the RLS-blocked "전송 실패" bug**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-26T05:50:00Z
- **Completed:** 2026-03-26T05:55:00Z
- **Tasks:** 1 of 2 complete (Task 2 is human-verify checkpoint — pending)
- **Files modified:** 1

## Accomplishments

- Replaced direct `supabase.from('quotes').insert` with `fetch('/api/quote', { method: 'POST' })` in handleSubmit
- Removed `noteParts` email-packing logic — `contact_email` now flows as its own JSON field to the Route Handler's dedicated column
- Moved `createClient()` inside `if (file)` block — anon browser client only used for Storage uploads, never for DB writes
- Build passes cleanly: `/api/quote` shows as `ƒ (Dynamic)` server route, `/quote` remains `○ (Static)`

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace handleSubmit with Route Handler fetch** - `82c9b5d` (feat)
2. **Task 2: Smoke test quote form submission** - PENDING (checkpoint:human-verify)

**Plan metadata:** (see final commit below)

## Files Created/Modified

- `src/app/quote/page.tsx` - handleSubmit rewritten to fetch /api/quote; noteParts removed; createClient moved inside if(file) block

## Decisions Made

- Moved `createClient()` inside `if (file)` block — keeps the anon Supabase client isolated to Storage-only usage, making it clear the DB insert path no longer uses client-side Supabase

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

Worktree branch `worktree-agent-a7a6c54d` was behind `main` (Plan 01 commits were on main but not in the worktree). Ran `git merge main` to fast-forward before executing. This is a parallel execution artifact, not a code issue.

## User Setup Required

Same as Plan 01 — no new setup added in this plan.

**Before end-to-end testing works, the following must be done (from Plan 01):**

1. Add `SUPABASE_SERVICE_ROLE_KEY=your_key` to `.env.local`
2. Run SQL migration in Supabase Dashboard > SQL Editor (contents of `supabase/site-quotes-table.sql`)
3. Verify `attachments` Storage bucket allows anon uploads

## Next Phase Readiness

- Quote form fix is code-complete — awaiting human smoke test (Task 2 checkpoint)
- Once smoke test passes, Phase 01 is fully complete
- Phase 3 (email notifications) can begin — Route Handler at /api/quote is the extension point

---

## Known Stubs

None — form wires real data end-to-end via Route Handler.

---
*Phase: 01-quote-form-fix*
*Completed: 2026-03-26*
