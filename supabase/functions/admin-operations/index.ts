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

interface AdminOperationRequest {
  operation: 'update_user_role' | 'grant_dashboard_access' | 'revoke_dashboard_access' | 'verify_user';
  userId: string;
  newRole?: 'admin' | 'user';
  reason?: string;
}

const validateAdminOperation = (data: AdminOperationRequest): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.operation) {
    errors.push('Operation is required');
  }
  
  if (!data.userId) {
    errors.push('User ID is required');
  }
  
  if (data.operation === 'update_user_role' && !data.newRole) {
    errors.push('New role is required for role update operations');
  }
  
  if (data.operation === 'update_user_role' && !['admin', 'user'].includes(data.newRole!)) {
    errors.push('Invalid role. Must be admin or user');
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

    // Verify user is authenticated admin
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

    // Check admin status
    const { data: isAdmin, error: adminError } = await userSupabase.rpc('is_admin');
    
    if (adminError || !isAdmin) {
      // Log unauthorized admin attempt
      await userSupabase.rpc('log_security_event', {
        action_type_param: 'unauthorized_admin_access',
        resource_type_param: 'admin_operations',
        success_param: false,
        error_msg: 'Non-admin user attempted admin operation'
      });
      
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Parse and validate request data
    const operationData: AdminOperationRequest = await req.json();
    
    const validation = validateAdminOperation(operationData);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create service role client for admin operations
    const serviceSupabase = createClient(
      supabaseUrl, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let result: any = { success: false };

    // Execute admin operation based on type
    switch (operationData.operation) {
      case 'update_user_role':
        const { error: roleError } = await serviceSupabase
          .from('profiles')
          .update({ role: operationData.newRole! })
          .eq('id', operationData.userId);

        if (roleError) {
          throw new Error(`Failed to update user role: ${roleError.message}`);
        }

        // Log the role change
        await serviceSupabase.rpc('log_security_event', {
          action_type_param: 'role_change',
          resource_type_param: 'user_profile',
          resource_id_param: operationData.userId,
          success_param: true
        });

        result = { 
          success: true, 
          message: `User role updated to ${operationData.newRole}`,
          operation: 'update_user_role',
          userId: operationData.userId,
          newRole: operationData.newRole
        };
        break;

      case 'grant_dashboard_access':
        const { error: grantError } = await serviceSupabase
          .from('profiles')
          .update({ dashboard_access: true })
          .eq('id', operationData.userId);

        if (grantError) {
          throw new Error(`Failed to grant dashboard access: ${grantError.message}`);
        }

        await serviceSupabase.rpc('log_security_event', {
          action_type_param: 'dashboard_access_granted',
          resource_type_param: 'user_profile',
          resource_id_param: operationData.userId,
          success_param: true
        });

        result = { 
          success: true, 
          message: 'Dashboard access granted',
          operation: 'grant_dashboard_access',
          userId: operationData.userId
        };
        break;

      case 'revoke_dashboard_access':
        const { error: revokeError } = await serviceSupabase
          .from('profiles')
          .update({ dashboard_access: false })
          .eq('id', operationData.userId);

        if (revokeError) {
          throw new Error(`Failed to revoke dashboard access: ${revokeError.message}`);
        }

        await serviceSupabase.rpc('log_security_event', {
          action_type_param: 'dashboard_access_revoked',
          resource_type_param: 'user_profile',
          resource_id_param: operationData.userId,
          success_param: true
        });

        result = { 
          success: true, 
          message: 'Dashboard access revoked',
          operation: 'revoke_dashboard_access',
          userId: operationData.userId
        };
        break;

      case 'verify_user':
        const { data: verifyResult, error: verifyError } = await serviceSupabase.rpc('manually_verify_user', {
          user_identifier: operationData.userId
        });

        if (verifyError) {
          throw new Error(`Failed to verify user: ${verifyError.message}`);
        }

        await serviceSupabase.rpc('log_security_event', {
          action_type_param: 'manual_user_verification',
          resource_type_param: 'auth_user',
          resource_id_param: operationData.userId,
          success_param: verifyResult.success
        });

        result = { 
          success: verifyResult.success, 
          message: verifyResult.message,
          operation: 'verify_user',
          userId: operationData.userId,
          details: verifyResult
        };
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid operation' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
    }

    // Log successful admin operation
    await serviceSupabase.rpc('log_security_event', {
      action_type_param: 'admin_operation_success',
      resource_type_param: 'admin_operations',
      resource_id_param: operationData.operation,
      success_param: true
    });

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in admin-operations function:', error);
    
    // Log failed admin operation
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    await serviceSupabase.rpc('log_security_event', {
      action_type_param: 'admin_operation_error',
      resource_type_param: 'admin_operations',
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