# ESGCheck - AI-Powered ESG Reporting Platform

## Project Overview

ESGCheck is a comprehensive ESG (Environmental, Social, and Governance) reporting platform that helps organizations analyze, track, and improve their sustainability performance using AI-powered insights.

**Live Demo**: https://lovable.dev/projects/0d858abb-1f4a-40e7-a13c-f3647d2f1273

## Platform Capabilities

### 🔍 ESG Report Analysis
- **AI-Powered Analysis**: Automated ESG report processing using OpenAI
- **Multi-Framework Support**: GRI, SASB, TCFD, CDP, IIRC standards
- **Score Generation**: Automated Environmental, Social, and Governance scoring
- **Gap Analysis**: Identify missing ESG disclosures and recommendations

### 📊 Multi-Tenant Architecture  
- **Organization Management**: Complete multi-tenant isolation
- **Role-Based Access**: Owner, Admin, Member, Viewer permissions
- **Secure Document Storage**: Enterprise-grade file management
- **Audit Trails**: Comprehensive activity and access logging

### 🤖 AI & Knowledge Base
- **Vector Search**: Similarity matching for ESG guidelines
- **Semantic Analysis**: AI-powered content understanding
- **Framework Mapping**: Automatic standard alignment
- **Insight Generation**: Actionable ESG recommendations

### 📈 Analytics & Reporting
- **Real-Time Dashboards**: Live performance monitoring
- **Export Capabilities**: PDF, Excel, Word report generation
- **Trend Analysis**: Historical ESG performance tracking  
- **Benchmarking**: Industry and peer comparisons

## Technical Architecture

### Frontend Stack
- **React + TypeScript**: Modern, type-safe development
- **Vite**: Fast build tooling and development server
- **Tailwind CSS**: Utility-first styling framework
- **shadcn/ui**: High-quality component library

### Backend Infrastructure (Supabase)
- **PostgreSQL Database**: 30+ tables with comprehensive RLS
- **Edge Functions**: 9 serverless functions for business logic
- **Storage**: Secure document management with access controls
- **Authentication**: JWT-based user management

### Database Architecture
- **Multi-Tenant Design**: Organization-based data isolation
- **Partitioned Logging**: Auto-scaling audit trails
- **Vector Search**: AI-powered similarity matching
- **Job Queue System**: Async processing with retry logic
- **Monitoring Views**: Real-time system health metrics

## Documentation

### Database Documentation
- **[Database Schema](docs/database-schema-final.md)**: Complete table structure and relationships
- **[Architecture Overview](docs/database-architecture-overview.md)**: System design and data flow
- **[SQL Migrations](docs/sql-migrations.md)**: Database setup and migration scripts
- **[Maintenance Guide](docs/database-maintenance.md)**: Operational procedures and best practices

### API Documentation
- **[OpenAI API Specification](docs/openai/openai-api-specification.md)**: Complete API specification for OpenAI services
- **[Supabase Documentation](docs/supabase/supabase-documentation.md)**: Comprehensive Supabase documentation including client libraries, RAG with permissions, and local development guides
- **[PDFMonkey Documentation](docs/pdfmonkey/pdfmonkey-documentation.html)**: Official PDFMonkey API documentation for PDF generation

### Testing & Quality Assurance
- **[Testing Plan](supabase-testing-plan.md)**: Comprehensive testing strategy
- **[Testing Summary](supabase-mcp-testing-summary.md)**: Current test coverage and results
- **[Structure Analysis](supabase-structure-analysis.md)**: Database implementation status

## Environment Setup

### Supabase Configuration

This project uses Supabase for backend services. All configuration is managed through environment variables for security.

#### Quick Start

1. **Copy the environment template**:
   ```sh
   cp .env.example .env
   ```

2. **Configure your credentials** in `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Find your credentials** in Supabase Dashboard:
   - Navigate to: Project Settings > API
   - Copy your Project URL and anon/public key

#### Environment Configuration System

The application uses a centralized configuration loader ([`src/config/env.ts`](src/config/env.ts:1)) that:

- **Validates** all required environment variables at startup
- **Prevents** accidental use of production credentials in development
- **Derives** Supabase Edge Function URLs automatically
- **Fails fast** with clear error messages if configuration is missing

#### Security Best Practices

> **⚠️ CRITICAL**: Never commit your `.env` file to version control. It's already excluded via `.gitignore`.

**For Development:**
- Use a separate Supabase project (staging/dev) to avoid affecting production data
- Rotate keys immediately if accidentally exposed
- Never hard-code credentials in source files

**For Production:**
- Set environment variables through your deployment platform (Vercel, Netlify, etc.)
- Use production Supabase project credentials only in production environments
- Enable Row Level Security (RLS) policies on all tables

#### Troubleshooting

**"Missing required environment variable" error:**
- Ensure `.env` file exists in project root
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart the development server after changing `.env`

**"Cannot use production Supabase URL" error:**
- You're trying to use production credentials in development mode
- Use a staging/dev Supabase project for local development
- Or set `NODE_ENV=production` if you need to test production behavior locally

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0d858abb-1f4a-40e7-a13c-f3647d2f1273) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/0d858abb-1f4a-40e7-a13c-f3647d2f1273) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
