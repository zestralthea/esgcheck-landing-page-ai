# Supabase Database Structure Analysis

## Overview
This document provides an analysis of the actual Supabase database structure compared to the migration files, based on testing through the MCP server.

## Key Findings

### 1. Database Connection Issues
- Direct PostgreSQL connection is failing with ETIMEDOUT errors
- REST API through Supabase client is working correctly
- This suggests network/firewall issues with direct database access

### 2. Table Structure Analysis
Out of 16 tables identified in migration files, 15 are accessible through the REST API:

#### Working Tables (15 tables):
1. `organizations` - Multi-tenant organization structure
2. `organization_members` - User membership and roles within organizations
3. `profiles` - Extended user profile information
4. `waitlist_entries` - Waitlist signups and conversion tracking
5. `documents` - Central document storage and management
6. `jobs` - Async job processing and orchestration
7. `esg_reports` - ESG report records with organizational context
8. `esg_analyses` - AI analysis results for ESG reports
9. `esg_analysis_exports` - Generated export files for analyses
10. `esg_frameworks` - ESG reporting frameworks and standards (has data)
11. `esg_guidelines` - Specific guidelines within each framework
12. `activity_logs` - User activity and system events
13. `document_access_logs` - Document access tracking
14. `feature_flags` - Feature flag management
15. `system_settings` - System-wide configuration settings (has data)

#### Non-Working Table (1 table):
1. `guideline_embeddings` - Vector embeddings for ESG guidelines
   - Error: "relation \"public.guideline_embeddings\" does not exist"
   - This table is defined in migration files but doesn't exist in the actual database

### 3. Data Analysis
- Most tables are currently empty
- `esg_frameworks` table has 5 records with predefined frameworks (GRI, SASB, TCFD, CDP, IIRC)
- `system_settings` table has 5 records including maintenance_mode setting
- 2 users exist in the auth system

### 4. RPC Function Analysis
Out of 7 RPC functions identified in migration files, 3 are working correctly:

#### Working RPC Functions (3 functions):
1. `auth_user_id` - Get current authenticated user ID
   - Successfully returns the current user ID
2. `user_organizations` - List organizations for a user
   - Successfully returns organization list (empty in this case)
3. `is_admin` - Check if user is admin (used by serverless functions)
   - Function exists but has an issue with a missing "role" column

#### Non-Working RPC Functions (6 functions):
1. `update_updated_at` - Not found in schema cache
2. `soft_delete_report_cascade` - Not found in schema cache
3. `gdpr_delete_user_data` - Not found in schema cache
4. `claim_next_job` - Not found in schema cache
5. `set_latest_analysis` - Not found in schema cache
6. `version` - Not found in schema cache (this is a built-in PostgreSQL function)

### 5. Storage Analysis
- 1 storage bucket exists: `documents`
- Storage operations are working correctly

### 6. Auth Analysis
- 2 users exist in the system
- Auth operations are working correctly

## Discrepancies Between Migration Files and Actual Database

### Missing Tables
1. `guideline_embeddings` - Defined in migration files but doesn't exist in database

### Missing RPC Functions
6 RPC functions defined in migration files are not accessible:
- `update_updated_at`
- `soft_delete_report_cascade`
- `gdpr_delete_user_data`
- `claim_next_job`
- `set_latest_analysis`
- `version` (built-in PostgreSQL function)

### Issues with Existing Functions
1. `is_admin` - Has an issue with a missing "role" column

## Recommendations

### 1. Fix Database Connection
- Investigate PostgreSQL connection issues
- Check firewall settings and network configuration
- Verify database credentials and connection string

### 2. Resolve Missing Table
- Create the `guideline_embeddings` table if it's needed
- Or remove it from migration files if it's not needed

### 3. Fix RPC Functions
- Ensure all RPC functions are properly registered in the database
- Check function definitions and permissions
- Verify that trigger functions are properly created
- Fix the "role" column issue in the `is_admin` function

### 4. Populate Test Data
- Add sample data to tables for better testing
- Create test users and organizations
- Add sample ESG reports and analyses

## Conclusion
The Supabase MCP server is mostly functioning correctly, with REST API access working for most tables. The main issues are:
1. Direct PostgreSQL connection problems
2. Missing `guideline_embeddings` table
3. Several RPC functions not accessible through the schema cache
4. Issues with the `is_admin` function

These issues should be addressed to ensure full functionality of the MCP server and proper testing of all database features.

## Supabase Serverless Functions
The following serverless functions exist in the codebase but were not tested through the MCP server (they run independently on Supabase Edge):
1. `admin-operations`
2. `analyze-esg-report`
3. `get-pdf-download-url`
4. `get-users-with-auth-status`
5. `secure-document-access`
6. `secure-file-upload`
7. `security-scanner`
8. `send-waitlist-confirmation`
9. `verify-waitlist-signup`

These functions would need to be tested separately using direct HTTP requests to their endpoints.