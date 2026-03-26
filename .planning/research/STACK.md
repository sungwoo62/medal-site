# Technology Stack

**Project:** Medal of Finisher — milestone additions
**Researched:** 2026-03-26
**Scope:** Email notifications, Supabase Auth, dynamic gallery, customer portal (mypage)
**Existing stack:** Next.js 16.2.1 + React 19 + Tailwind CSS 4 + Supabase JS 2 + @supabase/auth-helpers-nextjs 0.15

---

## Critical Migration First: auth-helpers → @supabase/ssr

**This must happen before any Auth or mypage work.**

The existing stack uses `@supabase/auth-helpers-nextjs@0.15`, which is **deprecated**. Supabase's official replacement is `@supabase/ssr`. The auth-helpers package will not receive updates and lacks proper cookie-based session handling required for App Router SSR.

**Confidence:** HIGH — Supabase officially deprecated auth-helpers in 2024 and the @supabase/ssr package is the documented successor.

| Package | Status | Action |
|---------|--------|--------|
| `@supabase/auth-helpers-nextjs` | Deprecated | Remove |
| `@supabase/ssr` | Current | Install |

The migration is mechanical: replace `createBrowserClient` / `createServerClient` imports. The `@supabase/supabase-js@2` client stays.

---

## Recommended Stack (Additions Only)

### 1. Email: Nodemailer + Google Workspace SMTP

**Package:** `nodemailer` ~3.1.x
**Types:** `@types/nodemailer` ~6.4.x (devDependency)

**Why Nodemailer:**
- The definitive Node.js SMTP library. No other option is meaningfully competitive for SMTP-only transactional email.
- Works directly with Google Workspace SMTP relay (smtp.gmail.com:587 with STARTTLS, or smtp.gmail.com:465 with SSL).
- Google Workspace requires App Passwords (not account passwords) when 2FA is enabled — standard and well-documented.
- Runs in Next.js Route Handlers (App Router) or Server Actions — never in client components.

**Why NOT alternatives:**
- `@sendgrid/mail`, `resend`, `postmark` — third-party email services. The constraint is explicit: Google Workspace SMTP. Don't use these.
- `smtp.js` — browser-only shim, exposes credentials to client. Security risk.

**Integration point:** Next.js Route Handler (`/api/send-quote-email`) called from the Server Action that inserts the quote, or a separate webhook triggered by a Supabase database trigger. Route Handler is simpler and keeps everything in Next.js.

**Confidence:** HIGH (training data, stable library, no version churn)

---

### 2. Auth: @supabase/ssr + Next.js Middleware

**Package:** `@supabase/ssr` ~0.6.x

**Why @supabase/ssr:**
- Official Supabase package for server-side rendering frameworks including Next.js App Router.
- Handles cookie-based session persistence correctly across Server Components, Route Handlers, and Middleware.
- `createBrowserClient()` for client components, `createServerClient()` for server components and middleware.
- Required for route protection via `middleware.ts` — auth-helpers does not support this correctly in App Router.

**Auth strategy:**
- Supabase Auth with email/password (already constrained — no OAuth needed).
- `middleware.ts` at project root intercepts `/mypage/*` routes and redirects unauthenticated users to `/login`.
- Session refresh via `supabase.auth.getSession()` inside middleware keeps tokens alive.
- No additional auth library (next-auth, lucia, etc.) is needed — Supabase Auth handles the full flow.

**New environment variables required:**
- `SUPABASE_SERVICE_ROLE_KEY` — server-side only (never `NEXT_PUBLIC_`), for admin operations if needed
- Existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are reused

**Why NOT next-auth / better-auth:**
- Adds a separate user table and session store. The constraint is Supabase Auth. Don't layer another auth system.

**Confidence:** HIGH (official Supabase recommendation, well-documented migration path)

---

### 3. Gallery: Supabase Storage + Supabase DB (new table)

**No new packages required.** `@supabase/supabase-js@2` already handles Storage.

**Architecture:**
- New Supabase table: `gallery_items` — stores metadata (title, category, year, description, image_path, sort_order, is_active).
- Images stored in Supabase Storage, new bucket: `gallery` (public bucket, so `getPublicUrl()` works without auth).
- The existing `attachments` bucket is for quote files — keep them separate.
- Gallery page becomes a Server Component (remove `'use client'`), fetches rows from `gallery_items` on the server.
- Category filter becomes a client island or uses URL search params (no separate state library needed).

**Admin upload flow:**
- Managed in `allpack-ops` (the admin dashboard), not in this site. This site is read-only for gallery.
- If `allpack-ops` doesn't have gallery management yet, a simple admin route `/admin/gallery` behind service-role auth can be added to this project as a stopgap. Decision deferred to roadmap.

