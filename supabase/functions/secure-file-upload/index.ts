import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  // Enhanced security headers
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'none'; script-src 'none'",
};

interface FileUploadRequest {
  file: string; // base64 encoded file
  filename: string;
  mimeType: string;
  fileSize: number;
  reportTitle: string;
  reportType: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  description?: string;
  griStandards?: string[];
}

// Server-side validation schema
const validateFileUpload = (data: FileUploadRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Required fields validation
  if (!data.filename || data.filename.trim().length === 0) {
    errors.push('Filename is required');
  }
  
  if (!data.reportTitle || data.reportTitle.trim().length < 3) {
    errors.push('Report title must be at least 3 characters');
  }
  
  if (!data.reportType || !['sustainability', 'annual', 'impact', 'other'].includes(data.reportType)) {
    errors.push('Valid report type is required');
  }
  
  // File validation
  if (!data.file) {
    errors.push('File data is required');
  }
  
  if (data.fileSize > 50 * 1024 * 1024) { // 50MB limit
    errors.push('File size must not exceed 50MB');
  }
  
  // MIME type validation
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];
  
  if (!allowedMimeTypes.includes(data.mimeType)) {
    errors.push('Invalid file type. Only PDF, Word documents, and text files are allowed');
  }
  
  // Date validation
  const startDate = new Date(data.reportingPeriodStart);
  const endDate = new Date(data.reportingPeriodEnd);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    errors.push('Valid reporting period dates are required');
  }
  
  if (startDate >= endDate) {
    errors.push('Reporting period start date must be before end date');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  try {
    // Initialize Supabase client with user token for auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Parse and validate request data
    const uploadData: FileUploadRequest = await req.json();
    
    // Server-side validation
    const validation = validateFileUpload(uploadData);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create service role client for storage operations
    const serviceSupabase = createClient(
      supabaseUrl, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Generate unique file path
    const fileId = crypto.randomUUID();
    const fileExtension = uploadData.filename.split('.').pop();
    const storagePath = `${user.id}/${fileId}.${fileExtension}`;

    // Decode base64 file data
    const fileData = Uint8Array.from(atob(uploadData.file), c => c.charCodeAt(0));

    // Upload file to storage
    const { error: uploadError } = await serviceSupabase.storage
      .from('documents')
      .upload(storagePath, fileData, {
        contentType: uploadData.mimeType,
        upsert: false
      });

    if (uploadError) {
      console.error('File upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'File upload failed' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create document record
    const { data: document, error: documentError } = await serviceSupabase
      .from('documents')
      .insert({
        user_id: user.id,
        filename: uploadData.filename,
        original_filename: uploadData.filename,
        storage_path: storagePath,
        mime_type: uploadData.mimeType,
        file_size: uploadData.fileSize,
        description: uploadData.description,
        is_public: false
      })
      .select()
      .single();

    if (documentError) {
      // Clean up uploaded file on document creation failure
      await serviceSupabase.storage
        .from('documents')
        .remove([storagePath]);
      
      console.error('Document creation error:', documentError);
      return new Response(
        JSON.stringify({ error: 'Document record creation failed' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create ESG report record
    const { data: report, error: reportError } = await serviceSupabase
      .from('esg_reports')
      .insert({
        user_id: user.id,
        document_id: document.id,
        report_title: uploadData.reportTitle,
        report_type: uploadData.reportType,
        reporting_period_start: uploadData.reportingPeriodStart,
        reporting_period_end: uploadData.reportingPeriodEnd,
        gri_standards: uploadData.griStandards || [],
        status: 'processing'
      })
      .select()
      .single();

    if (reportError) {
      // Clean up on report creation failure
      await serviceSupabase.storage
        .from('documents')
        .remove([storagePath]);
      
      await serviceSupabase
        .from('documents')
        .delete()
        .eq('id', document.id);
      
      console.error('ESG report creation error:', reportError);
      return new Response(
        JSON.stringify({ error: 'ESG report creation failed' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Log successful upload
    await serviceSupabase
      .from('document_access_logs')
      .insert({
        document_id: document.id,
        user_id: user.id,
        access_type: 'upload',
        success: true
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        document: document,
        report: report,
        message: 'File uploaded and ESG report created successfully' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in secure-file-upload function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);