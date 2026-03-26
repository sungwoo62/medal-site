# Coding Conventions

**Analysis Date:** 2026-03-26

## Naming Patterns

**Files:**
- Page components: `page.tsx` in route directories (Next.js app router convention)
- Reusable components: PascalCase, e.g., `Header.tsx`, `Footer.tsx`, `ScrollReveal.tsx`
- Library files: camelCase, e.g., `client.ts` in `src/lib/supabase/`
- Constants: UPPERCASE_SNAKE_CASE for data arrays, e.g., `TRUST_STATS`, `MEDAL_TYPES`, `CATEGORIES`, `PROCESS_STEPS`

**Functions:**
- Components: PascalCase with default export, e.g., `export default function HomePage()`
- Utility functions: camelCase, e.g., `createClient()`, `handleSubmit()`, `setScrolled()`
- Event handlers: `handle` prefix followed by event name, e.g., `handleSubmit`, `handleFiltering`
- Internal state setters: camelCase without prefix, e.g., `set('event_name', value)` for form updates

**Variables:**
- State variables: camelCase, e.g., `scrolled`, `open`, `submitting`, `form`, `file`, `error`, `done`
- Constants (non-array): camelCase if lowercase, e.g., `inputClass`, `headerBg`, `textColor`, `logoColor`
- Form state: Type-keyed setter pattern - `form` object with fields matching database schema
- Filter/flags: `filter`, `isHome`, `pathname`

**Types:**
- Type aliases: PascalCase with `type` keyword, e.g., `type QuoteForm = { ... }`
- Type definitions imported: `import type { Metadata }` for Next.js metadata
- Props are inlined in component parameters: `({ children }: { children: React.ReactNode })`
- Form object keys match database column names: `event_name`, `medal_type`, `contact_name`, `contact_phone` (snake_case in types, camelCase variables)

## Code Style

**Formatting:**
- Tailwind CSS for all styling (no external CSS libraries except animations defined in globals.css)
- JSX/TSX format with proper indentation (2-4 spaces implicit)
- String literals with single quotes for imports and strings: `import Link from 'next/link'`
- Template literals with backticks for dynamic strings
- Semicolons at end of statements (enforced by TypeScript)

**Linting:**
- No visible `.eslintrc` or `.prettierrc` files (not configured in repo)
- Uses TypeScript strict mode: `"strict": true` in `tsconfig.json`
- Type safety is prioritized via TypeScript compiler
- Component functions typed explicitly when needed (e.g., `React.FormEvent` for form submissions)

## Import Organization

**Order:**
1. External packages: `import Link from 'next/link'`, `import { useState } from 'react'`
2. External UI libraries: `import { ArrowRight, Palette, ... } from 'lucide-react'`
3. Internal utilities: `import { createClient } from '@/lib/supabase/client'`
4. Internal components: `import Header from '@/components/Header'`
5. Styles: `import './globals.css'`
6. Type imports: Separated with `import type` directive

**Path Aliases:**
- `@/*` maps to `./src/*` as defined in `tsconfig.json`
- Used throughout: `@/components/Header`, `@/lib/supabase/client`

## Error Handling

**Patterns:**
- Form validation: Check required fields, set error message in state before async operation
- Async errors: Destructure `{ error: varName }` from Supabase results
- Display errors: Conditional rendering of error state message
- Example pattern from `quote/page.tsx`:
  ```typescript
  if (!form.event_name.trim() || !form.contact_name.trim()) {
    setError('行事名, 이름, 연락처는 필수입니다.')
    return
  }
  const { error: uploadErr } = await supabase.storage.from('attachments').upload(path, file)
  if (!uploadErr) { /* process success */ }
  ```
- Errors logged to component state, not console
- User-facing error messages in Korean (language of the site)

## Logging

**Framework:** Console methods not used in production; error states managed via React state

**Patterns:**
- No console logging in current codebase
- Errors managed through state management (useState)
- UI feedback through conditional rendering of error/success states
- Success state (`done` flag) triggers success message display

## Comments

**When to Comment:**
- Minimal comments in codebase; code is self-documenting via naming
- Section headers used in long pages (e.g., `{/* ── 히어로 ── */}`, `{/* 신뢰 지표 ── */}`)
- Section headers follow pattern: `{/* ── [Section Name] ── */}`
- Comments in Korean for consistency with site content

**JSDoc/TSDoc:**
- No JSDoc/TSDoc patterns observed
- Type definitions inline in function parameters

## Function Design

**Size:**
- Page components range from 82-249 lines
- Utility functions are short and focused (e.g., `createClient()` is 6 lines)
- Form submission handlers remain compact (~40 lines for complex operations)

**Parameters:**
- Destructured in function parameters when possible
- Props destructured inline: `({ children }: { children: React.ReactNode })`
- Event handlers receive event object: `(e: React.FormEvent)`
- Supabase methods return result objects with optional `error` property

**Return Values:**
- Components return JSX or null (e.g., `ScrollReveal` returns null)
- Async handlers set state instead of returning values
- Form data submitted to database via async methods

## Module Design

**Exports:**
- All components use default export: `export default function ComponentName()`
- Utility functions exported as named exports: `export function createClient()`
- No re-export barrel files observed

**Barrel Files:**
- Not used in current structure
- Direct imports from specific files: `import Header from '@/components/Header'`

## Component Patterns

**Form Components:**
- Form state managed with `useState<FormType>()`
- Form fields updated via generic setter: `const set = (key: keyof FormType, value: string) => setForm({ ...form, [key]: value })`
- File uploads handled separately with `useState<File | null>()`
- Loading state: `submitting` flag prevents double submission
- Success state: `done` flag triggers success UI

**Layout Components:**
- CSS classes applied conditionally: `` className={`${baseClass} ${condition ? 'activeClass' : 'inactiveClass'}`} ``
- Reusable style strings: `const inputClass = '...'` defined at component top
- Responsive classes: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` pattern for responsive grids

**Data Constants:**
- Moved to top of file for easy modification
- Typed as `const CONSTANT_NAME: Type[] = [...]`
- Used for gallery items, timeline steps, navigation items, product categories

**Styling Patterns:**
- Color palette via Tailwind theme: `text-rose`, `bg-charcoal`, `text-charcoal-light`, `bg-warm-white`
- Animation classes: `anim-fade-up`, `anim-fade-in`, `anim-scale-in`, `anim-slide-left`
- Animation delays: `anim-d1`, `anim-d2`, `anim-d3`, `anim-d4`
- Hover states: `hover:shadow-lg`, `hover:-translate-y-1`, `group-hover:scale-110`
- Responsive spacing: `py-16 sm:py-24` pattern for vertical padding adjustments
- Border and focus states for forms: `border-border`, `focus:border-rose/50`, `focus:ring-rose/10`

---

*Convention analysis: 2026-03-26*
