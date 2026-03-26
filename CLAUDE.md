<!-- GSD:project-start source:PROJECT.md -->
## Project

**Medal of Finisher**

Medal of Finisher는 마라톤/스포츠 완주 메달 제작 전문 업체의 B2C 웹사이트다. 고객이 메달 제작 견적을 신청하고, 갤러리에서 제작 사례를 확인하며, 마이페이지에서 견적 현황을 추적할 수 있다. 관리자는 별도 프로젝트(allpack-ops)에서 견적을 관리하며, 같은 Supabase DB를 공유한다.

**Core Value:** 고객이 메달 제작 견적을 쉽고 빠르게 신청하고, 접수 상태를 확인할 수 있어야 한다.

### Constraints

- **Tech Stack**: Next.js 16 + Supabase — 기존 스택 유지
- **Email**: Google Workspace SMTP — 기존 도메인 이메일 활용
- **DB 공유**: allpack-ops와 같은 Supabase 프로젝트 — quotes 테이블 스키마 변경 시 양쪽 호환 필수
- **인증**: Supabase Auth (이메일/비밀번호) — 고객 마이페이지용
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 6.0.2 - All application code and configuration
- JavaScript (ES2017 target) - Legacy support and built assets
- SQL - Supabase schema definition
## Runtime
- Node.js (no specific version pinned, uses system default)
- npm - Dependency management
- Lockfile: `package-lock.json` present
## Frameworks
- Next.js 16.2.1 - Full-stack React framework with App Router
- React 19.2.4 - Component library (react + react-dom)
- Tailwind CSS 4.2.2 - Utility-first CSS framework
- lucide-react 1.6.0 - Icon component library
## Key Dependencies
- @supabase/supabase-js 2.100.0 - Database client and storage SDK
- @supabase/auth-helpers-nextjs 0.15.0 - Authentication integration
- @tailwindcss/postcss 4.2.2 - PostCSS Tailwind plugin
- @types/node 25.5.0 - Node.js type definitions
- @types/react 19.2.14 - React type definitions
## Configuration
- Public Supabase credentials stored in `.env.local`
- `.env.local` is gitignored (not committed)
- `tsconfig.json` - TypeScript compiler options
- `next.config.ts` - Next.js configuration (minimal, uses defaults)
- `postcss.config.mjs` - PostCSS configuration for Tailwind
- Strict mode enabled in `tsconfig.json`
- React JSX transform: react-jsx
- Incremental compilation enabled
- Next.js plugin included for build optimization
## Platform Requirements
- Node.js (version unspecified)
- npm
- TypeScript compiler (included in devDependencies)
- Node.js runtime (for `next start`)
- Environment variables: Supabase URL and anonymous key
- Supabase PostgreSQL database with `quotes` table
- Supabase Storage bucket: `attachments` (for quote file uploads)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Page components: `page.tsx` in route directories (Next.js app router convention)
- Reusable components: PascalCase, e.g., `Header.tsx`, `Footer.tsx`, `ScrollReveal.tsx`
- Library files: camelCase, e.g., `client.ts` in `src/lib/supabase/`
- Constants: UPPERCASE_SNAKE_CASE for data arrays, e.g., `TRUST_STATS`, `MEDAL_TYPES`, `CATEGORIES`, `PROCESS_STEPS`
- Components: PascalCase with default export, e.g., `export default function HomePage()`
- Utility functions: camelCase, e.g., `createClient()`, `handleSubmit()`, `setScrolled()`
- Event handlers: `handle` prefix followed by event name, e.g., `handleSubmit`, `handleFiltering`
- Internal state setters: camelCase without prefix, e.g., `set('event_name', value)` for form updates
- State variables: camelCase, e.g., `scrolled`, `open`, `submitting`, `form`, `file`, `error`, `done`
- Constants (non-array): camelCase if lowercase, e.g., `inputClass`, `headerBg`, `textColor`, `logoColor`
- Form state: Type-keyed setter pattern - `form` object with fields matching database schema
- Filter/flags: `filter`, `isHome`, `pathname`
- Type aliases: PascalCase with `type` keyword, e.g., `type QuoteForm = { ... }`
- Type definitions imported: `import type { Metadata }` for Next.js metadata
- Props are inlined in component parameters: `({ children }: { children: React.ReactNode })`
- Form object keys match database column names: `event_name`, `medal_type`, `contact_name`, `contact_phone` (snake_case in types, camelCase variables)
## Code Style
- Tailwind CSS for all styling (no external CSS libraries except animations defined in globals.css)
- JSX/TSX format with proper indentation (2-4 spaces implicit)
- String literals with single quotes for imports and strings: `import Link from 'next/link'`
- Template literals with backticks for dynamic strings
- Semicolons at end of statements (enforced by TypeScript)
- No visible `.eslintrc` or `.prettierrc` files (not configured in repo)
- Uses TypeScript strict mode: `"strict": true` in `tsconfig.json`
- Type safety is prioritized via TypeScript compiler
- Component functions typed explicitly when needed (e.g., `React.FormEvent` for form submissions)
## Import Organization
- `@/*` maps to `./src/*` as defined in `tsconfig.json`
- Used throughout: `@/components/Header`, `@/lib/supabase/client`
## Error Handling
- Form validation: Check required fields, set error message in state before async operation
- Async errors: Destructure `{ error: varName }` from Supabase results
- Display errors: Conditional rendering of error state message
- Example pattern from `quote/page.tsx`:
- Errors logged to component state, not console
- User-facing error messages in Korean (language of the site)
## Logging
- No console logging in current codebase
- Errors managed through state management (useState)
- UI feedback through conditional rendering of error/success states
- Success state (`done` flag) triggers success message display
## Comments
- Minimal comments in codebase; code is self-documenting via naming
- Section headers used in long pages (e.g., `{/* ── 히어로 ── */}`, `{/* 신뢰 지표 ── */}`)
- Section headers follow pattern: `{/* ── [Section Name] ── */}`
- Comments in Korean for consistency with site content
- No JSDoc/TSDoc patterns observed
- Type definitions inline in function parameters
## Function Design
- Page components range from 82-249 lines
- Utility functions are short and focused (e.g., `createClient()` is 6 lines)
- Form submission handlers remain compact (~40 lines for complex operations)
- Destructured in function parameters when possible
- Props destructured inline: `({ children }: { children: React.ReactNode })`
- Event handlers receive event object: `(e: React.FormEvent)`
- Supabase methods return result objects with optional `error` property
- Components return JSX or null (e.g., `ScrollReveal` returns null)
- Async handlers set state instead of returning values
- Form data submitted to database via async methods
## Module Design
- All components use default export: `export default function ComponentName()`
- Utility functions exported as named exports: `export function createClient()`
- No re-export barrel files observed
- Not used in current structure
- Direct imports from specific files: `import Header from '@/components/Header'`
## Component Patterns
- Form state managed with `useState<FormType>()`
- Form fields updated via generic setter: `const set = (key: keyof FormType, value: string) => setForm({ ...form, [key]: value })`
- File uploads handled separately with `useState<File | null>()`
- Loading state: `submitting` flag prevents double submission
- Success state: `done` flag triggers success UI
- CSS classes applied conditionally: `` className={`${baseClass} ${condition ? 'activeClass' : 'inactiveClass'}`} ``
- Reusable style strings: `const inputClass = '...'` defined at component top
- Responsive classes: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` pattern for responsive grids
- Moved to top of file for easy modification
- Typed as `const CONSTANT_NAME: Type[] = [...]`
- Used for gallery items, timeline steps, navigation items, product categories
- Color palette via Tailwind theme: `text-rose`, `bg-charcoal`, `text-charcoal-light`, `bg-warm-white`
- Animation classes: `anim-fade-up`, `anim-fade-in`, `anim-scale-in`, `anim-slide-left`
- Animation delays: `anim-d1`, `anim-d2`, `anim-d3`, `anim-d4`
- Hover states: `hover:shadow-lg`, `hover:-translate-y-1`, `group-hover:scale-110`
- Responsive spacing: `py-16 sm:py-24` pattern for vertical padding adjustments
- Border and focus states for forms: `border-border`, `focus:border-rose/50`, `focus:ring-rose/10`
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Server-rendered pages with strategic client-side components
- Layout-based composition for header/footer reuse
- Component-driven UI with Tailwind CSS styling
- Form data persistence to Supabase PostgreSQL
- Scroll-triggered animations for engagement
- Responsive mobile-first design approach
## Layers
- Purpose: User-facing components and pages rendered in browser
- Location: `src/app/` (pages) and `src/components/` (reusable UI)
- Contains: Page components (`.tsx`), layout wrappers, UI components, animations
- Depends on: Next.js routing, React hooks, Tailwind utilities, lucide-react icons
- Used by: Browser/HTTP clients
- Purpose: Form handling, state management, user interactions
- Location: `src/app/quote/page.tsx` (main form logic), component event handlers
- Contains: Form state with `useState`, submission handlers, file upload logic
- Depends on: Supabase client, React hooks, validation logic
- Used by: Pages and interactive components
- Purpose: Communication with external Supabase backend
- Location: `src/lib/supabase/client.ts` (client initialization)
- Contains: Supabase browser client creation and API calls
- Depends on: `@supabase/auth-helpers-nextjs`, `@supabase/supabase-js`
- Used by: Quote form submission, file uploads to storage
- Purpose: Hard-coded data for rendering galleries, process steps, and product categories
- Location: Inline in page components (`src/app/page.tsx`, `src/app/gallery/page.tsx`, `src/app/process/page.tsx`)
- Contains: Arrays of objects: `CATEGORIES`, `PROCESS_STEPS`, `GALLERY_ITEMS`, `TIMELINE`, `MATERIALS`, `TECHNIQUES`, `TRUST_STATS`, `MEDAL_TYPES`
- Depends on: Nothing (pure data)
- Used by: Map functions to render lists and grids
## Data Flow
- All state is client-local via `useState` hooks
- No global state manager (Redux, Zustand)
- Form state in `QuoteForm` type object
- UI state: `submitting`, `error`, `done`, `file`, `open` (mobile menu)
- Header scroll state in `Header` component (`scrolled`, `open`)
- Gallery filter state in `GalleryPage` (`filter`)
## Key Abstractions
- Purpose: Encapsulate quote form data structure
- Example: `src/app/quote/page.tsx` lines 9-29 (`QuoteForm` type)
- Pattern: TypeScript type with all form fields as strings, shared `set()` helper function
- Matches Supabase schema: `product_name`, `customer_name`, `customer_phone`, `quantity`, `valid_until`, `note`, `file_url`, `file_name`
- Purpose: Centralize content and enable DRY rendering via `.map()`
- Examples:
- Pattern: Array of objects with consistent shape, mapped to JSX cards/items
- Purpose: Assign category-specific background colors dynamically
- Examples: `GRADIENTS` objects in `src/app/page.tsx` and `src/app/gallery/page.tsx`
- Pattern: `Record<string, string>` mapping category names to Tailwind gradient classes
- Usage: `bg-gradient-to-br ${GRADIENTS[item.cat] ?? 'from-gray-100 to-gray-50'}`
- Purpose: Render lucide-react icons with consistent styling
- Examples: Trophy, Award, Users icons in `CATEGORIES`; Palette, Hammer, Truck in `PROCESS_STEPS`
- Pattern: Import icon components, pass as function references in data objects, destructure in JSX
- Usage: `{icon: Trophy, ...}` → `const {icon: Icon, ...} = category` → `<Icon size={20} className={iconColor} />`
## Entry Points
- Location: `src/app/page.tsx`
- Triggers: Route `/` accessed via browser
- Responsibilities: Render hero section, product categories, manufacturing process overview, portfolio gallery excerpt, trust statistics, CTAs to quote form
- Location: `src/app/quote/page.tsx`
- Triggers: User clicks "무료 견적 받기" (Free Quote) link or navigates to `/quote`
- Responsibilities: Render form with validation, handle file upload, submit to Supabase, show success/error states
- Location: `src/app/gallery/page.tsx`
- Triggers: Route `/gallery` accessed or user clicks "제작 사례" (Portfolio)
- Responsibilities: Display all 12 portfolio items, filter by category, render grid layout
- Location: `src/app/process/page.tsx`
- Triggers: Route `/process` accessed or user clicks "제작 안내" (How We Make)
- Responsibilities: Display materials, techniques, manufacturing timeline, and notes
- Location: `src/app/layout.tsx`
- Triggers: Every page render (wraps all pages)
- Responsibilities: Inject metadata (title, description), render global Header/Footer, inject ScrollReveal component
## Error Handling
- Form validation: Check required fields before submission (`event_name`, `contact_name`, `contact_phone`)
- Display error message in red text if validation fails: `{error && <p className="text-sm text-red-500">{error}</p>}`
- API errors: Catch Supabase insert errors with `if (insertErr)` → set error state
- File upload errors: Check `uploadErr` from storage upload call; if error, skip file URL retrieval
- Graceful fallback: Use nullish coalescing for missing gradient colors: `${GRADIENTS[item.cat] ?? 'from-gray-100 to-gray-50'}`
## Cross-Cutting Concerns
- Form required field checks in `handleSubmit()`: `if (!form.event_name.trim() || !form.contact_name.trim() || !form.contact_phone.trim())`
- No schema validation library (Zod, Yup)
- Client-side only; no server-side validation visible
- Not implemented; form submission is public
- Supabase client uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` for public insert access
- Quote table appears open for anonymous writes
- No authorization checks; all form fields submitted directly to database
- File uploads to public Supabase Storage bucket with public URLs returned
- Static data arrays defined once per component render (not memoized)
- No image optimization (hero background is CSS background URL)
- Tailwind CSS with PostCSS compilation
- Lucide icons imported at module level (tree-shakable)
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
