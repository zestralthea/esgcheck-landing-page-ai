# Prioritized Remediation Themes

## 1. Secrets and Environment Hygiene (Critical)
- Hard-coded Supabase URL and anon key in [`createClient()`](src/integrations/supabase/client.ts:7) expose production credentials to anyone loading the bundle.
- Client-side modules directly call production edge endpoints such as [`supabase.functions.invoke()` auto-tests](src/components/ESGUploadPanel.tsx:57) and the waitlist fetch in [`useWaitlistForm`](src/hooks/useWaitlistForm.tsx:53) instead of using environment-specific routing.
- `.env` scaffolding is unused; production secrets live in source, increasing rotation cost and breach blast radius.

**Immediate Actions**
1. Introduce environment-specific configuration loader that reads from runtime environment variables.
2. Rotate leaked Supabase anon/service keys and regenerate JWT signing secrets.
3. Establish secret management playbook and automate local/dev env injection.

## 2. Client Safeguards and Edge Invocation Controls (Critical)
- The dashboard upload panel runs an automatic edge function invocation on every mount via [`useEffect`](src/components/ESGUploadPanel.tsx:57), producing unnecessary costs and exposing internal test tooling.
- Manual “Test Edge Function” button is publicly available, enabling anonymous abuse of paid AI calls.
- Waitlist submissions skip rate limiting and rely solely on Cloudflare Turnstile, with no client-side throttling despite the unused [`rateLimiter`](src/lib/rateLimiting.ts:1).

**Immediate Actions**
1. Remove auto-invocation and wrap manual test actions behind feature flags plus privileged roles.
2. Introduce client request guards that enforce authenticated context and debounce analytics/costly calls.
3. Wire up the existing [`rateLimiter`](src/lib/rateLimiting.ts:39) for form submissions and dashboard actions, surfacing cooldown feedback.

## 3. Feature Gating, RBAC, and RLS Validation (High)
- DEV_MODE overrides in [`useFeatureFlags`](src/hooks/useFeatureFlags.tsx:6) permanently enable gated features even in production, bypassing backend flags.
- Admin page performs privileged mutations directly from the anon client via [`supabase.from('feature_flags').update`](src/pages/Admin.tsx:80) and [`supabase.rpc('manually_verify_user')`](src/pages/Admin.tsx:167) with only client-side role checks.
- Reliance on RLS without server-side verification risks privilege escalation if policies misconfigure.

**Immediate Actions**
1. Remove DEV_MODE shortcuts and require explicit flag evaluation before rendering gated experiences.
2. Restrict admin mutations to secured edge functions or server-side APIs that verify JWT claims.
3. Audit RLS policies and add defense-in-depth checks to prevent anon access to privileged tables.

## 4. Session Integrity, CSRF, and Security Utilities (High)
- CSRF token is generated in [`CSRFProtection.setToken()`](src/lib/securityUtils.ts:21) but never appended to outbound requests, leaving cross-site request forgery unmitigated.
- Security helpers such as [`RequestSecurity.secureRequest`](src/lib/securityUtils.ts:209) and session monitoring aren’t integrated into form submissions or fetch flows.
- CSP meta tag is injected client-side by [`CSPHelper.setMetaCSP()`](src/lib/securityUtils.ts:265), which is too late to prevent initial script execution.

**Immediate Actions**
1. Integrate CSRF token transmission and validation for state-mutating requests.
2. Wrap mutation calls (e.g., uploads, flag toggles) with `RequestSecurity` to standardize checks and throttling.
3. Move CSP headers to the HTTP layer or server-rendered HTML to enforce on first paint.

## 5. UX, Content Integrity, and Observability (Medium)
- Dashboard loads produce unsolicited auto-test toasts from [`setTestResult`](src/components/ESGUploadPanel.tsx:47), degrading UX.
- Translation strings contain encoding artifacts around [`LanguageContext` data](src/contexts/LanguageContext.tsx:151) and fallback copy, signaling missing QA.
- Production bundles ship console logging and direct [`window.location.href`](src/pages/Admin.tsx:250) navigations without centralized routing or telemetry.

**Immediate Actions**
1. Remove or gate UX debugging elements to maintain a professional experience.
2. Audit translation files with automated linting/CI checks to ensure encoding correctness and key coverage.
3. Standardize logging and navigation utilities, enforcing silent production builds.

## 6. Tooling, Testing, and Governance (Medium)
- No automated tests exist; all quality checks are manual, increasing regression risk.
- Mixed package managers (`bun.lockb` and `package-lock.json`) suggest inconsistent tooling; dependency management is brittle.
- Documentation around environment usage is stale, and there is no codified incident response process for leaked keys.

**Immediate Actions**
1. Stand up a testing baseline (lint, unit tests for hooks, integration tests for edge functions) and enforce via CI.
2. Choose a single package manager, regenerate lockfiles, and document setup in README plus `.env.example`.
3. Create operational runbooks covering secret rotation, feature flag governance, and Supabase deployments.