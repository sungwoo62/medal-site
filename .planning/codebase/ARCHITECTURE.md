# Architecture

**Analysis Date:** 2026-03-26

## Pattern Overview

**Overall:** Next.js 16 App Router with server-side rendering (SSR) and client-side interactivity. Content-driven marketing website with form submission to Supabase backend.

**Key Characteristics:**
- Server-rendered pages with strategic client-side components
- Layout-based composition for header/footer reuse
- Component-driven UI with Tailwind CSS styling
- Form data persistence to Supabase PostgreSQL
- Scroll-triggered animations for engagement
- Responsive mobile-first design approach

## Layers

**Presentation Layer:**
- Purpose: User-facing components and pages rendered in browser
- Location: `src/app/` (pages) and `src/components/` (reusable UI)
- Contains: Page components (`.tsx`), layout wrappers, UI components, animations
- Depends on: Next.js routing, React hooks, Tailwind utilities, lucide-react icons
- Used by: Browser/HTTP clients

**Application Layer:**
- Purpose: Form handling, state management, user interactions
- Location: `src/app/quote/page.tsx` (main form logic), component event handlers
- Contains: Form state with `useState`, submission handlers, file upload logic
- Depends on: Supabase client, React hooks, validation logic
- Used by: Pages and interactive components

**Data Access Layer:**
- Purpose: Communication with external Supabase backend
- Location: `src/lib/supabase/client.ts` (client initialization)
- Contains: Supabase browser client creation and API calls
- Depends on: `@supabase/auth-helpers-nextjs`, `@supabase/supabase-js`
- Used by: Quote form submission, file uploads to storage

**Static Content Layer:**
- Purpose: Hard-coded data for rendering galleries, process steps, and product categories
- Location: Inline in page components (`src/app/page.tsx`, `src/app/gallery/page.tsx`, `src/app/process/page.tsx`)
- Contains: Arrays of objects: `CATEGORIES`, `PROCESS_STEPS`, `GALLERY_ITEMS`, `TIMELINE`, `MATERIALS`, `TECHNIQUES`, `TRUST_STATS`, `MEDAL_TYPES`
- Depends on: Nothing (pure data)
- Used by: Map functions to render lists and grids

## Data Flow

**Quote Submission Flow:**

1. User fills form in `src/app/quote/page.tsx` (client component)
2. Form state updates via `setForm()` handler from `useState`
3. User clicks submit button → `handleSubmit()` validation checks (event name, contact name, phone required)
4. Optional file upload: File uploaded to Supabase Storage bucket `attachments` at path `quote-files/{timestamp}.{ext}`
5. File URL retrieved via `getPublicUrl()` for database storage
6. Form data + file metadata inserted into Supabase `quotes` table via `.insert()` call
7. On success: Show success state with `CheckCircle2` icon and reset form
8. On error: Display error message in red text

**Page Navigation Flow:**

1. User navigates via `Header` navigation or page links
2. Next.js App Router matches route to page file in `src/app/[page]/page.tsx`
3. Page renders via `RootLayout` wrapper from `src/app/layout.tsx`
4. Layout injects `Header`, `Footer`, and `ScrollReveal` components
5. Page-specific content renders in `<main>` slot

**Scroll Animation Flow:**

1. Page loads with elements marked with `.reveal` class
2. `ScrollReveal` component initializes `IntersectionObserver` in `useEffect`
3. As user scrolls, observer detects when `.reveal` elements enter viewport
4. CSS class `.visible` added to element → opacity and translateY transition
5. Animation driven by CSS transitions defined in `src/app/globals.css`

**State Management:**

- All state is client-local via `useState` hooks
- No global state manager (Redux, Zustand)
- Form state in `QuoteForm` type object
- UI state: `submitting`, `error`, `done`, `file`, `open` (mobile menu)
- Header scroll state in `Header` component (`scrolled`, `open`)
- Gallery filter state in `GalleryPage` (`filter`)

## Key Abstractions

**Form State Object:**
- Purpose: Encapsulate quote form data structure
- Example: `src/app/quote/page.tsx` lines 9-29 (`QuoteForm` type)
- Pattern: TypeScript type with all form fields as strings, shared `set()` helper function
- Matches Supabase schema: `product_name`, `customer_name`, `customer_phone`, `quantity`, `valid_until`, `note`, `file_url`, `file_name`

