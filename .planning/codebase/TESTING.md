# Testing Patterns

**Analysis Date:** 2026-03-04

## Test Framework Status

**Current State:** No test infrastructure configured

**Test Framework:** Not installed
- No Jest, Vitest, or other test runner in `package.json`
- No test files exist in source directory (`/app`, `/components`, `/lib`)
- No test configuration file (`jest.config.ts`, `vitest.config.ts`)
- No testing libraries installed (`@testing-library/react`, `@testing-library/jest-dom`)

**Dev Dependencies:** Only linting and type checking configured
- `typescript` for type checking
- `eslint` with Next.js config for linting
- No test runner dependencies

## Recommended Test Setup (For Future Implementation)

When tests are added to this project, follow these patterns based on the codebase structure:

### Framework Recommendation

**Use Vitest** with React Testing Library:
- Lightweight and fast for Next.js App Router
- Native ESM support
- TypeScript-first
- Similar API to Jest (easy transition if Jest becomes necessary)

**Installation:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Next.config.js (add for Vitest):**
```typescript
// tsconfig.json - update paths for test files
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@testing-library/react": ["node_modules/@testing-library/react"]
    }
  }
}
```

## Test File Organization

**Location Strategy:**
- Co-located with source files (preferred for this codebase)
- Pattern: `ComponentName.test.tsx` next to `ComponentName.tsx`

**Examples:**
```
components/
  NavBar.tsx
  NavBar.test.tsx          # Tests for NavBar component
  ContractorCard.tsx
  ContractorCard.test.tsx
  PostCard.tsx
  PostCard.test.tsx

lib/
  supabase.ts
  supabase.test.ts         # Tests for client initialization
  email.ts
  email.test.ts            # Tests for email functions

app/
  admin/
    actions.ts
    actions.test.ts        # Server action tests
```

**Naming Convention:**
- Test files: `[FileName].test.tsx` for components
- Test files: `[fileName].test.ts` for utilities/server actions
- Describe blocks: component or function name
- Test cases: describe behavior, not implementation

## Test Structure Pattern

Based on the codebase's patterns, test structure should follow this format:

**Component Test Example (for `NavBar.tsx`):**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import NavBar from '@/components/NavBar'

// Mock external dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))

describe('NavBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders navigation links when not authenticated', () => {
    // Arrange: Mock unauthenticated state
    // Act: Render component
    // Assert: Check rendered output
  })

  it('shows username when authenticated', async () => {
    // Test authenticated state
  })

  it('handles sign out click', async () => {
    // Test sign out flow
  })
})
```

**Server Action Test Example (for `/app/admin/actions.ts`):**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { approveApplication } from '@/app/admin/actions'

// Mock Supabase admin client
vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdmin: vi.fn(),
}))

// Mock email service
vi.mock('@/lib/email', () => ({
  sendApprovalEmail: vi.fn(),
}))

describe('approveApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates contractor record from application', async () => {
    // Arrange: Set up mocked admin client and test data
    // Act: Call approveApplication
    // Assert: Verify contractor created, certifications populated, email sent
  })

  it('handles missing user_id by looking up email', async () => {
    // Test fallback auth.admin.listUsers lookup
  })

  it('sends approval email non-blocking (doesn't fail if email fails)', async () => {
    // Test error handling for email failures
  })
})
```

**Integration Test Example (for `/app/contractors/page.tsx`):**
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ContractorsPage from '@/app/contractors/page'

vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdmin: vi.fn(),
}))