**Image optimization:**
- Use `next/image` with Supabase Storage URLs. Add the Supabase domain to `next.config.ts` `images.remotePatterns`.
- No additional image optimization library needed.

**Confidence:** HIGH (standard Supabase Storage pattern, no new dependencies)

---

### 4. Customer Portal (Mypage): Supabase Auth + RLS

**No new packages required** beyond `@supabase/ssr` already listed above.

**Architecture:**
- `/mypage` — protected route. Shows the authenticated customer's quotes.
- Customer login: `/login` — email/password form submitting to `supabase.auth.signInWithPassword()`.
- Customer signup: Not needed initially. Admin creates accounts, or customers self-register with email verification.
- Quote ownership: `quotes` table needs a `user_id` column (uuid, FK to `auth.users`). When a logged-in user submits a quote, their `auth.uid()` is stored. Anonymous quotes get `null`.
- RLS policy: `SELECT WHERE user_id = auth.uid()` — customers see only their own quotes.

**The shared-DB constraint is critical here:**
- Adding `user_id` to `quotes` must be backward-compatible with `allpack-ops`. The column should be nullable (existing rows get `null`). allpack-ops views all rows regardless of `user_id`.
- This is a non-breaking schema change.

**State management:** No external state library. React `useState` + Supabase client is sufficient for a simple mypage. If the quote list needs real-time updates, `supabase.channel()` can be added without a new library.

**Confidence:** HIGH (standard Supabase RLS pattern)

---

## Full Dependency Delta

```bash
# Install (additions to existing stack)
npm install @supabase/ssr nodemailer

# Remove (deprecated)
npm uninstall @supabase/auth-helpers-nextjs

# Dev dependencies
npm install -D @types/nodemailer
```

No other packages are required. React Query, Zustand, form libraries, email templating frameworks — none of these are needed for the scope defined.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Email | `nodemailer` + Google SMTP | `resend`, `sendgrid` | Constraint: Google Workspace SMTP only |
| Email | `nodemailer` + Google SMTP | Supabase Edge Functions | Adds complexity, overkill for SMTP relay |
| Auth | `@supabase/ssr` | `next-auth` | Constraint: Supabase Auth; two auth systems = conflict |
| Auth | `@supabase/ssr` | `@supabase/auth-helpers-nextjs` | Deprecated; no App Router SSR cookie support |
| Gallery | Supabase Storage + DB | Cloudinary, Uploadthing | Already have Supabase Storage (`attachments` bucket); no new infra |
| Gallery | `next/image` | Custom `<img>` with blur hash | Built-in optimization sufficient; blur hash adds a library |
| State | React `useState` | Zustand, Jotai | No cross-component state complexity at this scale |

---

## Environment Variables Delta

| Variable | Visibility | Purpose |
|----------|-----------|---------|
| `SMTP_HOST` | Server only | `smtp.gmail.com` |
| `SMTP_PORT` | Server only | `587` (STARTTLS) |
| `SMTP_USER` | Server only | Google Workspace email address |
| `SMTP_PASS` | Server only | Google Workspace App Password |
| `SMTP_FROM` | Server only | From address for outgoing emails |
| `ADMIN_EMAIL` | Server only | Where admin notification emails go |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin Supabase operations (if needed) |

All SMTP variables are server-only — never prefixed with `NEXT_PUBLIC_`. Exposing SMTP credentials to the browser would allow anyone to send email as the business domain.

---

## next.config.ts Changes Required

```typescript
// Add to next.config.ts for next/image to load from Supabase Storage
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}
```

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| auth-helpers deprecation | HIGH | Supabase officially announced, widely documented |
| @supabase/ssr as replacement | HIGH | Official Supabase recommendation, well-documented |
| Nodemailer for SMTP | HIGH | Stable library, no viable alternatives for SMTP-specific use case |
| Google Workspace SMTP config | MEDIUM | App Password requirement depends on account 2FA settings; verify with actual Google Workspace admin |
| Supabase Storage gallery pattern | HIGH | Standard pattern, no new dependencies |
| RLS for mypage quote isolation | HIGH | Standard Supabase auth.uid() pattern |
| No state management library needed | HIGH | Scope is simple CRUD + auth, no cross-component complexity |

---

## Sources

- Training data: Supabase Auth migration guide (auth-helpers → @supabase/ssr), 2024
- Training data: Nodemailer documentation, v3.x stable API
- Training data: Next.js App Router patterns for Server Actions and Route Handlers
- Training data: Google Workspace SMTP relay configuration
- Codebase inspection: `/Users/william/medal-site/package.json`, `src/lib/supabase/client.ts`, `src/app/quote/page.tsx`

Note: External verification tools (WebSearch, WebFetch, Context7, Brave Search) were unavailable during this research session. Version numbers are based on training data (cutoff August 2025). Verify `@supabase/ssr` and `nodemailer` current patch versions via `npm info` before installing.
