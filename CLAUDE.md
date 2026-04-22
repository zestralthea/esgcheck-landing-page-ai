# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on http://localhost:8080
npm run build        # Production build (runs env validation first)
npm run build:dev    # Dev build (runs env validation first)
npm run lint         # Run ESLint
npm run preview      # Preview production build locally
npm run validate:env # Validate required environment variables
```

There is no test framework — no unit/integration tests exist in this codebase.

## Architecture

**Stack:** React 18 + TypeScript, Vite 5 (SWC), Tailwind CSS + shadcn/ui, React Router v6, TanStack Query, Supabase (PostgreSQL + Auth + Edge Functions).

**Path alias:** `@/*` maps to `./src/*`.

### Frontend Structure

- [src/pages/](src/pages/) — Route pages: Index, Auth, Dashboard, Admin, NotFound (all lazy-loaded)
- [src/components/](src/components/) — Feature components and 40+ shadcn/ui primitives in [src/components/ui/](src/components/ui/)
- [src/contexts/](src/contexts/) — `AuthContext` (Supabase auth state) and `LanguageContext` (i18n translations)
- [src/hooks/](src/hooks/) — Custom hooks: `useWaitlistForm`, `useWaitlistModal`, `useTurnstile`, `useFeatureFlags`, `useSmoothScroll`
- [src/integrations/supabase/](src/integrations/supabase/) — Supabase `client.ts` and auto-generated `types.ts` (do not hand-edit types.ts)
- [src/lib/](src/lib/) — Utility libraries (rate limiting, etc.)
- [src/utils/](src/utils/) — Utility functions
- [src/config/env.ts](src/config/env.ts) — Typed environment variable access (use this instead of `import.meta.env` directly)

### Backend — Supabase

All backend logic runs in [supabase/functions/](supabase/functions/) as Deno-based Edge Functions:

| Function | Auth Required | Purpose |
|---|---|---|
| `analyze-esg-report` | Yes | OpenAI-powered ESG analysis |
| `secure-file-upload` | Yes | File upload validation |
| `secure-document-access` | Yes | Document access control |
| `admin-operations` | Yes | Admin actions |
| `security-scanner` | Yes | Security scanning |
| `verify-waitlist-signup` | No | Waitlist with Turnstile CAPTCHA |
| `send-waitlist-confirmation` | No | Email confirmations |
| `delete-user` | Yes | User cleanup |
| `get-users-with-auth-status` | Yes | User enumeration |

Database schema is documented in [docs/database-schema-final.md](docs/database-schema-final.md). Migrations live in [supabase/migrations/](supabase/migrations/).

### Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Edge function secrets (set in Supabase dashboard, not `.env`):
```
OPENAI_API_KEY
PDFMONKEY_API_KEY
PDFMONKEY_TEMPLATE_ID
```

The build will fail if required env vars are missing or malformed (validated by [scripts/validate-env.js](scripts/validate-env.js)).

### Key Design Patterns

- **Data fetching:** TanStack Query wraps all Supabase queries; use `useQuery`/`useMutation` hooks
- **Auth:** Access auth state via `useAuth()` from `AuthContext` — never read Supabase auth directly in components
- **Forms:** React Hook Form + Zod for all forms; schemas defined co-located with the form component
- **Routing:** All routes defined in [src/App.tsx](src/App.tsx) using React Router `<Routes>`
- **UI components:** Prefer existing shadcn/ui components from [src/components/ui/](src/components/ui/) before creating new ones
- **Styling:** Tailwind utility classes; custom design tokens defined as HSL CSS variables in [src/index.css](src/index.css)
- **Notifications:** Use `sonner` toast via `import { toast } from "sonner"`

### Deployment

This project is deployed via the [Lovable](https://lovable.dev) platform. The `lovable-tagger` dev dependency instruments components for the Lovable visual editor — do not remove it.
