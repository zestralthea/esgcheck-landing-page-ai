# Supabase MCP Server Testing Plan - Updated

## Overview
Comprehensive testing plan for ESGCheck's Supabase infrastructure covering 30+ tables, 6+ views, materialized views, partitioned tables, and complete functionality.

## Database Tables to Test (30+ Tables)

### Core Multi-Tenancy Tables (4 tables)
1. **organizations** - Multi-tenant organization structure
2. **organization_members** - User membership and roles within organizations  
3. **profiles** - Extended user profile information
4. **waitlist_entries** - Waitlist signups and conversion tracking

### Document Management (2 base + 3 partitions = 5 tables)
5. **documents** - Central document storage and management
6. **document_access_logs** - Document access tracking (partitioned)
7. **document_access_logs_2025_08** - August 2025 partition
8. **document_access_logs_2025_09** - September 2025 partition
9. **document_access_logs_2025_10** - October 2025 partition

### ESG Reporting System (7 tables)
10. **esg_reports** - ESG report records with organizational context
11. **esg_analyses** - AI analysis results for ESG reports
12. **esg_report_analyses** - Additional analysis data with PDF exports
13. **esg_analysis_exports** - Generated export files for analyses
14. **esg_insights** - ESG insights and recommendations
15. **esg_scores** - Detailed scoring data
16. **esg_frameworks** - ESG reporting frameworks and standards

### Knowledge Base & AI (3 tables)
17. **esg_guidelines** - Specific guidelines within each framework
18. **esg_guideline_embeddings** - Vector embeddings for ESG guidelines
19. **guideline_chunks** - Legacy guideline chunks with embeddings

### Job Processing (2 tables)
20. **jobs** - Async job processing and orchestration
21. **background_jobs** - Background email and task processing

### Audit & Monitoring (2 base + 3 partitions = 5 tables)
22. **activity_logs** - User activity and system events (partitioned)
23. **activity_logs_2025_08** - August 2025 partition
24. **activity_logs_2025_09** - September 2025 partition
25. **activity_logs_2025_10** - October 2025 partition
26. **security_audit_log** - Security event tracking

### Feature Management (3 tables)
27. **feature_flags** - Feature flag management
28. **feature_flag_users** - User-specific feature access
29. **feature_flag_organizations** - Organization-specific feature access

### System Configuration (1 table)
30. **system_settings** - System-wide configuration settings

**Total: 30+ Tables** (depending on partition count)

## Views to Test (6 Views)

1. **active_queries** - Real-time database query monitoring
2. **table_sizes** - Database table size analytics  
3. **index_usage** - Index utilization statistics
4. **job_queue_health** - Job processing metrics
5. **organization_stats** - Organization usage analytics
6. **user_activity_summary** - User activity metrics

## Materialized Views (1 View)

1. **mv_organization_metrics** - Pre-computed organization performance data

## RPC Functions to Test (20+ Functions)

### Core Functions
1. **auth_user_id()** - Get current authenticated user ID
2. **user_organizations(user_uuid)** - List organizations for a user
3. **is_admin()** - Check if user has admin privileges
4. **update_updated_at()** - Auto-update updated_at column (trigger function)

### Job Processing
5. **claim_next_job(worker_id)** - Job claim function for workers
6. **set_latest_analysis()** - Latest analysis management (trigger function)

### User Management
7. **handle_new_user()** - Auto-create profile on user signup
8. **manually_verify_user(user_identifier)** - Admin user verification
9. **gdpr_delete_user_data(user_uuid)** - GDPR helper for user data deletion

### Audit & Security
10. **log_security_event()** - Security event logging
11. **log_document_access()** - Document access logging
12. **check_waitlist_rate_limit()** - Rate limiting for waitlist signups

### Partitioning
13. **create_monthly_partition()** - Auto-create activity log partitions
14. **create_document_logs_monthly_partition()** - Auto-create document log partitions

### Feature Management
15. **has_feature_access()** - Check feature flag access
16. **send_waitlist_confirmation()** - Waitlist confirmation trigger

### AI & Search
17. **search_guidelines()** - Vector similarity search for guidelines
18. **match_guideline_chunks()** - Legacy guideline chunk matching

### Analytics & Monitoring
19. **refresh_organization_metrics()** - Refresh materialized views
20. **get_document_access_summary()** - Document access analytics

