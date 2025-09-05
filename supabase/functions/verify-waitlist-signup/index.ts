import { createClient } from "jsr:@supabase/supabase-js@^2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface WaitlistRequest {
  name: string;
  email: string;
  company?: string;
  turnstileToken: string;
}

const verifyTurnstileToken = async (token: string): Promise<boolean> => {
  const secretKey = Deno.env.get('CLOUDFLARE_TURNSTILE_SECRET_KEY');
  
  if (!secretKey) {
    console.error('Cloudflare Turnstile secret key not configured');
    return false;
  }

  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    console.log('Turnstile verification result:', result);
    
    return result.success === true;
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return false;
  }
};

const handler = async (req: Request): Promise<Response> => {
  let requestId: string | undefined = undefined;
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, company, turnstileToken }: WaitlistRequest = await req.json();
    requestId = crypto.randomUUID();

    // Verify required fields
    if (!name || !email || !turnstileToken) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Verify Turnstile token
    const isValidToken = await verifyTurnstileToken(turnstileToken);
    if (!isValidToken) {
      return new Response(
        JSON.stringify({ error: 'Human verification failed' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables', { requestId, hasUrl: !!supabaseUrl, hasServiceKey: !!supabaseServiceKey });
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration', requestId }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert into waitlist_entries (correct table name)
    const { error } = await supabase
      .from('waitlist_entries')
      .insert([
        {
          full_name: name,
          email,
          company_name: company || null
        }
      ]);

    if (error) {
      // Handle duplicate email error specifically
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'Email already registered', code: '23505' }),
          {
            status: 409,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
      throw error;
    }

    // Email confirmation is handled by a database webhook on INSERT into public.waitlist

    return new Response(
      JSON.stringify({ success: true, message: 'Successfully added to waitlist' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    // Structured error logging
    try {
      const safe = {
        requestId,
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      };
      console.error('Error in verify-waitlist-signup function:', safe);
    } catch (_) {
      console.error('Error in verify-waitlist-signup function:', error);
    }
    return new Response(
      JSON.stringify({ error: 'Internal server error', requestId }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

Deno.serve(handler);