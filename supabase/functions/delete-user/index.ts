import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify the request is from an authenticated admin user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create client with user token to verify admin status
    const userSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    })

    // Check if user is admin
    const { data: isAdminResult, error: adminError } = await userSupabase.rpc('is_admin')
    
    if (adminError || !isAdminResult) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get request body
    const { email, userId } = await req.json()
    
    if (!email && !userId) {
      return new Response(
        JSON.stringify({ error: 'Email or userId is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Find user by email or ID
    let targetUserId = userId
    if (!targetUserId && email) {
      const { data: users } = await supabase.auth.admin.listUsers()
      const user = users.users.find(u => u.email === email)
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      targetUserId = user.id
    }

    // Delete user from auth (this will cascade to related tables)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(targetUserId)
    
    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete user', details: deleteError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Clean up any remaining data in our custom tables
    await supabase
      .from('profiles')
      .delete()
      .eq('id', targetUserId)

    await supabase
      .from('organization_members')
      .delete()
      .eq('user_id', targetUserId)

    // Log the security event
    await userSupabase.rpc('log_security_event', {
      action_type_param: 'user_deletion',
      resource_type_param: 'user',
      resource_id_param: targetUserId,
      success_param: true
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User deleted successfully',
        deletedUserId: targetUserId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error('Error in delete-user function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})