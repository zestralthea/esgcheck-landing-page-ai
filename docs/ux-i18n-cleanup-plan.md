# UX & i18n Cleanup Plan

## 1. Objectives
- Remove debugging artifacts and intrusive toasts from user-facing flows.
- Ensure translation integrity across English, German, and French locales.
- Establish a repeatable QA process for copy validation and localization coverage.
- Improve UX responsiveness by standardizing loading states and navigation patterns.

## 2. Identified Issues
- Dashboard auto-tests trigger repetitive toasts (`Auto-Test Successful/Failed`) via [`ESGUploadPanel`](src/components/ESGUploadPanel.tsx:92), confusing end users.
- Multiple components use `window.location.href` redirects (e.g., [`Admin.tsx`](src/pages/Admin.tsx:250)), bypassing SPA routing and causing full reloads.
- Translation strings include mojibake artifacts (“Aú”, “ƒ?İ”) traced to improper encoding in [`LanguageContext`](src/contexts/LanguageContext.tsx).
- Suspense fallback copy is inconsistent and untranslated (e.g., `Loading...` repeated across tabs without localization).
- Lack of visual feedback for rate-limited or disabled actions; toasts appear without context.
- Missing QA checklist for verifying translation completeness, pluralization, and fallback behavior.

## 3. Cleanup Roadmap

### 3.1 Debug Artifact Removal
1. Remove auto-invocation effect from `ESGUploadPanel` (covered in client safeguard plan).
2. Gate “Test Edge Function” button behind `debug_tools_enabled` flag and admin role.
3. Audit console logs across components; replace with structured logger or remove for production builds.

### 3.2 Toast & Notification Hygiene
1. Define `NotificationPolicy` that categorizes toasts (success, warning, error) with consistent copy.
2. Ensure toasts triggered by background tasks include context (e.g., “Analysis queued” vs. success).
3. Introduce inline status indicators for long-running actions (upload, analysis) to reduce toast dependency.

### 3.3 Navigation Consistency
1. Replace direct `window.location.href` assignments with router navigation (`useNavigate` from react-router).
2. Add accessible focus management when navigating within dashboard tabs.
3. Standardize breadcrumb and back button behavior using shared `BreadcrumbNav`.

## 4. i18n Strategy

### 4.1 Source of Truth
- Move translation dictionaries out of component files into structured resources (e.g., `src/i18n/en.json`).
- Build a localization loader that validates schema using Zod (keys per section).
- Support future integration with localization platforms by keeping plain JSON.

### 4.2 Encoding & QA
1. Re-encode translation files in UTF-8 without BOM.
2. Run script to detect non-standard ASCII sequences and missing keys (`i18n-lint`).
3. Add CI step verifying:
   - All languages share same key set.
   - No untranslated sentinel values (e.g., `TODO_TRANSLATE`).
   - Strings avoid special characters unless intentional (accented letters allowed).

### 4.3 Runtime Validation
- Provide `useTranslation` hook that logs missing translations with warning, falling back to default locale.
- Implement React Suspense fallback component pulling localized strings instead of hard-coded English.

## 5. UX Enhancements
- Create skeleton loaders for dashboard cards to avoid empty flashes.
- Standardize form inputs using `FormField` component with localized validation messages from [`validationSchemas`](src/lib/validationSchemas.ts).
- Introduce `UserFeedbackContext` to unify modals, toasts, and inline alerts for consistent design.

## 6. Testing & QA Process
1. Write Cypress/Playwright tests that:
   - Switch languages via `LanguageToggle` and confirm key UI strings update.
   - Verify toasts appear only on user-triggered actions.
2. Add manual QA checklist:
   - “No debug toasts on dashboard load.”
   - “Navigation retains SPA state changes.”
   - “Waitlist form error messages localized across locales.”
3. Create `docs/qa/i18n-checklist.md` outlining review steps, including sample stakeholder sign-off template (future deliverable).

## 7. Rollout Plan
1. Refactor translation storage and implement loader.
2. Update components to consume `t()` helper for fallback copy.
3. Remove debugging toasts and replace direct navigation.
4. Implement QA scripts and CI checks.
5. Conduct accessibility review (focus states, ARIA labels) post refactor.

## 8. Acceptance Criteria
- No production-facing auto toasts or debug logs remain.
- All user-visible strings sourced via translation files with coverage across locales.
- Navigation actions use router APIs; no full-page reloads within app.
- CI pipeline fails if translation schema diverges or corrupted characters detected.
- QA checklist executed with sign-off documented for release.

## 9. Future Considerations
- Introduce ICU message format for pluralization and gendered language support.
- Integrate analytics to monitor error toast frequency, enabling proactive UX tuning.
- Plan for professional localization review before GA launch.