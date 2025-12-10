# Testing, Tooling, and Documentation Improvement Plan

## 1. Objectives
- Establish automated safety nets (linting, unit, integration, E2E) to prevent regressions and enforce security posture.
- Normalize tooling across Node/Bun ecosystems to avoid dependency drift.
- Document operational workflows so future engineers can implement and maintain the safeguards described in other remediation plans.

## 2. Current Gaps
- No automated tests exist; QA is fully manual.
- Mixed package managers (`bun.lockb`, `package-lock.json`) create confusion and potential dependency mismatches.
- Security-sensitive flows (Edge functions, Supabase RPCs) lack integration tests or post-deploy smoke checks.
- Documentation for environment setup, secret rotation, and incident response is incomplete or missing.
- No CI pipeline enforcing coding standards, test coverage, or configuration validation.

## 3. Testing Strategy

### 3.1 Static Analysis & Linting
1. **ESLint**: Expand rule set to include security plugins (e.g., `eslint-plugin-security`, `eslint-plugin-jsx-a11y`).
2. **TypeScript Strictness**: Enable strict mode in `tsconfig.json` (if not already) and fix resulting issues.
3. **Env Validation**: Add pre-build script using Zod schema to validate required environment variables (ensures Supabase config hardening plan is enforced).

### 3.2 Unit Tests
1. Adopt Vitest or Jest (Vitest preferable due to Vite integration).
2. Target critical modules first:
   - `useFeatureFlags`, ensuring flag gating works post DEV_MODE removal.
   - `securityUtils` (CSRF token logic, secure request wrapper).
   - `rateLimiting`.
3. Provide mock utilities for Supabase client interactions (use MSW or local mocks).

### 3.3 Integration Tests
1. Use Playwright (preferred) or Cypress for browser-level testing:
   - Auth flow (sign-in/sign-out).
   - Waitlist submission (including rate limiting and i18n toggles).
   - Admin-only actions (ensuring gating works in UI and API responses).
2. Configure tests to run against staging Supabase instance with seeded data.

### 3.4 Edge Function Testing
1. Create Deno test harness for `supabase/functions/*` to validate behavior with mocked Supabase client and environment variables.
2. Add post-deployment smoke test script that hits each Edge function endpoint with expected payload.

### 3.5 Coverage & Reporting
- Configure coverage thresholds (e.g., 80% statements/branches).
- Publish reports via CI artifacts; highlight critical files below threshold.

## 4. Tooling Normalization
1. Select **npm** (or bun) as single package manager; remove conflicting lockfile.
2. Update `README.md` to specify chosen manager, Node version, and install steps.
3. Add `.nvmrc`/`.node-version` to pin Node runtime (if using npm).
4. Introduce `lint-staged` + `husky` for pre-commit hooks (formatting, type checks).
5. Optionally adopt `biome`/`prettier` for consistent formatting if current tooling lacking.

## 5. Continuous Integration Pipeline

### 5.1 Proposed Workflow (GitHub Actions example)
1. **Install Dependencies** (cache based on lockfile hash).
2. **Static Checks**: run `npm run lint`, `tsc --noEmit`, env validation script.
3. **Unit Tests**: run `vitest run --coverage`.
4. **Integration Tests**: optionally in separate job with Playwright (can be triggered on demand).
5. **Build Check**: `npm run build` with production env values (ensures Vite build passes).
6. **Artifact Upload**: store coverage report, test screenshots, etc.

### 5.2 Secrets Management
- CI environment must inject non-production Supabase keys and feature flag toggles.
- Document secure storage of secrets (GitHub secrets, Azure Key Vault, etc.).

## 6. Documentation Improvements
1. Update `README.md` with:
   - Environment setup instructions.
   - Testing commands.
   - Description of feature flag usage.
2. Create new docs:
   - `docs/operations/incident-response.md`: steps to respond to key leaks, security incidents.
   - `docs/qa/i18n-checklist.md` (from UX plan).
   - `docs/deployment/supabase-post-deploy-checklist.md` covering Edge function smoke tests.
3. Maintain changelog for major security-related updates.

## 7. Rollout Checklist
1. Choose package manager and cleanup lockfiles.
2. Configure ESLint/TypeScript strict rules; fix violations.
3. Install Vitest/Playwright, create baseline tests.
4. Implement CI pipeline with gating (fail on lint/test/build issues).
5. Add coverage thresholds and documentation updates.
6. Schedule knowledge transfer/demo for team.

## 8. Acceptance Criteria
- Repository contains automated tests with meaningful coverage.
- CI pipeline blocks merges/deploys when lint/tests/build fail.
- Single package manager enforced; onboarding instructions clear.
- Edge functions and critical user flows covered by automated tests.
- Documentation updated to reflect new workflows and runbooks.

## 9. Future Enhancements
- Integrate Dependabot/Renovate for dependency updates with auto test runs.
- Add performance monitoring (Lighthouse CI) for landing page and dashboard.
- Implement security scanning (Snyk, npm audit) as part of CI.
- Introduce canary deployments for Edge functions with automated rollback on failure signals.