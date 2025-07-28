# Supabase Edge Functions

This project contains Supabase Edge Functions that provide AI-powered ESG report analysis capabilities.

## Available Functions

- **analyze-esg-report**: Analyzes ESG reports using OpenAI and generates PDFs with PDFMonkey
- **get-pdf-download-url**: Retrieves and manages PDF download URLs from PDFMonkey
- **send-waitlist-confirmation**: Sends confirmation emails to waitlist subscribers
- **verify-waitlist-signup**: Verifies and processes waitlist signups
- **secure-file-upload**: Handles secure file uploads with validation
- **secure-document-access**: Manages secure document access

## Deployment Instructions

### Prerequisites

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project (if not already linked):
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   Replace `YOUR_PROJECT_REF` with your Supabase project reference ID.

### Deploy Edge Functions

To deploy all edge functions:

```bash
supabase functions deploy
```

To deploy specific functions:

```bash
supabase functions deploy analyze-esg-report
supabase functions deploy get-pdf-download-url
```

### Environment Variables

Make sure to set these environment variables in your Supabase project:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key
supabase secrets set PDFMONKEY_API_KEY=your_pdfmonkey_api_key
supabase secrets set PDFMONKEY_TEMPLATE_ID=your_pdfmonkey_template_id
```

### Testing Deployed Functions

You can test the deployed functions using the Supabase CLI:

```bash
supabase functions serve --no-verify-jwt
```

Then in another terminal:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/analyze-esg-report' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"report_text": "Sample ESG report content", "framework": "GRI"}'
```

## Database Schema Update

The ESG report analysis feature requires a new table in your Supabase database:

```sql
CREATE TABLE esg_report_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES esg_reports(id) ON DELETE CASCADE,
  analysis_data JSONB NOT NULL,
  pdf_document_id VARCHAR NOT NULL,
  pdf_download_url VARCHAR,
  framework VARCHAR NOT NULL DEFAULT 'GRI',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX idx_esg_report_analyses_report_id ON esg_report_analyses(report_id);
```

You can run this SQL in the Supabase SQL Editor to create the required table.