**Data Arrays as Constants:**
- Purpose: Centralize content and enable DRY rendering via `.map()`
- Examples:
  - `CATEGORIES` in `src/app/page.tsx` (4 medal types with icons and descriptions)
  - `TIMELINE` in `src/app/process/page.tsx` (6 manufacturing steps)
  - `ITEMS` in `src/app/gallery/page.tsx` (12 portfolio projects)
  - `TRUST_STATS` in `src/app/page.tsx` (4 statistics)
- Pattern: Array of objects with consistent shape, mapped to JSX cards/items

**Gradient Map:**
- Purpose: Assign category-specific background colors dynamically
- Examples: `GRADIENTS` objects in `src/app/page.tsx` and `src/app/gallery/page.tsx`
- Pattern: `Record<string, string>` mapping category names to Tailwind gradient classes
- Usage: `bg-gradient-to-br ${GRADIENTS[item.cat] ?? 'from-gray-100 to-gray-50'}`

**Icon Component Pattern:**
- Purpose: Render lucide-react icons with consistent styling
- Examples: Trophy, Award, Users icons in `CATEGORIES`; Palette, Hammer, Truck in `PROCESS_STEPS`
- Pattern: Import icon components, pass as function references in data objects, destructure in JSX
- Usage: `{icon: Trophy, ...}` → `const {icon: Icon, ...} = category` → `<Icon size={20} className={iconColor} />`

## Entry Points

**Home Page:**
- Location: `src/app/page.tsx`
- Triggers: Route `/` accessed via browser
- Responsibilities: Render hero section, product categories, manufacturing process overview, portfolio gallery excerpt, trust statistics, CTAs to quote form

**Quote Page:**
- Location: `src/app/quote/page.tsx`
- Triggers: User clicks "무료 견적 받기" (Free Quote) link or navigates to `/quote`
- Responsibilities: Render form with validation, handle file upload, submit to Supabase, show success/error states

**Gallery Page:**
- Location: `src/app/gallery/page.tsx`
- Triggers: Route `/gallery` accessed or user clicks "제작 사례" (Portfolio)
- Responsibilities: Display all 12 portfolio items, filter by category, render grid layout

**Process Page:**
- Location: `src/app/process/page.tsx`
- Triggers: Route `/process` accessed or user clicks "제작 안내" (How We Make)
- Responsibilities: Display materials, techniques, manufacturing timeline, and notes

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page render (wraps all pages)
- Responsibilities: Inject metadata (title, description), render global Header/Footer, inject ScrollReveal component

## Error Handling

**Strategy:** Client-side validation and error messaging

**Patterns:**
- Form validation: Check required fields before submission (`event_name`, `contact_name`, `contact_phone`)
- Display error message in red text if validation fails: `{error && <p className="text-sm text-red-500">{error}</p>}`
- API errors: Catch Supabase insert errors with `if (insertErr)` → set error state
- File upload errors: Check `uploadErr` from storage upload call; if error, skip file URL retrieval
- Graceful fallback: Use nullish coalescing for missing gradient colors: `${GRADIENTS[item.cat] ?? 'from-gray-100 to-gray-50'}`

## Cross-Cutting Concerns

**Logging:** No explicit logging in codebase. Error handling via state display only.

**Validation:**
- Form required field checks in `handleSubmit()`: `if (!form.event_name.trim() || !form.contact_name.trim() || !form.contact_phone.trim())`
- No schema validation library (Zod, Yup)
- Client-side only; no server-side validation visible

**Authentication:**
- Not implemented; form submission is public
- Supabase client uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` for public insert access
- Quote table appears open for anonymous writes

**Authorization:**
- No authorization checks; all form fields submitted directly to database
- File uploads to public Supabase Storage bucket with public URLs returned

**Performance:**
- Static data arrays defined once per component render (not memoized)
- No image optimization (hero background is CSS background URL)
- Tailwind CSS with PostCSS compilation
- Lucide icons imported at module level (tree-shakable)

---

*Architecture analysis: 2026-03-26*
