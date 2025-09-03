# ESGCheck Database Architecture Overview

## System Architecture

ESGCheck implements a modern, cloud-native architecture built on Supabase with a React frontend, providing enterprise-grade ESG reporting and analysis capabilities.

```mermaid
graph TB
    Frontend[React Frontend<br/>Lovable + Vite + TypeScript]
    
    subgraph "Supabase Backend"
        Auth[Supabase Auth<br/>JWT Authentication]
        DB[PostgreSQL Database<br/>30+ Tables + Views]
        Storage[Supabase Storage<br/>Document Management]
        Edge[Edge Functions<br/>9 Serverless Functions]
        Realtime[Realtime Subscriptions]
    end
    
    subgraph "External Services"
        AI[OpenAI API<br/>Embeddings + Analysis]
        PDF[PDFMonkey<br/>Report Generation]
        Email[SMTP Service<br/>Notifications]
        Security[Cloudflare Turnstile<br/>Form Protection]
    end
    
    Frontend --> Auth
    Frontend --> DB
    Frontend --> Storage
    Frontend --> Edge
    Edge --> AI
    Edge --> PDF
    Edge --> Email
    Auth --> DB
    Storage --> DB
    
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef external fill:#fff3e0
    
    class Frontend frontend
    class Auth,DB,Storage,Edge,Realtime backend
    class AI,PDF,Email,Security external
```

## Multi-Tenant Architecture

### Tenant Isolation Strategy

ESGCheck implements **organization-based multi-tenancy** with complete data isolation:

```mermaid
erDiagram
    ORGANIZATIONS {
        uuid id PK
        text name
        text slug UK
        text subscription_tier
        boolean is_public
        jsonb settings
        timestamptz deleted_at
    }
    
    ORGANIZATION_MEMBERS {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        text role
        timestamptz accepted_at
        timestamptz deleted_at
    }
    
    PROFILES {
        uuid id PK
        text email
        text role
        uuid default_organization_id FK
        boolean dashboard_access
    }
    
    ESG_REPORTS {
        uuid id PK
        uuid organization_id FK
        uuid created_by FK
        text visibility
        timestamptz deleted_at
    }
    
    ORGANIZATIONS ||--o{ ORGANIZATION_MEMBERS : "has members"
    ORGANIZATION_MEMBERS }o--|| PROFILES : "user profile"
    ORGANIZATIONS ||--o{ ESG_REPORTS : "owns reports"
    PROFILES ||--o{ ESG_REPORTS : "creates reports"
```

### Row Level Security (RLS) Implementation

Every table implements comprehensive RLS policies:

1. **Organization Isolation**: Users only access their organization's data
2. **Role-Based Access**: Owner > Admin > Member > Viewer permissions
3. **Public Data Handling**: Configurable public visibility
4. **Admin Overrides**: System administrators can access all data

## Data Architecture Layers

### 1. Core Data Layer (4 Tables)

**Purpose**: Foundation for multi-tenancy and user management
- `organizations`: Tenant isolation and subscription management
- `organization_members`: Role-based access control
- `profiles`: Extended user information beyond Supabase Auth
- `waitlist_entries`: Pre-launch user acquisition

### 2. Document Management Layer (5 Tables)

**Purpose**: Secure file storage with audit trails
- `documents`: File metadata with multi-tenant security
- `document_access_logs` (partitioned): Comprehensive access auditing

**Partitioning Strategy**:
```sql
-- Monthly partitions for scalability
document_access_logs_2025_08
document_access_logs_2025_09  
document_access_logs_2025_10
-- Auto-created via create_document_logs_monthly_partition()
```

### 3. ESG Reporting Layer (7 Tables)

**Purpose**: Complete ESG report lifecycle management

```mermaid
flowchart LR
    Upload[Document Upload] --> Report[ESG Report Creation]
    Report --> Analysis[AI Analysis]
    Analysis --> Insights[Generate Insights]
    Analysis --> Scores[Calculate Scores]  
    Analysis --> Export[Export Generation]
    
    subgraph "Database Tables"
        DocTable[documents]
        ReportTable[esg_reports]
        AnalysisTable[esg_analyses]
        InsightsTable[esg_insights]
        ScoresTable[esg_scores]
        ExportsTable[esg_analysis_exports]
    end
    
    Upload -.-> DocTable
    Report -.-> ReportTable
    Analysis -.-> AnalysisTable
    Insights -.-> InsightsTable
    Scores -.-> ScoresTable
    Export -.-> ExportsTable
```

### 4. AI Knowledge Base Layer (3 Tables)

**Purpose**: Vector-powered ESG guideline search and matching

