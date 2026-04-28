# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Commands

```bash
npm run dev          # Start the Vite dev server
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run lint         # Run ESLint
npm run preview      # Preview the production build locally
```

There is no unit or integration test suite configured.

## Architecture

ESGCheck is a React 18 + TypeScript landing page built with Vite, Tailwind CSS, Framer Motion, React Helmet Async, and local shadcn-style UI primitives.

Path alias: `@/*` maps to `./src/*`.

## Structure

- `src/pages/` - route-level pages: landing page, email confirmation page, and thank-you page
- `src/components/` - page sections, shared layout components, and UI primitives
- `src/contexts/` - language routing and translation dictionaries
- `src/lib/` - shared utilities and motion presets
- `public/` - deployed static assets served from the site root
- `docs/email/` - Brevo email templates
- `docs/guides/` - project guides
- `docs/product/` - product and positioning source material
- `docs/assets/` - supporting documentation assets that are not served directly

## Routing

Routing is handled manually in `src/App.tsx` using helpers from `src/contexts/LanguageContext.tsx`.

Supported pages:

- `home` -> `/{locale}/`
- `confirmation` -> `/{locale}/confirmation/`
- `thankYou` -> `/{locale}/thank-you/`

The default locale is German (`de`).

## Notes

- Keep public asset URLs stable when referenced by Brevo templates, especially `/email-logo-mark.png` and `/email-confirmation-hero.png`.
- Keep German copy in Swiss High German. Use `ss`, not the German sharp s.
- Keep confirmation and thank-you pages `noindex`.
