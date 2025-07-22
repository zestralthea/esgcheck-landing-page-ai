import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, company, turnstileToken }: WaitlistRequest = await req.json();

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert into waitlist
    const { error } = await supabase
      .from('waitlist')
      .insert([
        {
          name,
          email,
          company: company || null
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

    // Send confirmation email
    try {
      const emailResponse = await supabase.functions.invoke('send-waitlist-confirmation', {
        body: { name, email, company }
      });
      
      if (emailResponse.error) {
        console.error('Email sending error:', emailResponse.error);
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Continue with success even if email fails
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Successfully added to waitlist' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in verify-waitlist-signup function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);