- `esg_frameworks`: Standard definitions (GRI, SASB, TCFD, CDP, IIRC)
- `esg_guidelines`: Specific guidelines within frameworks  
- `esg_guideline_embeddings`: 1536-dimension vectors for similarity search

**Vector Search Implementation**:
```sql
-- Similarity search function
CREATE FUNCTION search_guidelines(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  framework_code text DEFAULT NULL
)
RETURNS TABLE(...) 
-- Returns similar guidelines with confidence scores
```

### 5. Job Processing Layer (2 Tables)

**Purpose**: Async task processing with enterprise features

```mermaid
sequenceDiagram
    participant Client
    participant EdgeFunction
    participant JobQueue
    participant Worker
    participant Database
    
    Client->>EdgeFunction: Upload ESG Report
    EdgeFunction->>JobQueue: Create Analysis Job
    JobQueue-->>EdgeFunction: Job ID
    EdgeFunction-->>Client: Processing Started
    
    Worker->>JobQueue: Claim Next Job
    JobQueue-->>Worker: Job Details
    Worker->>Database: Process Analysis
    Worker->>JobQueue: Update Job Status
    
    Client->>Database: Poll for Results
    Database-->>Client: Analysis Complete
```

**Job Queue Features**:
- Priority-based processing
- Retry logic with exponential backoff
- Idempotency key support
- Distributed worker support with SKIP LOCKED
- Correlation ID for request tracing

### 6. Audit & Security Layer (5 Tables)

**Purpose**: Comprehensive activity tracking and security monitoring

**Partitioned Audit Logs**:
```sql
-- Activity logs partitioned by month
CREATE TABLE activity_logs (
  id uuid,
  user_id uuid,
  action text,
  resource_type text,
  created_at timestamptz,
  PRIMARY KEY (created_at, id)
) PARTITION BY RANGE (created_at);
```

**Security Features**:
- All user actions logged with IP and user agent
- Security-specific events in dedicated audit log
- Automatic partition creation for scalability
- GDPR compliance with data anonymization

### 7. Configuration Layer (4 Tables)

**Purpose**: Dynamic system configuration and feature management

**Feature Flag Architecture**:
```mermaid
graph LR
    Flag[Feature Flag] --> User[User Whitelist]
    Flag --> Org[Organization Whitelist]  
    Flag --> Percent[Percentage Rollout]
    
    User --> Access{Has Access?}
    Org --> Access
    Percent --> Access
    
    Access -->|Yes| Enabled[Feature Enabled]
    Access -->|No| Disabled[Feature Disabled]
```

## Monitoring & Analytics Infrastructure

### Real-Time Monitoring (6 Views)

1. **`active_queries`**: Live database performance monitoring
2. **`table_sizes`**: Storage utilization tracking  
3. **`index_usage`**: Query optimization insights
4. **`job_queue_health`**: Async processing monitoring
5. **`organization_stats`**: Multi-tenant usage analytics
6. **`user_activity_summary`**: User engagement tracking

### Pre-Computed Analytics (1 Materialized View)

**`mv_organization_metrics`**: Dashboard performance optimization
- Concurrent refresh support for zero-downtime updates
- Organization KPIs and usage statistics
- ESG score averaging and trend analysis

## Performance Architecture

### Indexing Strategy

```sql
-- Composite indexes for multi-column queries
CREATE INDEX idx_esg_reports_org_status 
ON esg_reports(organization_id, status) 
WHERE deleted_at IS NULL;

-- Partial indexes for filtered queries  
CREATE INDEX idx_organizations_public 
ON organizations(is_public) 
WHERE is_public = true AND deleted_at IS NULL;

-- Vector indexes for AI search
CREATE INDEX idx_embeddings_vector 
ON esg_guideline_embeddings 
USING ivfflat (embedding vector_cosine_ops);

-- GIN indexes for JSONB search
CREATE INDEX idx_documents_metadata 
ON documents USING GIN(metadata);
```

### Partitioning Strategy

**Monthly Partitions** for high-volume tables:
- **Activity Logs**: User action tracking
- **Document Access Logs**: File access auditing
- **Auto-Partition Creation**: Scheduled monthly maintenance

**Benefits**:
- Query performance improvement via partition pruning
- Simplified data retention and archival
- Reduced index size and maintenance overhead

## Security Architecture

### Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant SupabaseAuth
    participant Database
    participant RLS
    
    User->>Frontend: Login Request
    Frontend->>SupabaseAuth: Authenticate
    SupabaseAuth-->>Frontend: JWT Token
    Frontend->>Database: Query with JWT
    Database->>RLS: Validate Access
    RLS->>Database: Filter Results
    Database-->>Frontend: Authorized Data
    Frontend-->>User: Display Data
