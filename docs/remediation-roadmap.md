# ESGCheck Security & Reliability Remediation Roadmap

## Overview
This roadmap consolidates the identified risks, proposed remediations, and implementation sequence required to harden the ESGCheck platform. It is organized into thematic workstreams that can be executed in parallel where dependencies allow.

---

## Workstream A — Secrets & Environment Hygiene
**Goal:** Eliminate hard-coded credentials and enforce safe configuration management.

### Key Actions
1. Implement runtime configuration loader and Supabase client factory (see [`supabase-configuration-hardening-plan`](docs/supabase-configuration-hardening-plan.md)).
2. Rotate Supabase anon/service keys and JWT signing secret.
3. Update `.env.example`, README, and CI configuration to require explicit env declaration.
4. Add environment sanity checks to prevent production endpoints in non-prod environments.

### Milestones
- Runtime configuration module merged.
- Keys rotated and old credentials revoked.
- CI failing on missing env vars or production URL misuse outside prod.

---

## Workstream B — Client Safeguards & Feature Gating
**Goal:** Prevent unauthorized edge function invocations and enforce server-controlled feature access.

### Key Actions
1. Remove auto-test behavior and gate debug tools (see [`client-safeguards-and-feature-gating-plan`](docs/client-safeguards-and-feature-gating-plan.md)).
2. Introduce `secureInvoke` wrapper with CSRF, rate limiting, and feature flag validation.
3. Refactor waitlist and upload flows to use environment-aware Supabase function URLs.
4. Audit and remove remaining console logging and ad-hoc navigation patterns.

### Milestones
- Debug buttons hidden in production without flag/role.
- Rate limiting feedback integrated for waitlist and upload flows.
- No direct `supabase.functions.invoke` calls outside secure wrapper.

---

## Workstream C — Admin Experience Hardening
**Goal:** Ensure privileged operations execute through secured channels with full auditing.

### Key Actions
1. Build dedicated admin edge functions for feature toggles, profile access, and email verification (see [`admin-experience-hardening-plan`](docs/admin-experience-hardening-plan.md)).
2. Enforce admin JWT claims and double-check role via Supabase profiles.
3. Integrate CSRF tokens and secure request helper across admin UI.
4. Create `admin_audit_log` table and surface recent activity in dashboard.

### Milestones
- All admin mutations routed through edge functions with audit entries.
- RLS tests pass, denying anon direct mutations.
- CSRF token required for admin operations.

---

## Workstream D — UX & i18n Cleanup
**Goal:** Deliver consistent, localized UX free of debugging noise.

### Key Actions
1. Centralize translations to structured JSON files and fix encoding artifacts (see [`ux-i18n-cleanup-plan`](docs/ux-i18n-cleanup-plan.md)).
2. Replace direct navigation with router hooks and consistent focus management.
3. Standardize notification patterns and remove unsolicited toasts.
4. Add localization QA checklist and automated i18n linting.

### Milestones
- Translation loader with schema validation in place.
- Dashboard free of auto-triggered toasts.
- i18n lint passes in CI; manual QA checklist completed.

---

## Workstream E — Testing, Tooling & Documentation
**Goal:** Establish automated safeguards and clear operational documentation.

### Key Actions
1. Normalize package manager usage and dependencies (see [`testing-tooling-improvements-plan`](docs/testing-tooling-improvements-plan.md)).
2. Introduce Vitest unit tests, Playwright integration tests, and edge function harness.
3. Configure CI pipeline with linting, testing, build verification, and coverage reporting.
4. Create supporting runbooks (incident response, rotation checklists, QA guides).

### Milestones
- CI pipeline blocking merges on lint/test/build failures.
- Baseline test coverage established for critical flows.
- Operational docs published and linked from README.

---

## Sequencing & Dependencies

1. **A1 → A2 → A3**: Secure configuration must precede feature gating changes.
2. **B1 & D1** can run after config loader exists; removing auto-tests depends on new gating.
3. **C1-C3** rely on secrets workstream (service role keys) plus secure request utilities.
4. **E1** should occur early to avoid tooling drift; **E2-E3** can start once Workstreams A-C set baselines.
5. UX updates (D2-D4) follow once debugging artifacts removed to avoid conflicting changes.

---

## Risk Mitigation & Monitoring

- **Audit Logging:** Implement for all admin and edge function interactions (Workstream C).
- **Supabase Metrics:** Monitor function call volume before/after safeguards to confirm cost reductions.
- **Alerting:** Configure notifications for failed CI runs and security incidents (future enhancement).
- **Post-Deployment QA:** Schedule smoke tests after each major workstream release.

---

## Next Steps Checklist
- [ ] Appoint owners for each workstream.
- [ ] Schedule key rotation window.
- [ ] Draft communication plan outlining changes to stakeholders.
- [ ] Set up weekly status reviews to track progress.

---

By following this roadmap, the ESGCheck platform will achieve significantly stronger security posture, improved user experience, and a maintainable engineering workflow ready for production scale.