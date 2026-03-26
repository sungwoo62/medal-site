# Feature Landscape

**Domain:** B2C custom manufacturing quote platform (medal fabrication)
**Project:** Medal of Finisher
**Researched:** 2026-03-26
**Confidence:** HIGH (based on direct codebase analysis + established B2C quote site patterns)

---

## Scope of This Research

This document focuses on four feature areas identified in the active milestone:

1. Customer portal (mypage) with authentication
2. Quote tracking (status visibility for submitted quotes)
3. Email notifications (dual-direction: customer + admin)
4. Gallery management (dynamic images from Supabase Storage)

---

## Table Stakes

Features users expect. Missing = product feels incomplete or untrustworthy.

### Customer Portal

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Email + password sign-up / login | Customers need persistent identity to see "their" quotes | Low | Supabase Auth already wired in via auth-helpers |
| "My quotes" list page | Primary reason to create an account; without it, the portal is empty | Low-Medium | Query `quotes` WHERE `customer_email = auth.email()` via RLS |
| Quote detail view | Users need to see what they submitted (product type, quantity, note, file) | Low | Read existing columns from `quotes` table |
| Logout | Basic session control | Low | Single Supabase call |
| Redirect unauthenticated users | Attempting to visit `/mypage` while logged out must redirect to login | Low | Next.js middleware or page-level guard |
| Login-gated quote form link | After form submit, prompt "Create an account to track this quote" | Medium | Requires linking anonymous submit to user account post-auth |

### Quote Tracking

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Visible quote status label | "접수됨 / 검토중 / 견적 완료 / 생산중 / 완료" — customers check status compulsively after submitting | Low | Requires `status` column on `quotes` table (check allpack-ops schema) |
| Submission timestamp | "When did I send this?" is the first question | Low | `created_at` already exists via Supabase default |
| Quote reference number | Customers call in asking about "my order" — need something to say | Low | `id` (UUID) or a human-readable `quote_number` column |
| No pagination on ≤10 quotes | Most customers have 1-3 quotes; complex pagination creates friction | Low | Simple list; add pagination only when allpack-ops data shows need |

### Email Notifications

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Customer receipt email after form submit | Reassures customer their request was received; reduces "did it work?" phone calls | Medium | Next.js API Route → Nodemailer → Google Workspace SMTP |
| Admin alert email on new submission | Without this, admin relies entirely on checking allpack-ops dashboard manually | Medium | Same API Route, second recipient = admin address |
| Email contains: quote summary, reference number, expected response time | Without these, the email is just noise | Low | Populate from form data already in DB |
| Failure does not block form submission | Email send failure must never show as form failure to user | Medium | Fire-and-forget or async; decouple email from DB insert result |

### Gallery Management

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Images loaded from Supabase Storage (not hardcoded) | Current 12 hardcoded items can never be updated without a deploy | Medium | Requires `gallery_items` table or Storage bucket path convention |
| Category filter still works | Current filter by medal type is used for discovery | Low | Store `category` on DB record, filter client-side or via query |
| Admin can add/remove gallery items | Without CMS capability, gallery never grows; defeats the purpose | Medium-High | allpack-ops manages gallery records; medal-site reads them |
| Images displayed in responsive grid | Already implemented; must be preserved in dynamic version | Low | Replace hardcoded array with DB fetch, keep same JSX structure |

---

## Differentiators

Features that set the product apart. Not expected, but valued.

### Customer Portal

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| "Track without account" via email token | Reduces friction: customer clicks link in receipt email, sees status without creating password | High | Magic link / signed URL pointing to `/track?token=xxx`; requires token column on quotes |
| Attach additional files to existing quote | Customer forgot to attach design file on first submit; currently has to resubmit | Medium | Append to `attachments` in storage, reference from quote row |
| Quote history sorted by event date (not submit date) | Event planners care about "upcoming events" not "when I submitted" | Low | Sort by `valid_until` field already on the schema |

### Quote Tracking

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Status timeline / progress bar | Visual stages (접수 → 검토 → 견적발송 → 생산 → 배송) feel more premium than a single status label | Medium | Front-end only if status has ordered values |
| Status change notification email | Push, not pull — customer doesn't need to check the portal | Medium-High | Requires DB trigger or allpack-ops webhook on `status` column change |

### Email Notifications

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| HTML email template (branded) | Reflects Medal of Finisher brand; text-only emails look like spam | Medium | Inline CSS template; no third-party email service needed with SMTP |
| Reply-to set to customer email on admin alert | Admin can reply directly from email client without copy-pasting phone/email | Low | Set `Reply-To` header in Nodemailer config |
| Quote PDF attachment in receipt email | Customer has a record of exactly what they asked for | High | Requires PDF generation (e.g., @react-pdf/renderer); significant complexity |

