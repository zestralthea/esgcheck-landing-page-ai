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
  console.log('=== SECURE FILE UPLOAD FUNCTION START ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.log('Invalid method received:', req.method);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  try {
    console.log('Processing POST request...');
    
    // Initialize Supabase client with user token for auth check
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header present:', !!authHeader);
    console.log('Auth header format:', authHeader ? `${authHeader.substring(0, 20)}...` : 'none');
    
    if (!authHeader) {
      console.log('ERROR: No authorization header provided');
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
    console.log('Environment variables loaded - URL:', !!supabaseUrl, 'Anon Key:', !!supabaseAnonKey);
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    console.log('Supabase client created, verifying authentication...');

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Auth check result:', {
      userExists: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message
    });
    
    if (authError || !user) {
      console.log('ERROR: Authentication failed:', authError?.message || 'No user found');
      return new Response(
        JSON.stringify({ error: 'Invalid authentication', details: authError?.message }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('✅ User authenticated successfully:', user.id);

    // Create service role client for database operations
    const serviceSupabase = createClient(
      supabaseUrl, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('Service role client created, looking up organization...');

    // Get user's organization or assign default one
    let organizationId: string;
    
    // Check if user has a profile with organization
    const { data: profile, error: profileError } = await serviceSupabase
      .from('profiles')
      .select('default_organization_id')
      .eq('id', user.id)
      .single();

    console.log('Profile lookup result:', {
      profileExists: !!profile,
      hasOrgId: !!profile?.default_organization_id,
      orgId: profile?.default_organization_id,
      profileError: profileError?.message
    });

    if (profile?.default_organization_id) {
      organizationId = profile.default_organization_id;
      console.log('✅ Using user organization:', organizationId);
    } else {
      console.log('No user organization found, looking for dev-org...');
      // Get development organization for users without specific organization
      const { data: org, error: orgError } = await serviceSupabase
        .from('organizations')
        .select('id')
        .eq('slug', 'dev-org')
        .single();
      
      console.log('Dev org lookup result:', {
        orgExists: !!org,
        orgId: org?.id,
        orgError: orgError?.message
      });
      
      if (org) {
        organizationId = org.id;
        console.log('✅ Using development organization:', organizationId);
      } else {
        console.error('❌ No organization found for user');
        return new Response(
          JSON.stringify({ 
            error: 'No organization found for user', 
            details: 'User must be assigned to an organization' 
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
    }

    // Parse and validate request data
    console.log('Parsing request body...');
    let uploadData: FileUploadRequest;
    
    try {
      uploadData = await req.json();
      console.log('Request parsed successfully. File details:', {
        filename: uploadData.filename,
        mimeType: uploadData.mimeType,
        fileSize: uploadData.fileSize,
        reportTitle: uploadData.reportTitle,
        reportType: uploadData.reportType,
        hasFileData: !!uploadData.file,
        fileSizeBytes: uploadData.file ? uploadData.file.length : 0
      });
    } catch (parseError) {
      console.error('❌ Failed to parse request JSON:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON data', details: parseError.message }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
    
    console.log('Running server-side validation...');
    // Server-side validation
    const validation = validateFileUpload(uploadData);
    console.log('Validation result:', {
      isValid: validation.isValid,
      errors: validation.errors
    });
    
    if (!validation.isValid) {
      console.log('❌ Validation failed:', validation.errors);
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('✅ Validation passed successfully');

    // Generate unique file path
    const fileId = crypto.randomUUID();
    const fileExtension = uploadData.filename.split('.').pop();
    const storagePath = `${user.id}/${fileId}.${fileExtension}`;
    
    console.log('Generated storage path:', storagePath);
    console.log('File ID:', fileId);

    // Decode base64 file data
    console.log('Decoding base64 file data...');
    let fileData: Uint8Array;
    
    try {
      fileData = Uint8Array.from(atob(uploadData.file), c => c.charCodeAt(0));
      console.log('✅ File decoded successfully. Size:', fileData.length, 'bytes');
    } catch (decodeError) {
      console.error('❌ Failed to decode base64 file:', decodeError);
      return new Response(
        JSON.stringify({ error: 'Invalid file data', details: 'Base64 decode failed' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Upload file to storage using user-authenticated client for RLS policies
    console.log('🚀 Starting storage upload...');
    console.log('Storage details:', {
      bucket: 'documents',
      path: storagePath,
      contentType: uploadData.mimeType,
      fileSize: fileData.length,
      userId: user.id
    });
    
    const { data: uploadResult, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, fileData, {
        contentType: uploadData.mimeType,
        upsert: false
      });

    console.log('Storage upload result:', {
      success: !uploadError,
      uploadResult: uploadResult,
      error: uploadError
    });

    if (uploadError) {
      console.error('❌ File upload error:', {
        message: uploadError.message,
        statusCode: uploadError.statusCode,
        error: uploadError.error,
        name: uploadError.name
      });
      return new Response(
        JSON.stringify({ 
          error: 'File upload failed', 
          details: uploadError.message,
          code: uploadError.statusCode
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('✅ File uploaded successfully to storage:', storagePath);

    console.log('📝 Creating document record...');
    console.log('Document data:', {
      organization_id: organizationId,
      user_id: user.id,
      filename: uploadData.filename,
      storage_path: storagePath,
      mime_type: uploadData.mimeType,
      file_size: uploadData.fileSize
    });
    
    // Create document record
    const { data: document, error: documentError } = await serviceSupabase
      .from('documents')
      .insert({
        organization_id: organizationId,  // Add organization reference
        user_id: user.id,
        filename: uploadData.filename,
        file_name: uploadData.filename, // Keep both for compatibility
        storage_path: storagePath,
        mime_type: uploadData.mimeType,
        file_size: uploadData.fileSize,
        file_type: uploadData.mimeType,
        metadata: {
          description: uploadData.description || ''
        },
        is_public: false
      })
      .select()
      .single();

    console.log('Document creation result:', {
      success: !documentError,
      documentId: document?.id,
      error: documentError
    });

    if (documentError) {
      // Clean up uploaded file on document creation failure
      console.error('❌ Document creation failed:', {
        error: documentError,
        message: documentError.message,
        code: documentError.code,
        details: documentError.details,
        hint: documentError.hint,
        user_id: user.id,
        filename: uploadData.filename,
        storage_path: storagePath
      });
      
      console.log('🧹 Cleaning up uploaded file due to document creation failure');
      await supabase.storage
        .from('documents')
        .remove([storagePath]);
      
      return new Response(
        JSON.stringify({ 
          error: 'Document record creation failed',
          details: documentError.message,
          code: documentError.code,
          hint: documentError.hint
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('✅ Document created successfully:', document.id);

    console.log('Creating ESG report record for document:', document.id);
    
    // Create ESG report record
    const { data: report, error: reportError } = await serviceSupabase
      .from('esg_reports')
      .insert({
        organization_id: organizationId,  // Required field
        user_id: user.id,
        document_id: document.id,
        title: uploadData.reportTitle,
        report_title: uploadData.reportTitle, // Keep both for compatibility
        report_type: uploadData.reportType,
        reporting_period_start: uploadData.reportingPeriodStart,
        reporting_period_end: uploadData.reportingPeriodEnd,
        metadata: {
          gri_standards: uploadData.griStandards || [],
          description: uploadData.description || ''
        },
        status: 'processing'
      })
      .select()
      .single();

    if (reportError) {
      // Clean up on report creation failure
      console.error('ESG report creation error details:', {
        error: reportError,
        document_id: document.id,
        report_title: uploadData.reportTitle
      });
      
      await serviceSupabase.storage
        .from('documents')
        .remove([storagePath]);
      
      await serviceSupabase
        .from('documents')
        .delete()
        .eq('id', document.id);
      
      return new Response(
        JSON.stringify({ 
          error: 'ESG report creation failed',
          details: reportError.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('ESG report created successfully:', report.id);

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