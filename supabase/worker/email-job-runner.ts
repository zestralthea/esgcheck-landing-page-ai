// email-job-runner.ts

import { createClient } from 'jsr:@supabase/supabase-js@^2';
import nodemailer from 'npm:nodemailer@6.9.13';

// Setup Supabase client with Service Role
const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
);

// Setup SMTP (Infomaniak)
const smtpConfig = {
  host: Deno.env.get('INFOMANIAK_SMTP_HOST'),
  port: parseInt(Deno.env.get('INFOMANIAK_SMTP_PORT') || '587'),
  secure: Deno.env.get('INFOMANIAK_SMTP_PORT') === '465',
  auth: {
    user: Deno.env.get('INFOMANIAK_SMTP_USER'),
    pass: Deno.env.get('INFOMANIAK_SMTP_PASSWORD')
  }
};

// Validate config
if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
  console.error('❌ Incomplete SMTP config.');
}

// Job processor
async function processJob(jobId: number) {
  const { data: job, error: fetchError } = await supabase
    .from('background_jobs')
    .select('*')
    .eq('id', jobId)
    .eq('status', 'pending')
    .single();

  if (fetchError || !job) {
    console.error('❌ Job fetch error:', fetchError);
    return;
  }

  const { name, email } = job.payload;
  const transporter = nodemailer.createTransport(smtpConfig);

  try {
    await transporter.sendMail({
      from: `"ESGCheck" <${Deno.env.get('INFOMANIAK_SMTP_FROM') || 'noreply@yourdomain.com'}>`,
      to: email,
      subject: 'Waitlist Confirmation',
      text: `Hi ${name},\n\nThanks for joining ESGCheck. You're on the list! We'll keep you updated.\n\n– ESGCheck Team`,
      html: `
        <h2>Welcome to ESGCheck!</h2>
        <p>Hi ${name},</p>
        <p>Thanks for joining the waitlist. We’re excited to have you!</p>
        <p>We’ll keep you posted as we get closer to launch.</p>
        <p>– ESGCheck Team</p>
      `
    });

    await supabase
      .from('background_jobs')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', job.id);
    console.log(`✅ Email sent to ${email}`);
  } catch (error) {
    await supabase
      .from('background_jobs')
      .update({ status: 'failed', error_message: error.message })
      .eq('id', job.id);
    console.error('❌ Email failed:', error);
  }
}

// Manual batch trigger (HTTP)
Deno.serve(async () => {
  try {
    const { data: jobs, error } = await supabase
      .from('background_jobs')
      .select('*')
      .eq('job_type', 'send_waitlist_email')
      .eq('status', 'pending')
      .limit(10);

    if (error) throw error;

    for (const job of jobs) {
      await processJob(job.id);
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${jobs.length} email jobs`,
        processed: jobs.length
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to process email jobs',
        details: error.message
      }),
      { status: 500 }
    );
  }
});