```

### Multi-Layer Security

1. **Application Layer**: Input validation and sanitization
2. **Authentication Layer**: Supabase Auth with JWT tokens
3. **Authorization Layer**: Row Level Security policies
4. **Database Layer**: Foreign key constraints and check constraints
5. **Audit Layer**: Comprehensive activity logging

### RLS Policy Examples

```sql
-- Organization isolation
CREATE POLICY "esg_reports_select" ON esg_reports FOR SELECT
USING (organization_id IN (SELECT user_organizations(auth.uid())));

-- Role-based access  
CREATE POLICY "org_members_update" ON organization_members FOR UPDATE
USING (organization_id IN (
  SELECT organization_id FROM organization_members 
  WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
));

-- Public data access
CREATE POLICY "documents_select" ON documents FOR SELECT
USING ((organization_id IN (SELECT user_organizations(auth.uid()))) 
       OR (is_public = true));
```

## Integration Architecture

### Supabase Edge Functions (9 Functions)

```mermaid
graph TB
    subgraph "Edge Functions"
        Admin[admin-operations]
        Analysis[analyze-esg-report]  
        PDF[get-pdf-download-url]
        Users[get-users-with-auth-status]
        DocAccess[secure-document-access]
        Upload[secure-file-upload]
        Security[security-scanner]
        Email[send-waitlist-confirmation]
        Verify[verify-waitlist-signup]
    end
    
    subgraph "External APIs"
        OpenAI[OpenAI API]
        PDFService[PDFMonkey]
        SMTP[Email Service]
    end
    
    Analysis --> OpenAI
    PDF --> PDFService
    Email --> SMTP
    
    classDef edge fill:#e8f5e8
    classDef external fill:#ffe8e8
    
    class Admin,Analysis,PDF,Users,DocAccess,Upload,Security,Email,Verify edge
    class OpenAI,PDFService,SMTP external
```

### API Integration Patterns

**Async Processing Pattern**:
1. Client request → Edge Function
2. Edge Function → Job Queue  
3. Background Worker → External API
4. Worker → Database update
5. Client → Poll for completion

**Secure Document Pattern**:
1. Client → Document upload request
2. Edge Function → Validate and generate signed URL
3. Client → Direct upload to Supabase Storage
4. Edge Function → Process and create database record

## Scalability Considerations

### Horizontal Scaling

**Database Scaling**:
- Read replicas for analytics workloads
- Connection pooling via Supabase
- Partitioning for time-series data

**Application Scaling**:
- Stateless Edge Functions auto-scale
- CDN for static asset delivery
- Client-side caching and optimization

### Performance Optimization

**Query Optimization**:
- Materialized views for complex analytics
- Partial indexes for filtered queries  
- Composite indexes for multi-column searches

**Data Lifecycle Management**:
- Automated partition creation and cleanup
- Soft delete patterns with cleanup procedures
- GDPR-compliant data anonymization

## Data Flow Architecture

### ESG Report Processing Pipeline

```mermaid
flowchart TD
    A[User Uploads Document] --> B[secure-file-upload Edge Function]
    B --> C[Supabase Storage]
    B --> D[Document Record Created]
    D --> E[ESG Report Created]  
    E --> F[Analysis Job Queued]
    F --> G[analyze-esg-report Edge Function]
    G --> H[OpenAI API Analysis]
    H --> I[Analysis Results Stored]
    I --> J[Insights Generated]
    I --> K[Scores Calculated]
    J --> L[PDF Export Available]
    K --> L
    L --> M[User Notification]
    
    classDef user fill:#e1f5fe
    classDef process fill:#f3e5f5  
    classDef storage fill:#e8f5e8
    classDef external fill:#fff3e0
    
    class A,M user
    class B,F,G process
    class C,D,E,I,J,K,L storage
    class H external
```

## Deployment Architecture

### Production Environment

**Infrastructure Stack**:
- **Frontend**: Lovable deployment with CDN
- **Backend**: Supabase hosted PostgreSQL
- **Storage**: Supabase Storage with global CDN
- **Functions**: Supabase Edge Runtime (Deno)
- **Monitoring**: Built-in Supabase analytics + custom views

**Environment Configuration**:
- Production secrets via Supabase Vault
- Environment-specific feature flags
- Automated backup and recovery procedures
- Health check endpoints and monitoring

This architecture provides enterprise-grade ESG reporting capabilities with built-in scalability, security, and monitoring for production deployment.