describe('ContractorsPage', () => {
  it('displays contractor cards for approved contractors', async () => {
    // Arrange: Mock Supabase query response
    // Act: Render page with search params
    // Assert: Contractor cards displayed
  })

  it('filters contractors by trade', async () => {
    // Test search params: ?trade=Welding
  })

  it('shows empty state when no contractors match', async () => {
    // Test no results scenario
  })

  it('includes job posts feed on page', async () => {
    // Test Promise.all fetching multiple data sources
  })
})
```

## Mocking Patterns

**Supabase Client Mocking:**
```typescript
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'user-123', email: 'test@example.com' } } },
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}))
```

**Admin Client Mocking:**
```typescript
vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdmin: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
    }),
    auth: {
      admin: {
        listUsers: vi.fn(),
      },
      getUser: vi.fn(),
      updateUser: vi.fn(),
    },
  }),
}))
```

**What to Mock:**
- All external Supabase client calls
- Email service (`@/lib/email.ts`)
- Next.js `useRouter` and `useSearchParams` hooks
- `fetch` calls to API routes
- File uploads to Supabase Storage

**What NOT to Mock:**
- Database query builders (test query construction)
- State management (test state transitions)
- Utility functions like `timeAgo` in `PostCard.tsx`
- Tailwind or styling (test behavior, not CSS)

## Fixtures and Test Data

**Test Data Location:** `__tests__/fixtures/`

**Contractor Fixture:**
```typescript
export const mockContractor = {
  id: 'contractor-123',
  user_id: 'user-123',
  full_name: 'John Smith',
  trade: 'Welding',
  specialties: ['TIG Welding', 'Pipe Welding'],
  location_city: 'Houston',
  location_state: 'TX',
  years_experience: 15,
  bio: 'Certified welder with 15 years experience',
  phone: '555-0000',
  email: 'john@example.com',
  website: 'https://johnwelding.com',
  profile_photo_url: null,
  status: 'approved',
  created_at: '2026-01-15T10:00:00Z',
}
```

**Application Fixture:**
```typescript
export const mockApplication = {
  id: 'app-123',
  user_id: 'user-123',
  submitted_at: '2026-01-10T10:00:00Z',
  status: 'pending',
  full_name: 'Jane Doe',
  trade: 'Electrical',
  specialties: ['Commercial'],
  location_city: 'Dallas',
  location_state: 'TX',
  years_experience: 8,
  bio: 'Licensed electrician',
  phone: '555-1111',
  email: 'jane@example.com',
  website: null,
  document_urls: ['https://storage.example.com/app-123/license.pdf'],
}
```

## Coverage

**No enforcement at this time**

When tests are added, establish coverage goals:
- **Target:** 80% line coverage for critical paths
- **Critical paths to prioritize:**
  - Authentication flows (`/auth/page.tsx`)
  - Server actions (`approveApplication`, `rejectApplication`)
  - API routes (`/api/contact/[id]/route.ts`)
  - Form validation (`/apply/page.tsx`)
  - Search/filter logic (`SearchFilters.tsx`)

**View Coverage (when Vitest is configured):**
```bash
npm run test -- --coverage
```

## Test Types

**Unit Tests:**
- Scope: Single function or component in isolation
- Approach: Mock external dependencies, test behavior
- Examples:
  - `NavBar.test.tsx`: Test dropdown toggle, sign out, username display
  - `timeAgo()` utility: Test time formatting logic
  - Form validation in `/apply/page.tsx`: Test password matching, min length

**Integration Tests:**
- Scope: Multiple components or modules working together
- Approach: Mock Supabase responses, test full user flows
- Examples:
  - `/contractors/page.tsx` with search filters
  - Profile page with avatar upload and post creation
  - Application submission with document upload

**E2E Tests:**
- Status: Not planned for initial testing phase
- Future: Consider Cypress or Playwright after unit/integration test coverage is solid
- Focus areas when added:
  - Contractor application flow
  - Search and directory browsing
  - Admin approval workflow

## Common Test Patterns

**Async Testing:**

All Supabase calls are asynchronous and return promises. Use `waitFor` for async operations:

```typescript
it('loads contractor data on mount', async () => {
  render(<ContractorPage contractorId="123" />)

  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText('John Smith')).toBeInTheDocument()
  })
})

// Or with findBy variants (automatically waits)
it('displays loaded contractor', async () => {
  render(<ContractorPage contractorId="123" />)
  const name = await screen.findByText('John Smith')
  expect(name).toBeInTheDocument()
})
```

**Error Testing:**

Test error states and error messages:

```typescript
it('shows error message on upload failure', async () => {
  vi.mocked(supabase.storage.from).mockReturnValue({
    upload: vi.fn().mockResolvedValue({
      error: { message: 'Quota exceeded' },
    }),
  })

  const user = userEvent.setup()
  render(<ProfilePage />)

  const fileInput = screen.getByRole('button', { name: /upload/i })
  await user.click(fileInput)

  const errorMsg = await screen.findByText(/Quota exceeded/)
  expect(errorMsg).toBeInTheDocument()
})
```

**Form Interaction Testing:**

Test form submission and state changes:

```typescript
it('submits form with valid data', async () => {
  const mockSubmit = vi.fn()
  const user = userEvent.setup()

  render(<ApplyForm onSubmit={mockSubmit} />)

  await user.type(screen.getByLabelText(/Full Name/), 'John Smith')
  await user.type(screen.getByLabelText(/Email/), 'john@example.com')
  await user.type(screen.getByLabelText(/Password/), 'password123')

  const submitBtn = screen.getByRole('button', { name: /Submit/ })
  await user.click(submitBtn)

  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
      full_name: 'John Smith',
    }))
  })
})
```

**Authentication Testing:**

Test auth state changes and protected routes:

```typescript
it('redirects to auth when not authenticated', () => {
  vi.mocked(supabase.auth.getSession).mockResolvedValue({
    data: { session: null },
  })

  render(<ProfilePage />)
  expect(mockRouter.replace).toHaveBeenCalledWith('/auth')
})

it('shows pending message when application is pending', async () => {
  vi.mocked(supabase.auth.getSession).mockResolvedValue({
    data: { session: { user: { id: 'user-123' } } },
  })

  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: { id: 'app-123', status: 'pending' },
    }),
  })

  render(<ProfilePage />)
  const msg = await screen.findByText(/Application Under Review/)
  expect(msg).toBeInTheDocument()
})
```

## Vitest Configuration (When Implemented)

**File: `vitest.config.ts`**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

**File: `vitest.setup.ts`**
```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    toString: vi.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))
```

**Update `package.json` scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  }
}
```

---

*Testing analysis: 2026-03-04*

**Note:** This codebase currently has no test infrastructure. The patterns and recommendations above are based on the codebase's architecture, naming conventions, and dependency structure. Implementation is recommended before production deployment.