### Utility Functions
21. **soft_delete_report_cascade()** - Cascade soft delete for reports
22. **trigger_set_timestamp()** - Generic timestamp trigger
23. **check_function_exists()** - Function existence checker

## Supabase Edge Functions to Test (9 Functions)

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
For each of the 30+ tables, test:
- **SELECT** - Retrieve data with various filters and limits
- **INSERT** - Create new records with proper validation
- **UPDATE** - Modify existing records with constraints
- **DELETE** - Remove records (including soft deletes)

### 2. Row Level Security (RLS) Testing
Test RLS policies for:
- Multi-tenant data isolation
- Role-based access control (owner, admin, member, viewer)
- Public/private data visibility
- Admin privilege escalation
- Cross-organization data leakage prevention

### 3. Partitioned Table Operations
- Test CRUD operations on partitioned tables
- Verify auto-partition creation
- Test partition pruning for queries
- Validate partition constraints

### 4. View & Materialized View Testing
- Query all 6 monitoring views
- Test materialized view refresh operations
- Validate view data accuracy
- Performance testing for complex views

### 5. RPC Function Calls
Test all 20+ RPC functions with:
- Valid parameters and expected results
- Invalid parameters and error handling
- Performance under load
- Security and authorization checks

### 6. Vector Search Testing
- Test similarity search with various embeddings
- Validate search accuracy and performance
- Test with different frameworks and thresholds
- Load testing with large datasets

### 7. Job Queue Testing
- Test job creation and claiming
- Verify job status transitions
- Test retry logic and failure handling
- Performance testing with concurrent workers

### 8. Storage Operations
Test storage bucket operations:
- List storage buckets
- List objects in buckets  
- Upload files to storage
- Download and access controls

### 9. Auth Operations
- List users and authentication status
- Test user verification and management
- Role assignment and privilege testing

### 10. Edge Function Testing
Test each of the 9 edge functions:
- HTTP request/response handling
- Authentication and authorization
- Error handling and logging
- Integration with database functions

## Advanced Testing Scenarios

### Multi-Tenancy Validation
- User A cannot access Organization B's data
- Role changes properly affect access
- Public data is accessible to all users
- Admin overrides work correctly

### Performance Testing
- Large dataset queries with proper indexing
- Partition pruning effectiveness
- Vector search performance at scale
- Concurrent user simulation

### Security Testing
- SQL injection prevention
- RLS policy bypass attempts  
- Privilege escalation testing
- Data leakage validation

### Data Integrity Testing
- Foreign key constraints
- Check constraints and validations
- Trigger execution and side effects
- Transaction rollback scenarios

## Implementation Approach

### 1. Test Infrastructure
- Enhance existing `test-mcp-server.js` with comprehensive coverage
- Create separate test suites for each category
- Implement test data factories and cleanup procedures
- Add performance benchmarking

### 2. Test Data Management
- Create realistic test organizations and users
- Generate sample ESG reports and analyses
- Populate knowledge base with framework data
- Create test partitions and verify auto-creation

### 3. Automated Testing Pipeline  
- Sequential testing of all tables and functions
- Parallel testing where safe (read operations)
- Comprehensive error logging and reporting
- Performance metrics collection

### 4. Validation & Reporting
- Verify all operations return expected results
- Test error conditions and edge cases
- Document performance benchmarks
- Generate comprehensive test reports

## Expected Test Coverage

### Database Tables: 30+ tables
- All CRUD operations tested
- RLS policies validated  
- Partitioning verified
- Performance benchmarked

### Functions: 20+ RPC functions
- All functions callable and working
- Parameter validation tested
- Error handling verified
- Performance measured

### Views: 6 views + 1 materialized view
- All views queryable
- Data accuracy validated
- Refresh operations tested
- Performance optimized

### Edge Functions: 9 functions
- HTTP endpoints accessible
- Authentication working
- Business logic validated
- Integration tested

## Success Criteria

✅ **Complete Database Access**: All tables accessible via REST API  
✅ **RLS Security**: Multi-tenant isolation verified
✅ **Partitioning**: Auto-partition creation working
✅ **Vector Search**: AI-powered search functioning
✅ **Job Processing**: Async task management operational  
✅ **Monitoring**: All views and analytics working
✅ **Edge Functions**: External API integrations functional
✅ **Performance**: Production-ready response times
✅ **Security**: No data leakage or unauthorized access

This comprehensive testing plan ensures the ESGCheck platform is production-ready with full functionality, security, and performance validation across all 30+ tables and supporting infrastructure.