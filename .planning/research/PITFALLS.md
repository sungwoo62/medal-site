# Domain Pitfalls

**Domain:** Next.js + Supabase B2C quote platform — adding Auth, SMTP email, Storage gallery, shared DB
**Project:** Medal of Finisher
**Researched:** 2026-03-26
**Confidence:** HIGH (codebase-verified) / MEDIUM (official docs patterns, training data)

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or broken production features.

---

### Pitfall 1: Using `@supabase/auth-helpers-nextjs` for Server-Side Auth (DEPRECATED PACKAGE)

**What goes wrong:** The codebase already uses `@supabase/auth-helpers-nextjs` v0.15.0. When adding Supabase Auth for the customer mypage, developers copy this pattern to server components, API routes, and middleware. The auth-helpers package was deprecated in favor of `@supabase/ssr`. Cookies are not set correctly on the server, session tokens don't persist across requests, and users appear logged out on every navigation.

**Why it happens:** `createBrowserClient` from auth-helpers only works in the browser. For Next.js App Router, you need `createServerClient` (from `@supabase/ssr`) in Server Components, Route Handlers, and Middleware — each with different cookie handling. The existing `src/lib/supabase/client.ts` uses `createBrowserClient`, which is correct only for Client Components. Reusing this for any server-side auth check silently fails.

**Consequences:**
- Auth state is lost between page navigations (SSR sees no session)
- Protected routes are bypassable if you forget middleware
- Session tokens expire without refresh because middleware never calls `supabase.auth.getUser()` on every request

**Prevention:**
1. Install `@supabase/ssr` (replaces auth-helpers for server-side usage)
2. Create three separate client factories:
   - `src/lib/supabase/client.ts` — `createBrowserClient` for `'use client'` components (already exists)
   - `src/lib/supabase/server.ts` — `createServerClient` with `cookies()` from `next/headers` for Server Components and Route Handlers
   - `src/lib/supabase/middleware.ts` — `createServerClient` with `request/response` cookie adapter for `middleware.ts`
3. `middleware.ts` MUST call `supabase.auth.getUser()` on every request (not `getSession()`) to refresh tokens
4. Never use `getSession()` server-side — it does not validate the JWT, only reads from cookie storage

**Detection (warning signs):**
- Users are redirected to login after clicking links (session not persisted)
- Console shows auth errors in Server Components
- `supabase.auth.getUser()` returns null in Route Handlers

**Phase:** Supabase Auth / Mypage phase

---

### Pitfall 2: RLS Policies Block the Quote Form Insert (The Current Bug)

**What goes wrong:** The existing quote form is already broken ("전송에 실패했습니다"). The most likely cause is RLS (Row Level Security) on the `quotes` table configured for `allpack-ops` usage — where authenticated admins insert rows. The `medal-site` form submits as an anonymous (unauthenticated) user. If RLS requires `auth.uid() IS NOT NULL`, every anon insert is rejected silently with a 403.

**Why it happens:** When Supabase projects are set up via another app (allpack-ops), RLS policies default to blocking all access. The `anon` role may not have INSERT permission on `quotes`. This is a cross-app shared DB problem — what's correct for the admin app (authenticated writes) breaks the public-facing app (anonymous writes).

**Consequences:**
- Current quote form does not work at all
- Every customer submission is silently lost
- File is uploaded to Storage but the DB row is never created — orphaned files accumulate

**Prevention:**
1. In Supabase Dashboard → Authentication → Policies → `quotes` table: add an explicit INSERT policy for the `anon` role: `WITH CHECK (site = 'medal-of-finisher')`
2. Alternatively, use a Supabase Edge Function as an intermediary — the function uses the service role key and validates input before inserting
3. Verify the policy in Supabase's policy tester before deploying
4. Log `insertErr` details in development (not production) to see exact Postgres error codes

**Detection (warning signs):**
- `insertErr.code === '42501'` (insufficient privilege) or `'PGRST116'`
- File upload succeeds but no row appears in `quotes` table
- Error appears immediately (not after timeout) — network is fine but DB rejected

**Phase:** Quote Form Fix (immediate, before any new features)

---

