# Technology Stack

**Analysis Date:** 2026-03-26

## Languages

**Primary:**
- TypeScript 6.0.2 - All application code and configuration

**Secondary:**
- JavaScript (ES2017 target) - Legacy support and built assets
- SQL - Supabase schema definition

## Runtime

**Environment:**
- Node.js (no specific version pinned, uses system default)

**Package Manager:**
- npm - Dependency management
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.2.1 - Full-stack React framework with App Router
  - Dev server: Turbopack enabled (`next dev --turbopack`)
  - Build: `next build`
  - Production: `next start`

**UI:**
- React 19.2.4 - Component library (react + react-dom)
- Tailwind CSS 4.2.2 - Utility-first CSS framework
  - PostCSS integration with `@tailwindcss/postcss` 4.2.2

**Icons:**
- lucide-react 1.6.0 - Icon component library

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.100.0 - Database client and storage SDK
  - Used for PostgreSQL queries and file storage operations
  - Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- @supabase/auth-helpers-nextjs 0.15.0 - Authentication integration
  - Browser client factory: `createBrowserClient()` in `src/lib/supabase/client.ts`

**Build/Dev:**
- @tailwindcss/postcss 4.2.2 - PostCSS Tailwind plugin
- @types/node 25.5.0 - Node.js type definitions
- @types/react 19.2.14 - React type definitions

## Configuration

**Environment:**
- Public Supabase credentials stored in `.env.local`
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key for client-side access
- `.env.local` is gitignored (not committed)

**Build:**
- `tsconfig.json` - TypeScript compiler options
  - Target: ES2017
  - Strict mode enabled
  - Path alias: `@/*` → `./src/*`
  - JSX: react-jsx
  - Module resolution: bundler
- `next.config.ts` - Next.js configuration (minimal, uses defaults)
- `postcss.config.mjs` - PostCSS configuration for Tailwind

**TypeScript:**
- Strict mode enabled in `tsconfig.json`
- React JSX transform: react-jsx
- Incremental compilation enabled
- Next.js plugin included for build optimization

## Platform Requirements

**Development:**
- Node.js (version unspecified)
- npm
- TypeScript compiler (included in devDependencies)

**Production:**
- Node.js runtime (for `next start`)
- Environment variables: Supabase URL and anonymous key
- Supabase PostgreSQL database with `quotes` table
- Supabase Storage bucket: `attachments` (for quote file uploads)

---

*Stack analysis: 2026-03-26*
