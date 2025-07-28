# Supabase Migrations Guide

## Migration File Naming Requirements

Supabase requires migration files to follow a specific naming pattern:
```
<timestamp>_name.sql
```

For example:
```
20250728000000_add-esg-report-analyses-table.sql
```

⚠️ **Important**: Using hyphens instead of underscores after the timestamp will cause migrations to be skipped during `supabase db push`.

## Automatic Migration File Renaming

The `deploy-esg-analysis.sh` script includes a step to automatically check and rename migration files with incorrect naming patterns. This ensures deployments run smoothly even if migration files don't initially follow the required format.

## Troubleshooting Migration Issues

### Issue: Migrations Being Skipped

If you see messages like this when running `supabase db push`:
```
Skipping migration 20250728000000-add-esg-report-analyses-table.sql... (file name must match pattern "<timestamp>_name.sql")
```

The issue is that your migration files are using hyphens instead of underscores after the timestamp.

### Solution 1: Use the Deployment Script

Run the `deploy-esg-analysis.sh` script, which will automatically detect and rename migration files to the correct format.

### Solution 2: Manual Fix

1. Rename all migration files to use underscores instead of hyphens after the timestamp:
   ```
   # Example of renaming a file
   mv 20250728000000-add-esg-report-analyses-table.sql 20250728000000_add-esg-report-analyses-table.sql
   ```

2. If you're still encountering issues with the migration history, you may need to repair the migration history table:
   
   First, mark problematic remote migrations as reverted:
   ```
   supabase migration repair --status reverted <migration_timestamps...>
   ```
   
   Then, mark your local migrations as applied:
   ```
   supabase migration repair --status applied <migration_timestamps...>
   ```

## Creating New Migrations

When creating new migration files, always use the format:
```
<timestamp>_descriptive-name.sql
```

For example:
```
20250801000000_add-user-preferences-table.sql
```

This will ensure your migrations are correctly processed by Supabase.