### Pitfall 3: Email Sending in Next.js Route Handlers Blocks the Response and Fails on Serverless

**What goes wrong:** When adding SMTP email notifications (customer confirmation + admin alert) via Nodemailer with Google Workspace, developers call `transporter.sendMail()` inside the same API route that inserts the quote. On Vercel (serverless), the function execution is frozen after the response is sent. If `sendMail` is called after `res.json()` / `return Response.json()`, it is killed mid-execution. If called before, it adds 1-3 seconds latency to every form submission.

**Why it happens:** Google SMTP over TLS (port 587 with STARTTLS) requires a full TCP handshake + TLS negotiation before the first email is sent. In a serverless environment there is no persistent SMTP connection. Each invocation reconnects from scratch. This takes 800ms–2000ms.

**Consequences:**
- Quote form feels slow (2+ second response on submission)
- Emails randomly fail on Vercel because function times out before SMTP completes
- `transporter.verify()` hangs the function on cold start

**Prevention:**
1. Send email in a **fire-and-forget** pattern: `await Promise.allSettled([insertRow(), sendEmail()])` — don't block the user response on email success
2. Better: use Supabase Database Webhooks + a separate Edge Function to trigger email after row insert — completely decoupled from the form submission
3. For Google Workspace SMTP: use App Password (not main account password), port 587, `secure: false` with `requireTLS: true` in Nodemailer — common misconfiguration is using port 465 with `secure: true` which fails with Google's modern TLS requirements
4. Set `connectionTimeout` and `greetingTimeout` in Nodemailer to 5000ms to fail fast instead of hanging

**Detection (warning signs):**
- Form submission takes >2 seconds to respond
- Emails sent locally (dev) but not in production (Vercel)
- Vercel function logs show "Task timed out" without explicit error
- `Error: connect ETIMEDOUT` in logs — SMTP connection blocked by Vercel's outbound network (Vercel blocks port 25; ports 465 and 587 must be explicitly used)

**Phase:** Email Notification phase

---

### Pitfall 4: Google Workspace SMTP App Password vs OAuth2 Confusion

**What goes wrong:** Google deprecated "less secure app access" for Workspace accounts. Using a regular account password in Nodemailer `auth.pass` will fail with `535-5.7.8 Username and Password not accepted`. Developers spend hours debugging SMTP credentials thinking it is a Nodemailer or Next.js issue.

**Why it happens:** Google requires either an App Password (with 2FA enabled on the Workspace account) or OAuth2. App Passwords are the simpler path but require navigating Google Admin Console to enable them, then generating per-app passwords.

**Consequences:**
- Email sending works in initial testing (if using old credentials) then breaks when Google enforces the policy
- Misleading Nodemailer error messages that look like network issues

**Prevention:**
1. Enable 2-Step Verification on the sending Workspace account
2. Generate an App Password (Google Account → Security → App Passwords)
3. Store `EMAIL_APP_PASSWORD` in `.env.local` and Vercel environment variables — NEVER the main account password
4. In Nodemailer: `auth: { user: 'noreply@yourdomain.com', pass: process.env.EMAIL_APP_PASSWORD }`
5. Test SMTP connection with a standalone script before integrating into Next.js

**Detection (warning signs):**
- `535-5.7.8 Username and Password not accepted` in error logs
- Works with Gmail personal account but not with Workspace account
- SMTP connection succeeds (port open) but auth step fails

**Phase:** Email Notification phase

---

### Pitfall 5: Supabase Storage Public Bucket Exposes ALL Uploaded Files Permanently

**What goes wrong:** The `attachments` bucket is currently used for quote file uploads. When setting up the gallery, the natural path is to create another bucket (or reuse `attachments`) as a public bucket. Making a bucket public in Supabase means ALL objects — including quote attachments from customers — are publicly accessible via predictable URLs. Anyone with the URL pattern `[project-ref].supabase.co/storage/v1/object/public/attachments/quote-files/[timestamp].[ext]` can access customer files.

**Why it happens:** `getPublicUrl()` in the existing quote code already generates public URLs, which means `attachments` is already public. Gallery images will likely be put in the same bucket or a similarly public one. The problem is no separation of concerns between customer-uploaded sensitive files and admin-uploaded gallery images.

