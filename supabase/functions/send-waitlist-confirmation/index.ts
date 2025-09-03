import { createClient } from 'jsr:@supabase/supabase-js@^2';
import nodemailer from 'npm:nodemailer@6.9.13';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const smtpConfig = {
  host: Deno.env.get('INFOMANIAK_SMTP_HOST'),
  port: parseInt(Deno.env.get('INFOMANIAK_SMTP_PORT') || '587'),
  secure: Deno.env.get('INFOMANIAK_SMTP_PORT') === '465',
  auth: {
    user: Deno.env.get('INFOMANIAK_SMTP_USER'),
    pass: Deno.env.get('INFOMANIAK_SMTP_PASSWORD'),
  },
};

function validateConfig() {
  const missing: string[] = [];
  if (!smtpConfig.host) missing.push('INFOMANIAK_SMTP_HOST');
  if (!smtpConfig.auth.user) missing.push('INFOMANIAK_SMTP_USER');
  if (!smtpConfig.auth.pass) missing.push('INFOMANIAK_SMTP_PASSWORD');
  if (!Deno.env.get('SUPABASE_URL')) missing.push('SUPABASE_URL');
  if (!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  return missing;
}

async function hmacHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyWebhookSignature(req: Request, bodyText: string): Promise<boolean> {
  const secret = Deno.env.get('SUPABASE_WEBHOOK_SECRET');
  if (!secret) return true;
  const header = req.headers.get('x-supabase-signature') || req.headers.get('X-Supabase-Signature');
  if (!header) return false;
  const expected = await hmacHex(secret, bodyText);
  return header === expected;
}

type WebhookPayload = {
  type?: string;
  table?: string;
  schema?: string;
  record?: Record<string, unknown>;
  old_record?: Record<string, unknown> | null;
  new?: Record<string, unknown>;
  data?: Record<string, unknown>;
  [key: string]: unknown;
};

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  try {
    // Health check and preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed', requestId }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const bodyText = await req.text();

    // Optional signature verification
    const valid = await verifyWebhookSignature(req, bodyText);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Invalid signature', requestId }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload: WebhookPayload = bodyText ? JSON.parse(bodyText) : {};

    const rec = (payload.record || payload.new || payload.data || payload) as Record<string, unknown>;
    const email = String(rec?.email || '');
    const name =
      String(rec?.name || rec?.full_name || '').trim() ||
      (email.includes('@') ? email.split('@')[0] : 'there');
    const company = (rec?.company || rec?.company_name || null) as string | null;
    const id = rec?.id as string | undefined;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Missing email in payload', requestId }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const missing = validateConfig();
    if (missing.length) {
      console.error('Missing configuration for email sending', { requestId, missing });
      return new Response(JSON.stringify({ error: 'Server misconfiguration', requestId }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const transporter = nodemailer.createTransport(smtpConfig as any);

    await transporter.sendMail({
      from: `"ESGCheck Team" <${Deno.env.get('INFOMANIAK_SMTP_FROM') || 'info@esgcheck.ch'}>`,
      to: email,
      replyTo: 'info@esgcheck.ch',
      subject: 'Welcome to ESGCheck ✅',
      text: `Hi ${name},

Thanks for joining ESGCheck!

We’re building a tool to help you stay on top of your ESG efforts with real time insights, risk awareness, and transparency designed for growing teams.

As an early subscriber, you’ll be among the first to explore how ESGCheck analyzes uploaded reports and highlights areas that matter most.

We're improving every day, and your feedback helps shape something truly useful.

Just reply to this message if you’d like to share your needs or questions.

The ESGCheck Team
info@esgcheck.ch`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6; max-width: 600px;">
          <h2 style="color: #2e6f44;">Welcome to ESGCheck</h2>
          <p>Hi ${name},</p>
          <p>Thanks for joining ESGCheck!</p>
          <p>We’re building a tool to help you stay on top of your ESG efforts with <strong>real time insights</strong>, <strong>risk awareness</strong>, and <strong>transparency</strong> designed for growing teams.</p>
          <p>As an early subscriber, you’ll be among the first to explore how ESGCheck analyzes uploaded reports and highlights areas that matter most.</p>
          <p>We're improving every day, and your feedback helps shape something truly useful.</p>
          <p>Just reply to this message if you’d like to share your needs or questions.</p>
          <p style="margin-top: 2em;">All the best,<br><strong>The ESGCheck Team</strong><br><a href="mailto:info@esgcheck.ch">info@esgcheck.ch</a></p>
          <hr style="border: none; border-top: 1px solid #ddd;" />
          <small style="font-size: 0.85em; color: #666;">If you received this message in error, you can safely ignore it.</small>
        </div>
      `,
    });

    // Update waitlist record if available
   if (id) {
      const { error: updError } = await supabase
        .from('waitlist')
        .update({
          confirmation_status: 'sent',
          confirmation_sent_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (updError) {
        console.error('Failed to update waitlist confirmation fields', { requestId, error: updError });
      }
    }

    return new Response(JSON.stringify({ ok: true, requestId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    const safe = { requestId, name: error?.name, message: error?.message, stack: error?.stack };
   console.error('send-waitlist-confirmation error', safe);
    return new Response(JSON.stringify({ error: 'Internal server error', requestId }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
