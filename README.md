# ESGCheck Landing Page

React/Vite landing page for ESGCheck. The app includes localized landing pages, an early-access signup flow, a pre-confirmation page, and a post-confirmation thank-you page.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn-style local UI primitives

## Project Structure

- `src/components/` - reusable page sections, shared layout pieces, and local UI primitives
- `src/pages/` - route-level pages: landing page, email confirmation page, and thank-you page
- `src/contexts/` - language routing and translation dictionaries
- `src/lib/` - shared utilities and motion presets
- `public/` - deployed static assets served from the site root
- `docs/email/` - Brevo email templates
- `docs/guides/` - project guides, including localization guidance
- `docs/product/` - product and positioning source documents
- `docs/assets/` - supporting documentation assets that are not served directly

## Local Development

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

Build for production:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Environment

No environment variables are required for the frontend build. The early-access form is embedded through Brevo.
