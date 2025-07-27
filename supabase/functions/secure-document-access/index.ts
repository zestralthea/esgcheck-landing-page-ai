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

interface DocumentAccessRequest {
  documentId: string;
  accessType: 'view' | 'download';
  expiresIn?: number; // seconds, default 1 hour
}

// Rate limiting storage (in-memory for this edge function)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const key = userId;
  
  // Clean up expired entries
  for (const [k, v] of rateLimitStore.entries()) {
    if (v.resetTime <= now) {
      rateLimitStore.delete(k);
    }
  }
  
  const current = rateLimitStore.get(key);
  
  if (!current || current.resetTime <= now) {
    // Create new or reset expired limit
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }
  
  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  // Increment count
  current.count += 1;
  rateLimitStore.set(key, current);
  return true;
};

const validateDocumentAccess = (data: DocumentAccessRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.documentId || !data.documentId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
    errors.push('Valid document ID is required');
  }
  
  if (!data.accessType || !['view', 'download'].includes(data.accessType)) {
    errors.push('Valid access type is required (view or download)');
  }
  
  if (data.expiresIn && (data.expiresIn < 60 || data.expiresIn > 7200)) {
    errors.push('Expires in must be between 60 seconds and 2 hours');
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
    
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Rate limiting check
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        {
          status: 429,
          headers: { 
            'Content-Type': 'application/json', 
            'Retry-After': '60',
            ...corsHeaders 
          },
        }
      );
    }

    // Parse and validate request data
    const accessData: DocumentAccessRequest = await req.json();
    
    const validation = validateDocumentAccess(accessData);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create service role client for privileged operations
    const serviceSupabase = createClient(
      supabaseUrl, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check document access permissions
    const { data: document, error: documentError } = await userSupabase
      .from('documents')
      .select('id, storage_path, filename, mime_type, user_id, is_public')
      .eq('id', accessData.documentId)
      .single();

    if (documentError || !document) {
      // Log unauthorized access attempt
      await serviceSupabase.rpc('log_security_event', {
        action_type_param: 'unauthorized_document_access',
        resource_type_param: 'document',
        resource_id_param: accessData.documentId,
        success_param: false,
        error_msg: 'Document not found or access denied'
      });

      return new Response(
        JSON.stringify({ error: 'Document not found or access denied' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Check if user has access (owner or public document)
    if (document.user_id !== user.id && !document.is_public) {
      // Log unauthorized access attempt
      await serviceSupabase.rpc('log_security_event', {
        action_type_param: 'unauthorized_document_access',
        resource_type_param: 'document',
        resource_id_param: accessData.documentId,
        success_param: false,
        error_msg: 'User not authorized to access document'
      });

      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Generate signed URL with service role client
    const expiresIn = accessData.expiresIn || 3600; // Default 1 hour
    const { data: signedUrlData, error: signedUrlError } = await serviceSupabase.storage
      .from('documents')
      .createSignedUrl(document.storage_path, expiresIn, {
        download: accessData.accessType === 'download'
      });

    if (signedUrlError || !signedUrlData) {
      console.error('Signed URL generation error:', signedUrlError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate document access URL' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Log successful document access
    await serviceSupabase
      .from('document_access_logs')
      .insert({
        document_id: document.id,
        user_id: user.id,
        access_type: accessData.accessType,
        success: true,
        is_signed_url: true
      });

    // Log security event
    await serviceSupabase.rpc('log_security_event', {
      action_type_param: 'document_access_granted',
      resource_type_param: 'document',
      resource_id_param: accessData.documentId,
      success_param: true
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        signedUrl: signedUrlData.signedUrl,
        filename: document.filename,
        mimeType: document.mime_type,
        accessType: accessData.accessType,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in secure-document-access function:', error);
    
    // Log failed document access
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    await serviceSupabase.rpc('log_security_event', {
      action_type_param: 'document_access_error',
      resource_type_param: 'document',
      success_param: false,
      error_msg: error.message
    });

    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);