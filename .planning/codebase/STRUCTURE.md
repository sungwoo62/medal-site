# Codebase Structure

**Analysis Date:** 2026-03-26

## Directory Layout

```
medal-site/
├── src/                          # Source code
│   ├── app/                      # Next.js App Router pages and layouts
│   │   ├── layout.tsx            # Root layout (Header, Footer, ScrollReveal wrapper)
│   │   ├── page.tsx              # Home page (/)
│   │   ├── globals.css           # Global styles and animations
│   │   ├── gallery/
│   │   │   └── page.tsx          # Gallery page with filtering (/gallery)
│   │   ├── process/
│   │   │   └── page.tsx          # Manufacturing process guide (/process)
│   │   └── quote/
│   │       └── page.tsx          # Quote form submission page (/quote)
│   ├── components/               # Reusable React components
│   │   ├── Header.tsx            # Navigation header with mobile menu
│   │   ├── Footer.tsx            # Footer with contact info
│   │   └── ScrollReveal.tsx      # Intersection observer for scroll animations
│   └── lib/                      # Utilities and external integrations
│       └── supabase/
│           └── client.ts         # Supabase browser client initialization
├── public/                       # Static assets (images, icons, etc.)
├── supabase/                     # Supabase configuration and migrations
├── .next/                        # Next.js build output (generated)
├── package.json                  # Project dependencies and scripts
├── tsconfig.json                 # TypeScript configuration with @ path alias
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration (if present)
├── postcss.config.mjs            # PostCSS configuration for Tailwind
└── .env.local                    # Environment variables (secrets: DO NOT COMMIT)
```

## Directory Purposes

**src/app/:**
- Purpose: Next.js App Router pages and layouts. Each directory with `page.tsx` becomes a route.
- Contains: Page components (Server and Client), layouts, global styles, CSS animations
- Key files: `layout.tsx` (root wrapper), `page.tsx` (home), `globals.css` (theme, animations)

**src/components/:**
- Purpose: Reusable UI components shared across pages
- Contains: Header with navigation, Footer with contact info, ScrollReveal animation trigger
- Key files: `Header.tsx` (responsive navigation with mobile menu), `Footer.tsx` (company info), `ScrollReveal.tsx` (Intersection Observer hook)

**src/lib/supabase/:**
- Purpose: External service integrations and utilities
- Contains: Supabase client factory for data and file operations
- Key files: `client.ts` (creates Supabase browser client with public key)

**public/:**
- Purpose: Static assets served directly by Next.js
- Contains: Images, fonts, icons (referenced in CSS and components)
- Key file: None explicitly listed; likely contains `hero-bg.jpg` referenced in `page.tsx`

**supabase/:**
- Purpose: Supabase database schema and migration files
- Contains: Database migrations, seed data (likely)
- Key files: Unknown without inspection; presumably defines `quotes` table and `attachments` storage bucket

## Key File Locations

**Entry Points:**

- `src/app/layout.tsx`: Root layout wrapping all pages. Injects metadata, Header, Footer, and ScrollReveal globally.
- `src/app/page.tsx`: Home page. Hero section, product categories, manufacturing process, gallery preview, statistics, CTAs.
- `src/app/quote/page.tsx`: Quote form page. Form submission with file upload to Supabase.
- `src/app/gallery/page.tsx`: Portfolio gallery with category filtering.
- `src/app/process/page.tsx`: Manufacturing guide with materials, techniques, timeline.

**Configuration:**

- `tsconfig.json`: TypeScript config. Defines path alias `@/*` mapping to `./src/*`
- `package.json`: Dependencies (Next.js 16, React 19, Supabase, Tailwind 4, lucide-react)
- `next.config.ts`: Next.js configuration
- `postcss.config.mjs`: PostCSS with Tailwind plugin
- `.env.local`: Environment variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (secrets)

**Core Logic:**

- `src/app/quote/page.tsx`: Form handling, validation, Supabase insert, file upload
- `src/lib/supabase/client.ts`: Supabase client initialization with public credentials
- `src/components/Header.tsx`: Navigation state, scroll detection, mobile menu toggle
- `src/components/ScrollReveal.tsx`: IntersectionObserver setup for scroll animations

**Global Styles:**

- `src/app/globals.css`: Tailwind import, theme variables, animation keyframes (@keyframes fadeInUp, fadeIn, scaleIn, slideInLeft), animation utility classes (.anim-fade-up, .anim-d1, etc.), scroll reveal classes (.reveal, .reveal.visible)

## Naming Conventions

**Files:**

