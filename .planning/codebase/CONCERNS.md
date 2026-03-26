# Codebase Concerns

**Analysis Date:** 2026-03-26

## Security Considerations

**Exposed Public Anon Keys in .env.local:**
- Risk: Supabase public anon keys are hardcoded in .env.local with no encryption. These keys are being tracked in git history and are exposed to anyone with repository access.
- Files: `.env.local`
- Current mitigation: Keys marked as "public" in variable naming, but still stored in plaintext version control
- Recommendations:
  - Remove .env.local from git history (use `git filter-branch` or BFK tool if already committed)
  - Add .env.local to .gitignore
  - Use environment variable injection at build/deployment time
  - Rotate exposed Supabase keys immediately
  - Consider using Supabase RLS (Row Level Security) policies for additional protection

**File Upload Without Validation:**
- Risk: `src/app/quote/page.tsx` accepts file uploads without size limits, type validation, or virus scanning
- Files: `src/app/quote/page.tsx` (lines 151-152)
- Current mitigation: None
- Recommendations:
  - Add file type whitelist (e.g., only PDFs, images)
  - Implement file size limit (e.g., max 10MB)
  - Add client-side validation before upload
  - Implement server-side validation in Supabase storage rules
  - Consider antivirus/malware scanning for uploaded files

**Error Messages Exposed to Frontend:**
- Risk: Supabase errors may expose database structure or sensitive information to client-side users
- Files: `src/app/quote/page.tsx` (lines 55-80)
- Current mitigation: Generic error message shown ("전송에 실패했습니다")
- Recommendations:
  - Never log raw Supabase error details to console in production
  - Implement structured error logging on backend
  - Return only safe, generic error messages to frontend

## Tech Debt

**Hardcoded Contact Information:**
- Issue: Phone number, email, and address are hardcoded in multiple components
- Files: `src/components/Footer.tsx` (lines 45-54)
- Impact: Changing contact info requires code changes and redeploy; no single source of truth
- Fix approach:
  - Create `src/lib/config.ts` with contact information
  - Export as constants and use throughout app
  - Or fetch from environment variables/CMS

**Magic Numbers and Inline Styling:**
- Issue: Responsive breakpoints, animation delays, and color values scattered throughout code
- Files: `src/app/globals.css` (lines 59-62), multiple page components (inline className strings)
- Impact: Difficult to maintain consistent theming; future redesigns require changes in 20+ places
- Fix approach:
  - Extract all animation delays to CSS custom properties
  - Centralize breakpoint definitions
  - Use Tailwind's CSS variables for theme consistency

**Unstructured Data Constants:**
- Issue: Product categories, gallery items, and process steps are inline arrays with no schema validation
- Files: `src/app/page.tsx` (lines 4-70), `src/app/gallery/page.tsx` (lines 8-28), `src/app/process/page.tsx` (lines 3-24)
- Impact: Type safety issues; duplicated data structure definitions; gallery/process pages maintain separate copies of category definitions
- Fix approach:
  - Create `src/lib/types.ts` with shared types (Product, GalleryItem, ProcessStep)
  - Create `src/lib/data.ts` with single source of truth for all content
  - Use schema validation (Zod/Yup) for content structure

**MEDAL_TYPES Duplication:**
- Issue: MEDAL_TYPES array defined in quote form (`src/app/quote/page.tsx` line 7) but category list differs in other pages
- Files: `src/app/quote/page.tsx` (line 7), `src/app/gallery/page.tsx` (line 6), `src/app/page.tsx` (line 11)
- Impact: Inconsistent medal type naming across pages; future updates require changes in multiple locations
- Fix approach: Create shared `src/lib/constants.ts` with all product/category definitions

## Missing Critical Features

**No Form Validation:**
- What's missing: Client-side validation for email, phone format, quantity constraints
- Files: `src/app/quote/page.tsx` (lines 43-46)
- Blocks: Users can submit invalid data; form shows only basic "required" check for 3 fields
- Solution: Add zod/yup validation library with form library integration (React Hook Form)