**Consequences:**
- Customer-submitted design files, logos, and potentially personal documents are publicly guessable
- GDPR/privacy violation risk (Korean PIPA equivalent — 개인정보 보호법)
- No way to revoke access to a specific file without deleting it

**Prevention:**
1. Create a separate `gallery` bucket for gallery images (public, admin-managed)
2. Keep `attachments` bucket as **private** — use signed URLs for admin access: `supabase.storage.from('attachments').createSignedUrl(path, 3600)`
3. Set RLS on the `attachments` bucket so only authenticated admins can read (the existing `allpack-ops` admin app reads these)
4. Migrate current `getPublicUrl()` in `quote/page.tsx` to store the path only in DB, generate signed URL when admin views the quote

**Detection (warning signs):**
- `attachments` bucket shows "Public" in Supabase Storage dashboard
- `getPublicUrl()` returns a URL without a token parameter
- Customer files accessible without any authentication header

**Phase:** Quote Form Fix + Storage Gallery phase

---

### Pitfall 6: Shared DB Schema Changes Break allpack-ops Without Coordination

**What goes wrong:** When adding Supabase Auth for the mypage, the natural next step is to add a `user_id` column to `quotes` to link quotes to customer accounts. Developers add this as `NOT NULL` or add a database trigger that fires on every insert. This silently breaks the `allpack-ops` admin app, which also inserts into `quotes` but does not send a `user_id` value.

**Why it happens:** Two apps share one Supabase project. Schema migrations from one app context are not validated against the other app's insert patterns. The allpack-ops admin may be inserting quotes manually without a `user_id`.

**Consequences:**
- `allpack-ops` quote creation breaks with `null value in column "user_id" violates not-null constraint`
- Triggers that fire email notifications may send duplicate emails if both apps trigger the same webhook

**Prevention:**
1. All new columns on `quotes` must be NULLABLE with a DEFAULT: `user_id UUID REFERENCES auth.users(id) DEFAULT NULL`
2. Run `INSERT` test queries that mimic the `allpack-ops` pattern before applying migrations
3. Maintain a shared `SCHEMA_CHANGELOG.md` accessible to both projects documenting every column added
4. Use the `site` column as a filter in all new triggers/webhooks to prevent cross-site double-firing: `WHERE NEW.site = 'medal-of-finisher'`
5. Test schema changes against the allpack-ops app before deploying

**Detection (warning signs):**
- `allpack-ops` throws constraint violation errors after a medal-site migration
- Admin-created quotes do not appear in medal-site customer portal (wrong `user_id` linkage)
- Email notifications fire twice (once from medal-site webhook, once from allpack-ops webhook)

**Phase:** Any migration phase — applies to Auth/Mypage phase especially

---

## Moderate Pitfalls

Mistakes that degrade quality, require fixes, or cause poor user experience.

---

### Pitfall 7: Quote-to-User Linking Strategy — Email Mismatch Problem

**What goes wrong:** When a customer registers for the mypage and wants to see their previous quotes, there's no link between historical anonymous quotes (submitted before registration) and the new auth account. The `quotes` table has `customer_phone` and a note field containing the email — no `user_id` FK. Retroactively matching "past quotes to new account" is non-trivial and error-prone.

**Prevention:**
1. When user registers, offer an optional "link previous quotes" flow: look up `quotes` by `customer_phone` or `contact_email` and set `user_id`
2. During registration, if the provided email matches a `note` field containing `이메일:` entries, auto-link those quotes
3. On the mypage, show both "linked quotes" (via `user_id`) and "find by phone" search as fallback

**Phase:** Supabase Auth / Mypage phase

---

### Pitfall 8: Next.js App Router and `cookies()` / `headers()` Must Not Be Called in Client Components

**What goes wrong:** When scaffolding server-side auth checks, developers import `cookies` from `next/headers` in a component that has `'use client'` at the top. This causes a build-time error that is confusing: `cookies() was called outside of a request scope`.

**Prevention:**
1. All Supabase server client creation (using `cookies()`) must be in Server Components, Route Handlers (`app/api/*/route.ts`), or `middleware.ts`
2. Client Components only use `createBrowserClient` and call `supabase.auth.getUser()` on the client
3. Pass user data as props from Server Components down to Client Components — do not re-fetch auth state in Client Components

