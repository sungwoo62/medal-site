# Testing Patterns

**Analysis Date:** 2026-03-26

## Test Framework

**Runner:**
- Not configured - No testing framework detected
- No `jest.config.js`, `vitest.config.ts`, or test runner in `package.json`

**Assertion Library:**
- Not installed - No test dependencies in `package.json`

**Run Commands:**
```bash
# No test scripts configured in package.json
# Project currently has no test infrastructure
```

## Test File Organization

**Location:**
- No test files present in codebase
- Pattern would be: co-located tests next to source files if implemented

**Naming:**
- No test files named `*.test.tsx`, `*.spec.ts`, etc. found

**Structure:**
- No established test directory structure

## Test Structure

**Suite Organization:**
- Not applicable - no tests implemented

**Patterns:**
- No setup/teardown patterns observed
- No assertion patterns established

## Mocking

**Framework:**
- Not used - No mocking library configured

**Patterns:**
- No mocking patterns implemented

**What to Mock:**
- If tests were added: Supabase client (`src/lib/supabase/client.ts`) would need mocking
- External API calls (Supabase storage, database inserts) would require mocks
- lucide-react icons could be mocked in unit tests

**What NOT to Mock:**
- React hooks when testing component behavior
- Event handler logic that modifies component state

## Fixtures and Factories

**Test Data:**
- No test fixtures or factories established
- Data constants defined in components (e.g., `MEDAL_TYPES`, `CATEGORIES`) could be leveraged for test data
- Form example data from `QuoteForm` type could seed test fixtures

**Location:**
- Would be placed in `src/__tests__/fixtures/` or similar if implemented

## Coverage

**Requirements:**
- No coverage requirements enforced - project has no testing infrastructure

**View Coverage:**
```bash
# Not applicable - no test runner configured
```

## Test Types

**Unit Tests:**
- Not implemented
- Should cover: Utility functions (`createClient()`), form validation logic, component rendering

**Integration Tests:**
- Not implemented
- Should cover: Form submission flow (state updates → Supabase call → success state)
- File upload handling in quote form

**E2E Tests:**
- Not implemented - No framework like Cypress, Playwright configured

## Recommended Testing Approach

**If testing is added, consider:**

1. **Install test framework** (Vitest recommended for Next.js 16):
   ```bash
   npm install -D vitest @vitest/ui happy-dom
   ```

2. **Mock Supabase client** in tests:
   ```typescript
   // src/__tests__/mocks/supabase.ts
   export const mockCreateClient = () => ({
     storage: {
       from: (bucket: string) => ({
         upload: vi.fn().mockResolvedValue({ error: null }),
         getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'url' } })
       })
     },
     from: (table: string) => ({
       insert: vi.fn().mockResolvedValue({ error: null })
     })
   })
   ```

3. **Test form components** with user interactions:
   ```typescript
   // src/app/quote/page.test.tsx
   import { render, screen, fireEvent } from '@testing-library/react'
   import QuotePage from './page'

   describe('QuotePage', () => {
     it('displays validation error for empty event_name', async () => {
       render(<QuotePage />)
       fireEvent.click(screen.getByText('견적 신청하기'))
       expect(screen.getByText(/필수입니다/)).toBeInTheDocument()
     })
   })
   ```

4. **Test state management** patterns:
   - Verify form state updates correctly on input change
   - Verify error/success states display appropriately
   - Verify async operations set loading states correctly

5. **Test snapshot rendering** for static pages:
   - HomePage components (CATEGORIES, PROCESS_STEPS display)
   - GalleryPage filter functionality
   - ProcessPage sections

## Current Code Quality Considerations for Testing

**Testable Code:**
- `createClient()` in `src/lib/supabase/client.ts` is a pure function that could be tested easily
- Form state setter `set()` pattern in quote page is testable
- Component rendering logic is straightforward

**Testing Challenges:**
- Heavy use of Supabase SDK requires mocking
- Tailwind classes make snapshot testing brittle (class-based styling)
- File upload logic (`e.target.files`) requires DOM testing utilities
- Form submission makes external API calls (needs mocking)

**Recommendations for Maintainability:**
- Extract validation logic from component into separate testable function
- Create Supabase client mock factory for reuse across tests
- Consider separating form submission logic from UI rendering
- Add data-testid attributes to key interactive elements for reliable test queries

---

*Testing analysis: 2026-03-26*