**No Loading State Management:**
- What's missing: Proper loading state feedback beyond button disabled state
- Files: `src/app/quote/page.tsx` (lines 34, 47-78)
- Blocks: Users unaware of file upload progress; network delays cause confusion
- Solution: Add progress indicators for file upload; separate upload state from form submission state

**No Error Recovery or Retry:**
- What's missing: When quote submission fails, no way to retry without refilling entire form
- Files: `src/app/quote/page.tsx` (line 80)
- Blocks: Failed submissions are permanent data loss; poor user experience
- Solution: Keep form data on error; offer retry button without clearing fields

**No File Upload Feedback:**
- What's missing: Users don't see if file upload succeeded; only final form submission result shown
- Files: `src/app/quote/page.tsx` (lines 52-61)
- Blocks: Users unaware of upload status; can't tell if attachment was processed
- Solution: Add file upload success indicator; show file size confirmation

**No Analytics or Tracking:**
- What's missing: No way to track form submissions, page views, or user behavior
- Impact: No data on which categories are popular; can't optimize conversion funnel
- Solution: Add analytics library (Google Analytics, Mixpanel, or similar)

## Test Coverage Gaps

**No Tests Exist:**
- What's not tested: All form handling logic, Supabase integration, file upload flow
- Files: All files under `src/` (no .test.tsx or .spec.tsx files found)
- Risk: Regressions undetected; form submission bugs reach production; silent Supabase failures
- Priority: High

**Untested Critical Paths:**
1. Quote form submission with/without file attachment
2. File upload to Supabase storage
3. Data insertion to Supabase quotes table
4. Error handling for failed uploads
5. Form validation edge cases (empty strings, special characters)
6. Responsive design on mobile/tablet

Recommended: Add Jest + React Testing Library configuration and write tests for:
- QuotePage component form submission
- File upload error handling
- Error message display
- Form reset after submission

## Performance Bottlenecks

**No Image Optimization:**
- Problem: Hero background image loaded without optimization; gallery items show placeholder colors instead of actual images
- Files: `src/app/page.tsx` (line 85), `src/app/gallery/page.tsx` (lines 67-69)
- Cause: Using bare `<div>` with background-image instead of Next.js Image component
- Improvement path:
  - Use Next.js `<Image>` component for optimized delivery
  - Implement proper image hosting (Supabase storage or CDN)
  - Add lazy loading for gallery items

**No Caching Headers:**
- Problem: No HTTP caching directives; every page request re-renders
- Cause: No `next.config.ts` optimization; bare minimal configuration
- Improvement path:
  - Add revalidation strategy in next.config.ts
  - Implement Incremental Static Regeneration (ISR) for gallery/process pages
  - Set appropriate Cache-Control headers for static assets

**Scroll Reveal on Every Page Load:**
- Problem: IntersectionObserver queries all `.reveal` elements on every page load
- Files: `src/components/ScrollReveal.tsx` (line 18)
- Cause: No memoization; runs on all components regardless of visibility
- Improvement path: Memoize observer callback; consider using Framer Motion for complex scroll animations

## Fragile Areas

**Quote Form Submission Logic:**
- Files: `src/app/quote/page.tsx` (lines 40-84)
- Why fragile:
  - No validation of form state before upload attempt
  - File upload errors don't prevent form submission
  - No transaction/rollback if insertion fails after file upload succeeds
  - Hardcoded Supabase table/column names with no type safety
- Safe modification:
  - Extract form submission to custom hook with clear error states
  - Add integration tests before refactoring
  - Use Supabase RPC or transactions for atomic operations

**Supabase Client Initialization:**
- Files: `src/lib/supabase/client.ts`
- Why fragile:
  - No error handling if env vars missing (will throw at runtime)
  - Using auth-helpers which may deprecate/change
  - No client-side authentication state management
- Safe modification:
  - Add validation/fallback for missing env vars
  - Document expected Supabase project structure
  - Consider migration path if auth-helpers changes

**Responsive Design Classes:**
- Files: All page components (heavy reliance on `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` patterns)
- Why fragile:
  - Breakpoint values scattered; future changes require multiple edits
  - No component abstraction for responsive grids
  - Hard to test responsive behavior without manual testing
