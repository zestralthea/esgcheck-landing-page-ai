# Supabase Key Rotation Playbook

## Overview

This playbook provides step-by-step instructions for rotating Supabase API keys to maintain security hygiene, especially after accidental exposure or as part of regular security maintenance.

## When to Rotate Keys

**Immediate rotation required:**
- Keys accidentally committed to version control
- Keys exposed in logs, screenshots, or documentation
- Keys shared in insecure channels (email, chat, etc.)
- Suspected unauthorized access to keys
- Former team member had access to keys

**Regular rotation schedule:**
- Every 90 days for production environments
- After major team changes
- As part of security audits

## Pre-Rotation Checklist

- [ ] Identify all environments using the current keys (production, staging, development)
- [ ] Document all applications/services that will need updated keys
- [ ] Schedule rotation during low-traffic period (if production)
- [ ] Notify team members of upcoming rotation
- [ ] Ensure you have admin access to Supabase project
- [ ] Have deployment access to update environment variables

## Rotation Steps

### Step 1: Generate New Keys (Supabase Dashboard)

1. **Access Supabase Dashboard**:
   - Navigate to your project at https://supabase.com/dashboard
   - Go to: Project Settings > API

2. **Create New Anonymous Key**:
   - Click on "Generate new anon key" (if available)
   - **OR** regenerate the key by clicking the refresh icon
   - Copy the new `anon` (public) key immediately
   - Store it securely in a password manager

3. **Service Role Key** (if rotating):
   - Only rotate if service role key was also exposed
   - Generate new service role key
   - **WARNING**: This is a privileged key - handle with extreme care

### Step 2: Update Environment Variables

#### Local Development

1. **Update `.env` file**:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=<NEW_ANON_KEY>
   ```

2. **Restart development server**:
   ```sh
   npm run dev
   # Verify the app loads without errors
   ```

3. **Test basic functionality**:
   - Authentication flow
   - Data fetching
   - File uploads
   - Edge function calls

#### Production Deployment

**For Vercel:**
```sh
# Using Vercel CLI
vercel env rm VITE_SUPABASE_ANON_KEY production
vercel env add VITE_SUPABASE_ANON_KEY production

# Trigger redeployment
vercel --prod
```

**For Netlify:**
1. Navigate to: Site Settings > Environment Variables
2. Edit `VITE_SUPABASE_ANON_KEY`
3. Update value with new key
4. Trigger manual deploy or wait for next deployment

**For other platforms:**
- Update environment variables through platform UI
- Trigger redeployment to apply changes

#### Staging/Preview Environments

Repeat the same process for each environment:
- Staging
- Preview deployments
- CI/CD pipelines

### Step 3: Revoke Old Keys (Critical)

1. **Return to Supabase Dashboard**:
   - Project Settings > API

2. **Disable old keys** (if supported):
   - Look for option to revoke/disable previous keys
   - **Note**: Supabase may automatically invalidate old keys when new ones are generated

3. **Verify old keys are inactive**:
   - Attempt to use old key in API call
   - Should receive authentication error

### Step 4: Update Documentation

- [ ] Update any documentation containing example keys
- [ ] Update team wikis or knowledge bases
- [ ] Notify team members of completion
- [ ] Log rotation in security audit trail

### Step 5: Post-Rotation Verification

**Test all critical paths:**

1. **Authentication**:
   ```sh
   # Test login
   curl -X POST 'https://your-project.supabase.co/auth/v1/token?grant_type=password' \
     -H "apikey: NEW_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

2. **Database Access**:
   - Verify RLS policies still work
   - Test read/write operations
   - Check query performance

3. **Edge Functions**:
   - Test all edge function endpoints
   - Verify authorization headers
   - Check function logs for errors

4. **Storage**:
   - Test file uploads
   - Verify download links
   - Check storage policies

5. **Monitor Error Rates**:
   - Check application logs for auth errors
   - Monitor Supabase dashboard for failed requests
   - Watch for 401/403 HTTP status codes

## Emergency Rollback

If rotation causes issues:

1. **Immediate**: Revert to old keys in all environments
2. **Investigate**: Determine root cause of failure
3. **Fix**: Address issues (e.g., cached keys, missed environments)
4. **Retry**: Attempt rotation again with fixes in place

## Security Notes

### Never Do This:
- ❌ Commit keys to version control (even in `.env.example`)
- ❌ Share keys in unencrypted communication
- ❌ Use production keys in development
- ❌ Store keys in client-side code or browser storage
- ❌ Log keys in application logs

### Always Do This:
- ✅ Use environment variables
- ✅ Rotate keys when exposed
- ✅ Use separate keys per environment
- ✅ Enable Row Level Security (RLS)
- ✅ Monitor for unauthorized access
- ✅ Document rotation in audit trail

## Automation (Future Enhancement)

Consider automating key rotation:

```sh
# Example: Automated rotation script
#!/bin/bash
# rotate-supabase-keys.sh

# 1. Generate new key via Supabase Management API
# 2. Update environment variables in deployment platform
# 3. Trigger redeployment
# 4. Verify new keys work
# 5. Revoke old keys
# 6. Send notification to team
```

## Troubleshooting

### "Invalid API key" after rotation

**Cause**: Old key still cached or environment not redeployed

**Fix**:
- Clear browser cache and cookies
- Restart application/server
- Verify `.env` file has new key
- Check deployment platform has new environment variable

### "Permission denied" errors

**Cause**: Row Level Security policies may reference old session

**Fix**:
- Users need to log out and log back in
- Clear application state/sessions
- Verify RLS policies don't hardcode credentials

### Edge functions failing

**Cause**: Function environment variables not updated

**Fix**:
- Redeploy edge functions
- Check function secrets are updated
- Verify function authorization headers

## Key Rotation Log Template

```
Date: YYYY-MM-DD
Rotated by: [Name]
Reason: [Scheduled rotation / Exposure / Security audit]
Environments affected: [Production / Staging / Development]
Downtime: [None / X minutes]
Issues encountered: [None / Description]
Verification completed: [Yes/No]
```

## Related Documentation

- [Environment Setup](../README.md#environment-setup)
- [Supabase Configuration Hardening Plan](./supabase-configuration-hardening-plan.md)
- [Security Best Practices](https://supabase.com/docs/guides/platform/security)

## Support

If you encounter issues during rotation:
- Supabase Support: https://supabase.com/support
- Team Lead: [Contact Info]
- Emergency Escalation: [Contact Info]