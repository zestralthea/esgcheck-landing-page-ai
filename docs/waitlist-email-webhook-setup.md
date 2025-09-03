# Waitlist Email Webhook Setup

This project now uses a database webhook to send confirmation emails when a new waitlist entry is created.

Flow overview:
1) Client submits form -> Edge Function [index.ts](supabase/functions/verify-waitlist-signup/index.ts) inserts into public.waitlist.
2) Supabase Database Webhook (INSERT on public.waitlist) calls Edge Function [index.ts](supabase/functions/send-waitlist-confirmation/index.ts), which sends an email via Infomaniak SMTP and updates the waitlist row with confirmation_status/confirmation_sent_at.

Updated components:
- Edge Function: [index.ts](supabase/functions/verify-waitlist-signup/index.ts)
- Edge Function (webhook): [index.ts](supabase/functions/send-waitlist-confirmation/index.ts)
- Migration: [20250816000001_alter_waitlist_add_confirmation.sql](supabase/migrations/20250816000001_alter_waitlist_add_confirmation.sql)

Required environment variables
Set these in the Supabase Functions environment for both functions:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- CLOUDFLARE_TURNSTILE_SECRET_KEY (verify-waitlist-signup only)
- INFOMANIAK_SMTP_HOST
- INFOMANIAK_SMTP_PORT (e.g., 587 or 465)
- INFOMANIAK_SMTP_USER
- INFOMANIAK_SMTP_PASSWORD
- INFOMANIAK_SMTP_FROM (e.g., info@esgcheck.ch)
- SUPABASE_WEBHOOK_SECRET (shared secret to validate DB webhook signatures in send-waitlist-confirmation)

Deploy and migrate
1) Run migrations (ensure waitlist has tracking columns):
   - [20250816000001_alter_waitlist_add_confirmation.sql](supabase/migrations/20250816000001_alter_waitlist_add_confirmation.sql)

2) Deploy Edge Functions:
   - [index.ts](supabase/functions/verify-waitlist-signup/index.ts)
   - [index.ts](supabase/functions/send-waitlist-confirmation/index.ts)

Configure Database Webhook (UI)
1) In Supabase Dashboard: Database -> Webhooks -> Create webhook
2) Source: Postgres changes
3) Table: public.waitlist
4) Events: INSERT
5) Payload: Record (include the new row)
6) Endpoint URL:
   https://YOUR_PROJECT_REF.functions.supabase.co/send-waitlist-confirmation
7) Secret: Set to the same value as SUPABASE_WEBHOOK_SECRET in function env
8) Save

What the webhook function expects
- Method: POST
- Header: x-supabase-signature containing an HMAC-SHA256 of the raw JSON body using SUPABASE_WEBHOOK_SECRET (Supabase DB Webhooks add this automatically when configured with a secret).
- Body: A JSON object that includes the inserted row. The function accepts a variety of common shapes and extracts record/new/data as needed. It uses email, name (or full_name), company (or company_name), and id.

Behavior
- On success:
  - Email sent via Infomaniak SMTP
  - Row updated: confirmation_status='sent', confirmation_sent_at=NOW()
- On failure:
  - Returns 500; the row is not updated (or may be updated to 'failed' in the future)

Testing (manual)
1) Insert a row (use SQL Editor in Supabase). Example:
   INSERT INTO public.waitlist (email, name, company)
   VALUES ('test@example.com', 'Test User', 'Example AG');

2) Monitor Function logs
   - send-waitlist-confirmation should receive the webhook and send the email
   - The waitlist row should update with confirmation_status and confirmation_sent_at

Client request path (already wired)
- Form -> [useWaitlistForm.tsx](src/hooks/useWaitlistForm.tsx) -> POST to verify-waitlist-signup -> [index.ts](supabase/functions/verify-waitlist-signup/index.ts) inserts row.
- Turnstile is verified server-side; failures return HTTP 400.

Notes about TypeScript diagnostics in VS Code
- Edge Functions use Deno (Supabase Edge Runtime). Imports like jsr: and npm: are valid at runtime but may show editor diagnostics locally if the Deno language server is not enabled/configured.
- Deno APIs (e.g., Deno.serve) are available in the Edge runtime.

Security considerations
- Service Role Key is used in server-side functions only; never expose it to the client.
- Webhook secrets prevent spoofed calls to the email function.
- Keep SMTP credentials in the Functions environment, not in source.

Operational tips
- If you need idempotency for emails, consider a unique index on waitlist.email (if desired) or keep a server-side guard to only send once when confirmation_status is not 'sent'.
- For retry behavior, implement your preferred strategy (e.g., mark 'failed' and reprocess with a cron or worker). The current approach performs a single attempt on each webhook call.