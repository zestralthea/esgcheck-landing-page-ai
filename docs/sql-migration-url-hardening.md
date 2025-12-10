# SQL Migration URL Hardening

## Issue

Three SQL migration files contain hard-coded Supabase project URLs in database trigger functions:

1. `supabase/migrations/20250720124749_2cd530ed-c584-49fd-8132-011f22f7b6b0.sql`
2. `supabase/migrations/20250720132617_7c46296b-8501-4c2a-bf45-e64214c100f1.sql`
3. `supabase/migrations/20250720133014_6a1eb775-2f5a-4a35-ab66-894250756496.sql`

These files create a PostgreSQL trigger function that calls an edge function using `net.http_post()` with a hard-coded production URL:

```sql
PERFORM extensions.net.http_post(
  url := 'https://equtqvlukqloqphhmblj.supabase.co/functions/v1/send-waitlist-confirmation',
  ...
);
```

## Why This Is Problematic

1. **Environment Coupling**: The same migration runs in all environments (local, staging, production) but always calls the production edge function
2. **Testing Difficulties**: Development and staging databases cannot test against their own edge functions
3. **Security Risk**: Hard-coded URLs make it harder to rotate/change project URLs if needed
4. **Maintenance Burden**: URL changes require migration file updates

## PostgreSQL Limitations

Unlike application code, PostgreSQL trigger functions:
- Cannot access environment variables directly
- Cannot use Vite's `import.meta.env`
- Must use PostgreSQL-native configuration mechanisms

## Solution Options

### Option 1: Use Supabase's Built-in Function URL (Recommended)

Supabase provides a built-in way to get the current project's base URL through PostgreSQL settings:

```sql
CREATE OR REPLACE FUNCTION public.send_waitlist_confirmation_email()
RETURNS TRIGGER AS $$
DECLARE
  project_url TEXT;
  function_url TEXT;
BEGIN
  -- Get the current Supabase project URL from settings
  -- This is automatically set by Supabase in each environment
  project_url := current_setting('request.headers', true)::json->>'host';
  
  -- Construct the edge function URL
  function_url := 'https://' || project_url || '/functions/v1/send-waitlist-confirmation';
  
  -- Call the edge function
  PERFORM extensions.net.http_post(
    url := function_url,
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := json_build_object(
      'name', NEW.name,
      'email', NEW.email,
      'company', NEW.company
    ),
    timeout := '10s'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Pros:**
- Works automatically in all environments
- No hard-coded URLs
- Uses Supabase's built-in configuration

**Cons:**
- Slightly more complex function code
- Requires Supabase-specific configuration

### Option 2: Use PostgreSQL Custom Settings

Create environment-specific configuration using PostgreSQL's custom settings:

```sql
-- In migration or setup script
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';

-- In trigger function
CREATE OR REPLACE FUNCTION public.send_waitlist_confirmation_email()
RETURNS TRIGGER AS $$
DECLARE
  base_url TEXT;
  function_url TEXT;
BEGIN
  -- Get the base URL from database settings
  base_url := current_setting('app.settings.supabase_url', true);
  function_url := base_url || '/functions/v1/send-waitlist-confirmation';
  
  PERFORM extensions.net.http_post(
    url := function_url,
    ...
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Pros:**
- Clean separation of configuration from code
- Easy to update without changing function code

**Cons:**
- Requires manual configuration per environment
- Settings must be set before migrations run

### Option 3: Create New Migration to Update Functions (Immediate Fix)

Create a new migration that updates the existing functions to use dynamic URLs:

```sql
-- File: supabase/migrations/YYYYMMDD_update_trigger_functions_dynamic_urls.sql

-- Update the waitlist confirmation function to use dynamic URLs
CREATE OR REPLACE FUNCTION public.send_waitlist_confirmation_email()
RETURNS TRIGGER AS $$
DECLARE
  project_url TEXT;
  function_url TEXT;
BEGIN
  -- Try to get URL from settings, fallback to extracting from current context
  BEGIN
    project_url := current_setting('app.settings.supabase_url', false);
  EXCEPTION WHEN OTHERS THEN
    -- Fallback: construct from request headers or use Supabase's internal reference
    project_url := current_setting('request.jwt.claims', true)::json->>'iss';
  END;
  
  -- Construct edge function URL
  function_url := project_url || '/functions/v1/send-waitlist-confirmation';
  
  -- Call the edge function
  PERFORM extensions.net.http_post(
    url := function_url,
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := json_build_object(
      'name', NEW.name,
      'email', NEW.email,
      'company', NEW.company
    ),
    timeout := '10s'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Pros:**
- Fixes the issue immediately
- Works with existing migration history
- No need to modify old migration files

**Cons:**
- Adds another migration to maintain
- Old migration files still contain hard-coded URLs (historical record)

## Recommended Approach

**For Production Urgency:** Use Option 3 (new migration) to fix immediately

**For Long-term Maintenance:** Combine with Option 2 (custom settings) for clarity

**Implementation Steps:**

1. **Create a new migration** (Option 3) to update the function
2. **Set database configuration** for each environment:
   ```sql
   -- Run in each environment's Supabase SQL Editor
   ALTER DATABASE postgres SET app.settings.supabase_url = '<environment-specific-url>';
   ```

3. **Document the configuration** requirement in deployment checklist
4. **Add validation** to ensure settings are configured before deploying

## Deployment Checklist

When deploying to a new environment:

- [ ] Verify Supabase project URL for the environment
- [ ] Set `app.settings.supabase_url` in database settings
- [ ] Run migrations
- [ ] Test trigger function by creating a test waitlist entry
- [ ] Verify edge function is called correctly
- [ ] Check edge function logs for successful execution

## Testing

To test the trigger function locally:

```sql
-- Insert a test waitlist entry (trigger will fire automatically)
INSERT INTO public.waitlist (name, email, company)
VALUES ('Test User', 'test@example.com', 'Test Company');

-- Check if the edge function was called
-- (Check Supabase Functions logs in Dashboard)
```

## Alternative: Remove Trigger Entirely

Consider whether the database trigger is the best approach:

**Pros of keeping trigger:**
- Automatic, guaranteed execution on insert
- No application code needed

**Cons of keeping trigger:**
- Couples database to edge function availability
- Harder to test and debug
- Adds complexity to migrations

**Alternative approach:**
- Remove the database trigger
- Call edge function directly from application code after successful insert
- Provides better error handling and logging
- Easier to test and maintain

```typescript
// In application code (e.g., WaitlistForm submission)
const { data, error } = await supabase
  .from('waitlist')
  .insert({ name, email, company });

if (!error) {
  // Call edge function directly
  await supabase.functions.invoke('send-waitlist-confirmation', {
    body: { name, email, company }
  });
}
```

## Related Documentation

- [Environment Setup](../README.md#environment-setup)
- [Supabase Configuration Hardening](./supabase-configuration-hardening-plan.md)
- [Key Rotation Playbook](./key-rotation-playbook.md)
- [PostgreSQL Settings Documentation](https://www.postgresql.org/docs/current/config-setting.html)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)