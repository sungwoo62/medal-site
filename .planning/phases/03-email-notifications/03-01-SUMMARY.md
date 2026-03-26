---
phase: 03-email-notifications
plan: 01
subsystem: email
tags: [nodemailer, smtp, google-workspace, email-notifications]
dependency_graph:
  requires: []
  provides: [email-notification-on-quote-submit]
  affects: [src/app/api/quote/route.ts]
tech_stack:
  added: [nodemailer@8.0.4, "@types/nodemailer@7.0.11"]
  patterns: [SMTP transporter factory, Promise.allSettled for fire-and-forget]
key_files:
  created: [src/lib/email.ts]
  modified: [src/app/api/quote/route.ts, package.json, package-lock.json]
decisions:
  - "Return null (not throw) from createTransporter when SMTP env vars missing — enables graceful degradation (EMAIL-05)"
  - "Promise.allSettled used in route handler — ensures both emails attempted and neither failure blocks 200 OK response"
  - "sendCustomerConfirmation skips silently if contactEmail is null/empty — avoids sending to no-reply scenarios"
metrics:
  duration: "2 minutes"
  completed: "2026-03-26T08:13:14Z"
  tasks_completed: 2
  files_changed: 4
---

# Phase 03 Plan 01: Email Notifications Summary

**One-liner:** nodemailer SMTP module with Korean HTML templates wired into /api/quote via Promise.allSettled for non-blocking customer confirmation + admin notification emails

## What Was Built

Added automatic email notifications to the quote submission flow. When a customer submits a quote form:

1. A confirmation email is sent to the customer (if `contact_email` provided) with a Korean HTML summary of their quote details.
2. A notification email is sent to `hello@medaloffinisher.com` with the full quote including contact info and any notes.

Both emails use Google Workspace SMTP (`smtp.gmail.com:465`, SSL) via nodemailer. If SMTP credentials (`SMTP_USER`/`SMTP_PASS`) are not configured, the system degrades gracefully — emails are skipped with a `console.warn`, and quote submission still returns `200 OK`.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install nodemailer and create email utility module | 715dade | src/lib/email.ts, package.json, package-lock.json |
| 2 | Integrate email sending into quote Route Handler | 0e178dd | src/app/api/quote/route.ts |

## Decisions Made

1. **Null transporter for missing env vars** — `createTransporter()` returns `null` instead of throwing when `SMTP_USER`/`SMTP_PASS` are absent. Both send functions check for null and skip with `console.warn`. This enables the site to run in development/staging without SMTP configured.

2. **Promise.allSettled in route handler** — Both email functions are called concurrently with `Promise.allSettled`. This means: (a) both run in parallel, (b) neither failure blocks the other, (c) the `{ ok: true }` response is always returned after both settle. This satisfies EMAIL-05 requirement.

3. **Try/catch inside send functions, not in route handler** — Error isolation is at the email function level, not the route. Each function logs with `console.error` on failure but never re-throws. The route handler doesn't need to know about email failures.

## Deviations from Plan

None — plan executed exactly as written.

## Requirements Coverage

- EMAIL-01: Customer receives confirmation email after quote submission
- EMAIL-02: Admin (hello@medaloffinisher.com) receives notification email after quote submission
- EMAIL-03: Email content includes event name, medal type, quantity, contact info, desired date, note
- EMAIL-04: Google Workspace SMTP (smtp.gmail.com:465) configured via SMTP_USER/SMTP_PASS env vars
- EMAIL-05: Email failures never propagate — form submission returns 200 OK regardless of email status

## Known Stubs

None. Both email functions produce real HTML email bodies. No placeholder text or hardcoded empty values that would prevent plan goals.

## Setup Required

Before emails will actually send in production, the following env vars must be set:

```
SMTP_USER=hello@medaloffinisher.com
SMTP_PASS=<Google Workspace App Password>
```

Steps to generate App Password:
1. Enable 2-Step Verification on `hello@medaloffinisher.com`
2. Google Account > Security > 2-Step Verification > App passwords
3. Generate for "Mail"
4. Set as `SMTP_PASS` in production environment

## Self-Check: PASSED

All created files confirmed present. Both task commits (715dade, 0e178dd) confirmed in git history.