**Phase:** Supabase Auth / Mypage phase

---

### Pitfall 9: Gallery Images Fetched Client-Side on Every Page Load

**What goes wrong:** When replacing the hardcoded gallery with dynamic Supabase Storage images, the obvious implementation fetches from Supabase Storage in a `useEffect` inside a Client Component. This means: no caching, FOUC (flash of unstyled content), waterfall loading, and every visitor re-requests the full gallery list from Supabase on every page load.

**Prevention:**
1. Fetch gallery data in a Server Component using `createServerClient` — the response is rendered on the server and cached
2. Use `export const revalidate = 3600` (ISR) in the gallery page — gallery content changes rarely, no need for real-time
3. Store gallery metadata (title, category, year, description, storage path) in a `gallery_items` Supabase table, not just as Storage bucket filenames
4. Use `next/image` with `remotePatterns` configured for `[project-ref].supabase.co` — not raw `<img>` tags — for automatic optimization and lazy loading

**Detection (warning signs):**
- Gallery shows empty for a moment then loads (FOUC)
- Supabase Storage API logs show hundreds of `list()` calls per hour
- LCP (Largest Contentful Paint) score drops after gallery migration

**Phase:** Storage Gallery phase

---

### Pitfall 10: `valid_until` Column Used as "Desired Delivery Date" — Semantic Mismatch

**What goes wrong:** The current `quote/page.tsx` maps `form.desired_date` to the `valid_until` column. In the allpack-ops admin context, `valid_until` almost certainly means "when the quote expires" (a business quote validity period), not "customer's desired delivery date". When the customer portal shows "valid until 2025-12-31" they will misread it as their delivery deadline. When the admin sees it, they will interpret it as quote expiry and may auto-archive active orders.

**Prevention:**
1. Before adding the mypage, audit the `quotes` table schema in `allpack-ops` to understand the intended meaning of `valid_until`
2. If semantics differ, add a `desired_date` column (NULLABLE) to the `quotes` table for medal-site's use case
3. Do not repurpose existing columns that have established meaning in the admin app

**Phase:** Quote Form Fix + Mypage phase

---

### Pitfall 11: No Atomic File+Row Operation — Orphaned Storage Files

**What goes wrong:** The current flow uploads the file first, then inserts the DB row. If the DB insert fails (RLS, network, constraint), the file stays in Storage permanently. Over time, orphaned files accumulate in the `attachments` bucket consuming quota and making it impossible to know which files are associated with valid quotes.

**Prevention:**
1. Store only the file path (not the full URL) in the DB — this allows identifying orphaned files by comparing Storage paths against DB rows
2. Implement a cleanup job (Supabase Edge Function via pg_cron or Vercel cron) to delete Storage files whose DB rows don't exist
3. Alternatively, insert the DB row first with a `pending` status and `file_url = null`, then upload the file and update the row — this keeps the source of truth in the DB
4. Wrap the insert + upload in a pattern where DB failure prevents Storage write, not the reverse

**Detection (warning signs):**
- Storage bucket shows more files than there are rows in `quotes`
- Storage usage grows even when form submission fails
- Files named with timestamps that have no corresponding `quotes` row

**Phase:** Quote Form Fix (immediate)

---

## Minor Pitfalls

---

### Pitfall 12: Supabase Auth Email Templates Are in English by Default

**What goes wrong:** Supabase Auth sends default confirmation, password reset, and magic link emails in English. Korean customers receive "Confirm your signup" emails with no branding. This destroys trust on a Korean-market site.

**Prevention:**
1. In Supabase Dashboard → Authentication → Email Templates: customize all templates in Korean
2. Add the brand name "Medal of Finisher" and domain logo to templates
3. Test all auth flows (signup confirmation, password reset) from a real email account before launch

**Phase:** Supabase Auth / Mypage phase

---

### Pitfall 13: Environment Variables Not Available in Edge Middleware

**What goes wrong:** `SMTP_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY` and similar secrets work in API Routes but fail in `middleware.ts` on Vercel because Edge Runtime has a different environment variable scope. Developers test locally (Node.js runtime) and it works; production Edge middleware cannot access the variables.

