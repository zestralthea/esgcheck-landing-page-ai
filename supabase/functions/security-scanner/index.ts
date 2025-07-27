import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
  // Enhanced security headers
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'none'; script-src 'none'",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Permitted-Cross-Domain-Policies': 'none',
};

interface SecurityScanRequest {
  targetType: 'profile' | 'document' | 'report' | 'all';
  scanDepth: 'basic' | 'detailed';
  includeRecommendations?: boolean;
}

// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS_PER_WINDOW = 5; // Lower limit for security scans

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
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }
  
  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  current.count += 1;
  rateLimitStore.set(key, current);
  return true;
};

const validateSecurityScanRequest = (data: SecurityScanRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.targetType || !['profile', 'document', 'report', 'all'].includes(data.targetType)) {
    errors.push('Valid target type is required (profile, document, report, or all)');
  }
  
  if (!data.scanDepth || !['basic', 'detailed'].includes(data.scanDepth)) {
    errors.push('Valid scan depth is required (basic or detailed)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const performSecurityScan = async (
  supabase: any, 
  userId: string, 
  request: SecurityScanRequest
): Promise<any> => {
  const results = {
    timestamp: new Date().toISOString(),
    scanType: request.targetType,
    scanDepth: request.scanDepth,
    userId: userId,
    findings: [] as any[],
    recommendations: [] as string[],
    riskScore: 0,
    summary: {}
  };

  try {
    // Profile Security Scan
    if (request.targetType === 'profile' || request.targetType === 'all') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        // Check for weak profile settings
        if (!profile.full_name || profile.full_name.length < 2) {
          results.findings.push({
            type: 'profile',
            severity: 'low',
            issue: 'Incomplete profile information',
            description: 'Profile missing or has minimal full name'
          });
          results.riskScore += 1;
        }

        if (profile.role === 'admin') {
          results.findings.push({
            type: 'profile',
            severity: 'info',
            issue: 'Admin account detected',
            description: 'Account has administrative privileges'
          });
        }
      }
    }

    // Document Security Scan  
    if (request.targetType === 'document' || request.targetType === 'all') {
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId);

      if (documents && documents.length > 0) {
        const publicDocs = documents.filter(doc => doc.is_public);
        const largeDocs = documents.filter(doc => doc.file_size > 25 * 1024 * 1024);

        if (publicDocs.length > 0) {
          results.findings.push({
            type: 'document',
            severity: 'medium',
            issue: 'Public documents detected',
            description: `${publicDocs.length} document(s) are publicly accessible`,
            count: publicDocs.length
          });
          results.riskScore += publicDocs.length * 2;
        }

        if (largeDocs.length > 0) {
          results.findings.push({
            type: 'document',
            severity: 'low',
            issue: 'Large files detected',
            description: `${largeDocs.length} document(s) are larger than 25MB`,
            count: largeDocs.length
          });
          results.riskScore += largeDocs.length;
        }

        // Check for old documents
        const oldDocs = documents.filter(doc => {
          const docDate = new Date(doc.created_at);
          const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
          return docDate < sixMonthsAgo;
        });

        if (oldDocs.length > 0) {
          results.findings.push({
            type: 'document',
            severity: 'low',
            issue: 'Old documents detected',
            description: `${oldDocs.length} document(s) are older than 6 months`,
            count: oldDocs.length
          });
        }
      }
    }

    // ESG Reports Security Scan
    if (request.targetType === 'report' || request.targetType === 'all') {
      const { data: reports } = await supabase
        .from('esg_reports')
        .select('*')
        .eq('user_id', userId);

      if (reports && reports.length > 0) {
        const failedReports = reports.filter(report => report.status === 'failed');
        const processingReports = reports.filter(report => report.status === 'processing');

        if (failedReports.length > 0) {
          results.findings.push({
            type: 'report',
            severity: 'medium',
            issue: 'Failed reports detected',
            description: `${failedReports.length} report(s) failed processing`,
            count: failedReports.length
          });
          results.riskScore += failedReports.length * 2;
        }

        if (processingReports.length > 3) {
          results.findings.push({
            type: 'report',
            severity: 'low',
            issue: 'Many processing reports',
            description: `${processingReports.length} report(s) are still processing`,
            count: processingReports.length
          });
        }
      }
    }

    // Generate recommendations if requested
    if (request.includeRecommendations) {
      if (results.findings.some(f => f.issue.includes('Public documents'))) {
        results.recommendations.push('Review and restrict access to public documents if they contain sensitive information');
      }
      
      if (results.findings.some(f => f.issue.includes('Large files'))) {
        results.recommendations.push('Consider compressing or splitting large files for better performance and security');
      }
      
      if (results.findings.some(f => f.issue.includes('Failed reports'))) {
        results.recommendations.push('Review failed reports and reprocess with corrected data if needed');
      }
      
      if (results.findings.some(f => f.issue.includes('Old documents'))) {
        results.recommendations.push('Archive or delete old documents that are no longer needed');
      }

      if (results.riskScore === 0) {
        results.recommendations.push('Security scan completed successfully with no issues found');
      }
    }

    // Calculate risk level
    let riskLevel = 'low';
    if (results.riskScore > 10) riskLevel = 'high';
    else if (results.riskScore > 5) riskLevel = 'medium';

    results.summary = {
      totalFindings: results.findings.length,
      riskLevel,
      riskScore: results.riskScore,
      scanComplete: true
    };

    return results;

  } catch (error) {
    console.error('Security scan error:', error);
    throw new Error('Security scan failed');
  }
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
        JSON.stringify({ error: 'Rate limit exceeded. Security scans are limited to 5 per 5 minutes.' }),
        {
          status: 429,
          headers: { 
            'Content-Type': 'application/json', 
            'Retry-After': '300',
            ...corsHeaders 
          },
        }
      );
    }

    // Parse and validate request data
    const scanRequest: SecurityScanRequest = await req.json();
    
    const validation = validateSecurityScanRequest(scanRequest);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create service role client for comprehensive scanning
    const serviceSupabase = createClient(
      supabaseUrl, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Perform security scan
    const scanResults = await performSecurityScan(userSupabase, user.id, scanRequest);

    // Log security scan activity
    await serviceSupabase.rpc('log_security_event', {
      action_type_param: 'security_scan_completed',
      resource_type_param: 'user_account',
      resource_id_param: user.id,
      success_param: true
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        scan: scanResults
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in security-scanner function:', error);
    
    // Log failed security scan
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    await serviceSupabase.rpc('log_security_event', {
      action_type_param: 'security_scan_error',
      resource_type_param: 'user_account',
      success_param: false,
      error_msg: error.message
    });

    return new Response(
      JSON.stringify({ error: 'Security scan failed', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);