- Page components: `page.tsx` (Next.js convention for routes)
- Component files: PascalCase (e.g., `Header.tsx`, `Footer.tsx`, `ScrollReveal.tsx`)
- Utility/integration files: camelCase (e.g., `client.ts`)
- Style files: `globals.css`, `*.css` (lowercase with extension)

**Directories:**

- Route directories: lowercase (e.g., `gallery/`, `process/`, `quote/`)
- Feature directories: lowercase (e.g., `components/`, `lib/`)
- Grouped utilities: nested under feature (e.g., `lib/supabase/`)

**Components:**

- Exported as default functions: `export default function HeaderComponent() { ... }`
- Named descriptively: `Header`, `Footer`, `ScrollReveal` (adjective + noun pattern)

**Types:**

- Form types: PascalCase with `Form` suffix (e.g., `QuoteForm`)
- Data arrays: SCREAMING_SNAKE_CASE (e.g., `CATEGORIES`, `TIMELINE`, `MATERIALS`, `TRUST_STATS`)
- Maps/Records: SCREAMING_SNAKE_CASE (e.g., `GRADIENTS`, `MEDAL_TYPES`)
- Inline objects in props: camelCase keys (e.g., `event_name`, `customer_name`, `product_name`)

**Functions:**

- Event handlers: prefixed with `handle` (e.g., `handleSubmit`)
- State setters: prefixed with `set` (e.g., `setForm`, `setError`, `setDone`)
- Utility functions: camelCase (e.g., `createClient()`)

**CSS Classes:**

- Component classes: Tailwind utilities (no BEM, no CSS modules visible)
- Custom animation classes: `.anim-` prefix (e.g., `.anim-fade-up`, `.anim-d1`)
- Scroll reveal class: `.reveal` (state: `.reveal.visible`)
- Custom utility: `.hero-overlay` (linear gradient)

## Where to Add New Code

**New Feature (e.g., new product category):**
- Primary code: Add to `CATEGORIES` array in `src/app/page.tsx` (lines 11-40)
- Tests: No test files present; add `.test.tsx` files alongside if testing added
- Database: Update `quotes` table schema in `supabase/migrations/` if tracking new fields

**New Page/Route (e.g., /contact, /about):**
- Implementation: Create `src/app/[route-name]/page.tsx` with default export component
- Navigation: Update `navItems` array in `src/components/Header.tsx` (line 8-13)
- Footer: Update footer links in `src/components/Footer.tsx` if public-facing (line 28-35)
- Layout: Use existing `RootLayout` from `src/app/layout.tsx` automatically via Next.js

**New Component (e.g., ContactForm, TestimonialCard):**
- Implementation: `src/components/[ComponentName].tsx` as default export
- Styling: Use Tailwind utility classes in `className` props
- Imports: Use path alias `@/components/ComponentName` in other files
- Reusability: Define static data arrays outside component if needed

**Utilities/Helpers (e.g., validation, formatting):**
- Location: Create in `src/lib/[feature]/` subdirectory
- Example: `src/lib/validation/forms.ts` for form helpers
- Export: Named exports for tree-shakable imports
- Supabase operations: Extend `src/lib/supabase/client.ts` or create `src/lib/supabase/[operation].ts`

**Styling/Animations:**
- Global animations: Add `@keyframes` and utility classes to `src/app/globals.css`
- Component-specific: Use inline Tailwind classes in JSX (`className="..."`)
- No CSS modules or styled-components in use; all Tailwind

**Database Integration:**
- Schema changes: Create migration files in `supabase/migrations/`
- Client operations: Use `createClient()` from `src/lib/supabase/client.ts`
- File storage: Access via `supabase.storage.from('[bucket]').upload/getPublicUrl()`

## Special Directories

**src/app/globals.css:**
- Purpose: Global styles, theme variables, animations
- Generated: No
- Committed: Yes
- Contents: Tailwind import, theme color variables via `@theme inline`, animation keyframes, utility classes

**.next/:**
- Purpose: Next.js build output (compiled pages, chunks, static assets)
- Generated: Yes (created by `npm run build`)
- Committed: No (in `.gitignore`)
- Note: Contains prebuilt pages and optimized bundles

**supabase/:**
- Purpose: Supabase project configuration and database schema
- Generated: Partially (migration files are tracked, build output is not)
- Committed: Yes (migrations and config tracked)
- Note: Database schema defined via migrations; `quotes` table and `attachments` storage bucket configured here

**node_modules/:**
- Purpose: Installed npm dependencies
- Generated: Yes (created by `npm install` from package-lock.json)
- Committed: No (in `.gitignore`)

---

*Structure analysis: 2026-03-26*