**Prevention:**
1. Middleware should only use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — these are safe to expose and work in Edge Runtime
2. Never call SMTP or service-role operations from middleware
3. Email sending and privileged DB operations always go in Route Handlers (`/app/api/*/route.ts`) running on Node.js runtime

**Phase:** All phases using secrets

---

### Pitfall 14: `@supabase/auth-helpers-nextjs` vs `@supabase/ssr` Package Confusion

**What goes wrong:** The codebase uses `auth-helpers-nextjs` v0.15.0. When adding auth, reading any recent Supabase tutorial will use `@supabase/ssr`. The two packages have different APIs and incompatible cookie handling. Mixing them in the same project causes session state inconsistencies.

**Prevention:**
1. Decide on one package at the start of the auth phase: migrate fully to `@supabase/ssr`
2. Remove `@supabase/auth-helpers-nextjs` from dependencies after migration
3. Update `src/lib/supabase/client.ts` to use `createBrowserClient` from `@supabase/ssr` instead of auth-helpers

**Phase:** Supabase Auth / Mypage phase (first task)

---

### Pitfall 15: Gallery Image Uploads Without Admin Auth Gate

**What goes wrong:** If the gallery `gallery_items` table and Storage bucket have INSERT policies that allow the `anon` role, anyone who reads the Supabase URL from the frontend JavaScript can upload arbitrary images to the gallery bucket. This is public defacement.

**Prevention:**
1. Gallery bucket RLS: INSERT allowed only for `authenticated` role where `auth.uid()` is an admin user
2. Admin upload workflow lives in `allpack-ops`, not in the public medal-site
3. If medal-site needs an admin upload route, protect it behind Supabase Auth middleware checking for admin role

**Phase:** Storage Gallery phase

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Quote Form Fix (immediate) | RLS blocking anon INSERT on `quotes` | Add explicit anon INSERT policy with `site = 'medal-of-finisher'` check |
| Quote Form Fix (immediate) | Orphaned Storage files on DB failure | Store path only; cleanup cron job |
| Storage Gallery | Client-side fetch waterfall for gallery images | Server Component + ISR revalidation |
| Storage Gallery | Customer attachments exposed via public bucket | Separate `gallery` bucket; keep `attachments` private |
| Storage Gallery | Raw `<img>` tags with Supabase URLs | Use `next/image` with `remotePatterns` configured |
| Email Notifications | SMTP latency blocking form response | Fire-and-forget or webhook-triggered email |
| Email Notifications | Google Workspace app password misconfiguration | App Password required; test standalone before integrating |
| Email Notifications | Serverless function killed before SMTP completes | Decouple via Supabase webhook + Edge Function |
| Supabase Auth | Deprecated auth-helpers for server-side | Migrate to `@supabase/ssr` before building auth |
| Supabase Auth | Session not refreshed — users log out randomly | Middleware must call `getUser()` on every request |
| Supabase Auth | English default email templates | Customize in Korean before launch |
| Mypage / Customer Portal | Historical quotes not linked to new accounts | Phone/email-based retroactive linking strategy |
| DB Schema Changes | `user_id` NOT NULL breaks allpack-ops inserts | All new columns NULLABLE with DEFAULT NULL |
| DB Schema Changes | `valid_until` semantics conflict with allpack-ops | Audit column meaning; add `desired_date` if needed |

---

## Sources

- Codebase analysis: `/Users/william/medal-site/src/` (HIGH confidence — direct code inspection)
- Codebase concerns: `.planning/codebase/CONCERNS.md` (HIGH confidence)
- Project requirements: `.planning/PROJECT.md` (HIGH confidence)
- Supabase Auth SSR patterns: training data on `@supabase/ssr` package migration (MEDIUM confidence — verified against known package deprecation timeline)
- Next.js App Router server/client boundary rules: training data on Next.js 13+ patterns (MEDIUM confidence)
- Google Workspace SMTP App Password requirement: well-documented Google policy change (MEDIUM confidence)
- Nodemailer + Vercel serverless behavior: known community pattern (MEDIUM confidence)
