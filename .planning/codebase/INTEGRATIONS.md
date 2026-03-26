# External Integrations

**Analysis Date:** 2026-03-26

## APIs & External Services

**Supabase (Backend-as-a-Service):**
- PostgreSQL database with quotes management
- File storage for quote attachments
- Authentication foundation (via auth-helpers-nextjs)
  - SDK: `@supabase/supabase-js` 2.100.0
  - Auth helper: `@supabase/auth-helpers-nextjs` 0.15.0
  - Client factory: `src/lib/supabase/client.ts`

## Data Storage

**Databases:**
- Supabase PostgreSQL
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` environment variable
  - Client: `@supabase/supabase-js` (JavaScript SDK)
  - Schema location: `supabase/site-quotes-table.sql`
  - Table: `quotes` - Stores medal quote requests with site filter
    - Shared with allpack-ops project (distinguished by `site` column = 'medal-of-finisher')
    - Columns: product_name, customer_name, customer_phone, quantity, valid_until, note, file_url, file_name, site
    - RLS Policy: Anonymous users can INSERT (for public quote form)

**File Storage:**
- Supabase Storage
  - Bucket name: `attachments`
  - Usage: Quote form file uploads
  - Upload path pattern: `quote-files/{timestamp}.{extension}`
  - Access: Public URLs generated after upload
  - Configuration: `NEXT_PUBLIC_SUPABASE_ANON_KEY` for anonymous uploads

## Authentication & Identity

**Auth Provider:**
- Supabase (configured but not actively used in current implementation)
  - Implementation: `@supabase/auth-helpers-nextjs` provides SSR/client helpers
  - Client initialized via: `createBrowserClient()` in `src/lib/supabase/client.ts`
  - Current usage: Quote form accepts anonymous submissions (no auth required)

## Monitoring & Observability

**Error Tracking:**
- None detected - errors handled locally in quote form

**Logs:**
- None detected - uses default Next.js logging

## CI/CD & Deployment

**Hosting:**
- Not specified in codebase (deployment target undefined)

**CI Pipeline:**
- None detected - no CI config files present

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (e.g., https://[project].supabase.co)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public/anonymous key for browser access

**Secrets location:**
- `.env.local` file (gitignored, local development only)
- Production: Environment variables must be set via deployment platform

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected (quote submissions are one-way: form → Supabase database)

## Data Flow: Quote Submission

1. User fills quote form in `src/app/quote/page.tsx`
2. Optional file attachment uploaded to Supabase Storage (`attachments` bucket)
3. Quote metadata inserted into Supabase PostgreSQL `quotes` table with:
   - Form data (event_name, medal_type, quantity, contact info)
   - File reference (file_url, file_name) if provided
   - Site identifier: `'medal-of-finisher'` for filtering
4. Success message displayed to user
5. No automation/webhooks - quotes remain in database for manual review

---

*Integration audit: 2026-03-26*
