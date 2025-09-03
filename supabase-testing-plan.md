# Supabase MCP Server Testing Plan

## Overview
This document outlines a comprehensive testing plan for all workflows and functions of the Supabase MCP server, covering all database tables, RPC functions, and Supabase serverless functions.

## Database Tables to Test

1. **organizations** - Multi-tenant organization structure
2. **organization_members** - User membership and roles within organizations
3. **profiles** - Extended user profile information
4. **waitlist_entries** - Waitlist signups and conversion tracking
5. **documents** - Central document storage and management
6. **jobs** - Async job processing and orchestration
7. **esg_reports** - ESG report records with organizational context
8. **esg_analyses** - AI analysis results for ESG reports
9. **esg_analysis_exports** - Generated export files for analyses
10. **esg_frameworks** - ESG reporting frameworks and standards
11. **esg_guidelines** - Specific guidelines within each framework
12. **guideline_embeddings** - Vector embeddings for ESG guidelines
13. **activity_logs** - User activity and system events
14. **document_access_logs** - Document access tracking
15. **feature_flags** - Feature flag management
16. **system_settings** - System-wide configuration settings

## RPC Functions to Test

1. **auth_user_id()** - Get current authenticated user ID
2. **user_organizations(user_uuid)** - List organizations for a user
3. **update_updated_at()** - Auto-update updated_at column (trigger function)
4. **soft_delete_report_cascade()** - Cascade soft delete for reports
5. **gdpr_delete_user_data(user_uuid)** - GDPR helper for user data deletion
6. **claim_next_job(worker_id)** - Job claim function for workers
7. **set_latest_analysis()** - Latest analysis management (trigger function)

## Supabase Serverless Functions to Test

1. **admin-operations** - Administrative operations
2. **analyze-esg-report** - ESG report analysis
3. **get-pdf-download-url** - Get PDF download URL
4. **get-users-with-auth-status** - Get users with auth status
5. **secure-document-access** - Secure document access
6. **secure-file-upload** - Secure file upload
7. **security-scanner** - Security scanning
8. **send-waitlist-confirmation** - Send waitlist confirmation
9. **verify-waitlist-signup** - Verify waitlist signup

## Test Categories

### 1. REST CRUD Operations
For each table, test the following operations:
- **SELECT** - Retrieve data with various filters and limits
- **INSERT** - Create new records
- **UPDATE** - Modify existing records
- **DELETE** - Remove records

### 2. RPC Function Calls
Test all RPC functions with appropriate parameters and validate results.

### 3. Direct SQL Queries
Test direct SQL access for complex queries and operations.

### 4. Storage Operations
- List storage buckets
- List objects in buckets
- Upload files to storage

### 5. Auth Operations
- List users
- Get user by ID

### 6. Serverless Functions
Test each serverless function to ensure proper execution.

## Implementation Approach

1. **Enhance existing test file** - Extend the current test-mcp-server.js with comprehensive tests
2. **Test data management** - Create test data and clean up after tests
3. **Validation** - Verify that all operations return expected results
4. **Error handling** - Test error conditions and edge cases
5. **Performance** - Monitor response times and resource usage

## Test Execution Steps

1. Run health and readiness checks
2. Test storage operations
3. Test auth operations
4. Test REST CRUD operations for each table
5. Test RPC function calls
6. Test direct SQL queries
7. Test serverless functions
8. Validate all results and document findings

## Expected Outcomes

- All database tables are accessible via MCP server
- All RPC functions execute correctly
- All serverless functions work as expected
- Storage operations function properly
- Auth operations return correct data
- Error handling is robust
- Performance is within acceptable limits