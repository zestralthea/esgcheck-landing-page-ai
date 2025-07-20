import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WaitlistConfirmationRequest {
  name: string;
  email: string;
  company?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received waitlist confirmation request');
    
    const { name, email, company }: WaitlistConfirmationRequest = await req.json();
    
    console.log(`Sending confirmation email to: ${email} for ${name}`);

    // Get SMTP configuration from environment
    const smtpHost = Deno.env.get('INFOMANIAK_SMTP_HOST');
    const smtpPort = Deno.env.get('INFOMANIAK_SMTP_PORT');
    const username = Deno.env.get('INFOMANIAK_USERNAME');
    const password = Deno.env.get('INFOMANIAK_PASSWORD');
    const fromEmail = Deno.env.get('INFOMANIAK_FROM_EMAIL');

    if (!smtpHost || !smtpPort || !username || !password || !fromEmail) {
      console.error('Missing SMTP configuration');
      throw new Error('SMTP configuration is incomplete');
    }

    // Create email content
    const subject = 'Welcome to ESGCheck 🌿 - You\'re on the waitlist!';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to ESGCheck</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ESGCheck! 🌿</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #22c55e; margin-top: 0;">Hi ${name}!</h2>
            <p style="font-size: 16px; margin-bottom: 15px;">
              Thank you for joining the ESGCheck waitlist! We're excited to have you on board.
            </p>
            ${company ? `<p style="font-size: 16px; margin-bottom: 15px;">We see you're with <strong>${company}</strong> - we can't wait to help you streamline your ESG reporting process!</p>` : ''}
            <p style="font-size: 16px; margin-bottom: 15px;">
              You're now part of an exclusive group who will be the first to experience our revolutionary ESG reporting platform.
            </p>
          </div>

          <div style="background: white; border: 2px solid #22c55e; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #22c55e; margin-top: 0;">What happens next?</h3>
            <ul style="padding-left: 20px;">
              <li style="margin-bottom: 10px;">📧 We'll keep you updated on our progress</li>
              <li style="margin-bottom: 10px;">🚀 You'll be among the first to get early access</li>
              <li style="margin-bottom: 10px;">💡 Get exclusive insights into ESG best practices</li>
              <li style="margin-bottom: 10px;">🎯 Receive personalized onboarding when we launch</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; font-size: 14px;">
              Questions? Just reply to this email - we'd love to hear from you!
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Best regards,<br>
              <strong>The ESGCheck Team</strong>
            </p>
          </div>
        </body>
      </html>
    `;

    // Send email using Infomaniak SMTP
    const emailData = {
      from: fromEmail,
      to: email,
      subject: subject,
      html: htmlContent
    };

    // Use a simple SMTP library for Deno
    const response = await fetch('https://api.smtp.dev/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`
      },
      body: JSON.stringify({
        smtp: {
          host: smtpHost,
          port: parseInt(smtpPort),
          secure: true,
          auth: {
            user: username,
            pass: password
          }
        },
        ...emailData
      })
    });

    if (!response.ok) {
      console.error('Failed to send email via SMTP service:', await response.text());
      throw new Error('Failed to send email');
    }

    console.log(`Confirmation email sent successfully to ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Confirmation email sent successfully' 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-waitlist-confirmation function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);