- Safe modification:
  - Extract responsive grid patterns to reusable components
  - Centralize breakpoint values
  - Add responsive design tests with testing-library

## Dependencies at Risk

**Outdated TypeScript Version:**
- Risk: TypeScript 6.0.2 is very recent (cutting edge); may have bugs; limited community feedback
- Files: `package.json` (line 27)
- Impact: Type safety features unstable; documentation lag; community libraries may not support yet
- Migration plan:
  - Monitor TypeScript releases for 6.1.x patch versions
  - Pin version to known-stable minor version (currently 6.0.x)
  - Test thoroughly after TypeScript upgrades

**Potential Supabase Auth Migration:**
- Risk: `@supabase/auth-helpers-nextjs` (v0.15.0) is older; newer versions may have breaking changes
- Files: `src/lib/supabase/client.ts`, `package.json` (line 15)
- Impact: If supabase deprecates helpers, authentication breaks; form submission may fail
- Migration plan:
  - Currently only using storage; not authentication-dependent
  - Monitor Supabase release notes
  - Prepare fallback to direct `@supabase/supabase-js` if helpers deprecated

**Unsecured File Storage:**
- Risk: Supabase storage bucket policies not documented; may allow unauthorized access
- Files: `src/app/quote/page.tsx` (lines 55-61)
- Impact: Uploaded files may be publicly accessible or non-deletable; storage quota issues
- Recommendations:
  - Define RLS policies for `attachments` bucket in Supabase
  - Set retention/cleanup policies for old uploads
  - Document bucket access rules

## Scaling Limits

**No Database Indexes:**
- Current capacity: Supports small volume of quote submissions (100s-1000s)
- Limit: When quotes exceed 10,000+, sequential scans on `quotes` table will be slow
- Scaling path:
  - Add indexes on `created_at`, `site`, `customer_phone` in Supabase
  - Implement pagination in admin dashboard
  - Add database connection pooling if building admin panel

**Storage Quota:**
- Current capacity: Supabase free tier has upload limits
- Limit: If receiving 100+ daily submissions with attachments, storage quota exhausted in weeks
- Scaling path:
  - Monitor Supabase storage usage dashboard
  - Implement file cleanup for old submissions (30+ day retention)
  - Consider AWS S3 for large-scale file storage
  - Set max upload size limit before quota issues

**No Admin Interface:**
- Current capacity: Quotes accumulate in database with no way to view/manage
- Limit: After 1000+ quotes, no way to prioritize/respond without direct DB access
- Scaling path:
  - Build admin dashboard at `/admin` (protected route)
  - Create quote listing/search/export functionality
  - Add email notification system for new quote submissions

**No Analytics Dashboard:**
- Current capacity: Can track rough stats from database queries
- Limit: No visibility into conversion funnel, popular products, or submission trends
- Scaling path:
  - Add Google Analytics integration
  - Create internal dashboard for submission metrics
  - Track form abandonment rates

## Known Issues and Bugs

**Empty Public Asset Directory:**
- Symptoms: Hero background image referenced but not present; gallery items show placeholder colors
- Files: `src/app/page.tsx` (line 85), `public/` directory
- Trigger: Loading homepage or gallery page
- Impact: Hero section shows dark gradient overlay with no image; gallery shows colored placeholders instead of images
- Workaround: Images currently display as placeholder backgrounds, site still functional but incomplete

**Hardcoded Contact Details Need Updates:**
- Symptoms: Footer displays placeholder phone number and email
- Files: `src/components/Footer.tsx` (lines 45-49)
- Trigger: Page load - footer always shows demo contact info
- Impact: Users cannot contact business; form submissions have no associated business context
- Workaround: Must update code and redeploy to change contact info

**TypeScript Strict Mode Vulnerability:**
- Issue: While strict mode is enabled, no validation of Supabase response types
- Files: `src/app/quote/page.tsx` (lines 55-77)
- Impact: Unvalidated Supabase responses could cause runtime errors
- Fix: Add Zod/runtime validation for Supabase responses

---

*Concerns audit: 2026-03-26*