### Gallery Management

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Lightbox / fullscreen image view | Medal manufacturing clients want to see detail; thumbnails are insufficient | Medium | Use a lightweight library (e.g., yet-another-react-lightbox) |
| Gallery item linked to "request similar" CTA | Reduces path from inspiration to quote form | Low | Pre-populate quote form `medal_type` from gallery item category |
| ISR (Incremental Static Regeneration) for gallery | Gallery changes are infrequent; ISR gives static performance with dynamic content | Low | `revalidate: 3600` on the gallery page fetch |

---

## Anti-Features

Features to deliberately NOT build. Avoids scope creep and complexity that adds no business value for this use case.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| In-app messaging / chat | Real-time chat requires infra (websockets or polling), moderation, history storage — all far beyond the value a medal manufacturer gets | Use phone + email; admin responds to receipt email via Reply-To |
| Online payment / cart | Business model is quote-based: price is not determined at submission time; forced checkout breaks trust | Stay quote-only; payment happens offline after negotiation |
| Social OAuth (Google, Kakao login) | Extra integration complexity; customer base is business event planners, not social media users; email/password is sufficient | Supabase email+password auth |
| Mobile push notifications | Requires service workers, FCM, user permission prompt — for a low-frequency B2B-leaning product, pushes annoy more than help | Email notifications cover the same need |
| Customer-editable quote after submission | Editing submitted quotes creates state management complexity and confuses allpack-ops workflow | If changes needed, customer submits a new quote and notes "supersedes #xxx" |
| Public customer reviews / ratings | Medal orders are B2B-leaning (event organizers); public reviews create moderation burden and rarely convert for niche manufacturing | Curated gallery cases are more credible than unmoderated reviews |
| Admin panel inside medal-site | Admin functionality belongs exclusively in allpack-ops; duplicating it here creates sync problems | Gallery management done in allpack-ops; medal-site reads only |
| Real-time quote status updates (polling/websockets) | Status changes 1-2 times over days/weeks; real-time is massive overkill | Page refresh or email notification is sufficient |
| Email verification on sign-up | Adds an extra step before the customer can track their quote; drops completion rate | Supabase allows disabling verification for low-risk portals; enable only if spam becomes a problem |

---

## Feature Dependencies

```
Supabase Auth (email login)
    └── Customer portal / mypage
        └── Quote list view
            └── Quote status label           ← requires `status` column in quotes table
            └── Quote reference number       ← requires id or quote_number column
        └── "Track without account" magic link  ← requires token column + API route

Quote form submits successfully (bug fix)
    └── All email notification features
    └── All quote tracking features

Gallery DB table / Storage bucket convention
    └── Dynamic gallery rendering
        └── ISR revalidation
        └── Lightbox view
        └── "Request similar" CTA

Email API Route (Nodemailer + SMTP)
    └── Customer receipt email
    └── Admin alert email
    └── Status change notification    ← also requires allpack-ops webhook/trigger
```

---

## MVP Recommendation

For this milestone, prioritize in this order:

1. **Fix quote form submission bug** — everything else is blocked until quotes actually save
2. **Customer receipt + admin alert emails** — highest immediate business value; reduces phone calls
3. **Dynamic gallery from Supabase Storage** — content is stale with hardcoded data; admin needs to manage this
4. **Mypage: email/password login + my quotes list + status label** — completes the customer experience loop

Defer:
- "Track without account" magic link — high complexity, Medium value; revisit if auth adoption is low
- Status change notification emails — requires allpack-ops to trigger outbound webhooks; coordinate separately
- HTML email template branding — nice to have; plain-text receipt is functional
- Lightbox gallery viewer — useful but not blocking any business process
- Quote PDF attachment — High complexity; Low urgency

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Customer portal feature expectations | HIGH | Standard B2C portal pattern; Supabase Auth SDK already integrated |
| Quote tracking requirements | HIGH | `status`, `created_at`, `id` columns either exist or are trivially added |
| Email notification behavior | HIGH | Nodemailer + SMTP is well-established; failure-isolation is the only non-obvious requirement |
| Gallery management scope | HIGH | allpack-ops owns writes; medal-site owns reads — clear boundary from PROJECT.md |
| Anti-features list | HIGH | Scope exclusions are explicitly validated in PROJECT.md Out of Scope section |

---

## Sources

- `/Users/william/medal-site/.planning/PROJECT.md` — validated requirements, out-of-scope decisions, constraints
- `/Users/william/medal-site/.planning/codebase/ARCHITECTURE.md` — data flow, existing form submission logic
- `/Users/william/medal-site/.planning/codebase/INTEGRATIONS.md` — Supabase schema, bucket config, auth setup
- `/Users/william/medal-site/.planning/codebase/CONCERNS.md` — known gaps, fragile areas, missing features audit
- `/Users/william/medal-site/supabase/site-quotes-table.sql` — live schema for `quotes` table + RLS policies
- Knowledge: B2C quote platform UX patterns (B2B-leaning manufacturing, status tracking, email receipt conventions) — MEDIUM confidence where no official docs apply; corroborated by codebase decisions
