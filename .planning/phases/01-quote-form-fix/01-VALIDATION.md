---
phase: 1
slug: quote-form-fix
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-26
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (no test framework in project) |
| **Config file** | none |
| **Quick run command** | `npx next build` |
| **Full suite command** | `npx next build && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/quote` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx next build`
- **After every plan wave:** Verify build + Route Handler responds
- **Before `/gsd:verify-work`:** Full manual test of quote form submission
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | QUOTE-02, OPS-03 | build | `npx next build` | N/A | ⬜ pending |
| 01-02-01 | 02 | 1 | QUOTE-04 | build | `npx next build` | N/A | ⬜ pending |
| 01-02-02 | 02 | 1 | QUOTE-01 | manual | curl POST /api/quote | N/A | ⬜ pending |
| 01-03-01 | 03 | 2 | QUOTE-03, OPS-01, OPS-02 | manual | Supabase Dashboard check | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework setup needed — this phase is primarily a bug fix + architecture migration verified through build success and manual form submission.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Quote form submission succeeds | QUOTE-01 | Requires Supabase credentials and running dev server | Submit form on /quote page, verify success message |
| Data appears in quotes table | OPS-01, OPS-02 | Requires Supabase Dashboard access | Check Supabase table for new row with site='medal-of-finisher' |
| File upload works | QUOTE-05 | Requires Storage bucket configuration | Attach file in form, verify upload to attachments bucket |
| RLS policy allows anon insert | QUOTE-03 | Requires RLS policy applied in Supabase | Submit without auth, verify no 403/RLS error |
| allpack-ops can see medal-site quotes | OPS-01 | Cross-project verification | Open allpack-ops dashboard, verify medal-site quotes visible |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
