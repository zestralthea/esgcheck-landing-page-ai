import { createClient } from 'jsr:@supabase/supabase-js@^2';
import nodemailer from 'npm:nodemailer@6.9.13';
// Create Supabase client with service role
const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
// SMTP configuration
const smtpConfig = {
  host: Deno.env.get('INFOMANIAK_SMTP_HOST'),
  port: parseInt(Deno.env.get('INFOMANIAK_SMTP_PORT') || '587'),
  secure: Deno.env.get('INFOMANIAK_SMTP_PORT') === '465',
  auth: {
    user: Deno.env.get('INFOMANIAK_SMTP_USER'),
    pass: Deno.env.get('INFOMANIAK_SMTP_PASSWORD')
  }
};
if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
  console.error('Incomplete SMTP configuration');
}
// Core email job processor
async function processJob(jobId) {
  const { data: job, error: fetchError } = await supabase.from('background_jobs').select('*').eq('id', jobId).eq('status', 'pending').single();
  if (fetchError || !job) {
    console.error('Job fetch error:', fetchError);
    return;
  }
  const { name, email } = job.payload;
  const transporter = nodemailer.createTransport(smtpConfig);
  try {
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
      `
    });
    await supabase.from('background_jobs').update({
      status: 'completed',
      completed_at: new Date().toISOString()
    }).eq('id', job.id);
  } catch (error) {
    await supabase.from('background_jobs').update({
      status: 'failed',
      error_message: error.message
    }).eq('id', job.id);
    console.error('Email sending failed:', error);
  }
}
//Listen for real-time inserts
//Remove or comment out this real-time channel subscription
// Manual trigger via HTTP (fallback or bulk batch)
Deno.serve(async ()=>{
  try {
    const { data: jobs, error: fetchError } = await supabase.from('background_jobs').select('*').eq('job_type', 'send_waitlist_email').eq('status', 'pending').limit(10);
    if (fetchError) throw fetchError;
    for (const job of jobs){
      await processJob(job.id);
    }
    return new Response(JSON.stringify({
      message: `Processed ${jobs.length} waitlist email jobs`,
      processed: jobs.length
    }), {
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to process waitlist emails',
      details: error.message
    }), {
      status: 500
    });
  }
});
