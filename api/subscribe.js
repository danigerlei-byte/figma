import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Environment variables configured in Vercel
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { email, source } = req.body || {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const leadSource = source || 'landing_page';

    // 1. Insert into Supabase (if configured)
    if (supabase) {
      const { error: dbError } = await supabase
        .from('leads')
        .insert([{ email: cleanEmail, source: leadSource }]);

      // PostgreSQL error 23505 is unique violation (already subscribed)
      if (dbError && dbError.code !== '23505') {
        console.error('Supabase DB error:', dbError);
      }
    }

    // 2. Automate lead magnet delivery and contact storage via Resend (if configured)
    if (resend) {
      // 2a. Save contact to Resend Audience
      const audienceId = process.env.RESEND_AUDIENCE_ID || 'dbf8c9e8-9af3-478f-9279-515e184fba17';
      try {
        await resend.contacts.create({
          email: cleanEmail,
          audienceId: audienceId,
          unsubscribed: false
        });
      } catch (contactErr) {
        // Silently continue if contact already exists
        console.warn('Resend contact create note:', contactErr?.message || contactErr);
      }

      // 2b. Send lead magnet email
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const baseUrl = `${protocol}://${host}`;

      try {
        await resend.emails.send({
          from: fromEmail,
          to: cleanEmail,
          subject: '🚀 Your Figma Production Architect Kit & Lead Magnet',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #0D0E12; color: #F3F4F8; border-radius: 16px;">
            <div style="margin-bottom: 24px; text-align: center;">
              <span style="background: rgba(162, 89, 255, 0.2); color: #A259FF; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase;">
                Figma Architect Kit &bull; 2026 Edition
              </span>
            </div>

            <h1 style="color: #FFFFFF; font-size: 26px; font-weight: 800; line-height: 1.2; margin-bottom: 12px; text-align: center;">
              Welcome to the Masterclass! 🎉
            </h1>
            <p style="font-size: 16px; line-height: 1.6; color: #9AA0B6; text-align: center; margin-bottom: 32px;">
              Thank you for requesting access. Here is your complete production toolkit to build design systems 10x faster with zero developer handoff chaos.
            </p>

            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${baseUrl}/lead-magnet/index.html" style="background: linear-gradient(135deg, #A259FF 0%, #7B2CBF 100%); color: #FFFFFF; padding: 16px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 20px rgba(162, 89, 255, 0.4);">
                🚀 Launch Interactive Architect Playbook
              </a>
            </div>

            <div style="background: #181922; border: 1px solid #272B3A; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
              <h3 style="margin-top: 0; color: #0ACF83; font-size: 16px; margin-bottom: 12px;">
                📦 Direct Downloads & Resources:
              </h3>
              <ul style="color: #D8DAE0; padding-left: 20px; line-height: 2; margin: 0;">
                <li><a href="${baseUrl}/lead-magnet/figma-tokens-starter.json" style="color: #1ABCFE; text-decoration: none; font-weight: 600;">Download Design Tokens Starter (.JSON)</a></li>
                <li><a href="${baseUrl}/lead-magnet/figma-audit-checklist.csv" style="color: #1ABCFE; text-decoration: none; font-weight: 600;">Download 60-Point Audit Matrix (.CSV)</a></li>
                <li><a href="${baseUrl}/figma-master-kit-website.zip" style="color: #1ABCFE; text-decoration: none; font-weight: 600;">Download Full Website & Asset Bundle (.ZIP)</a></li>
              </ul>
            </div>

            <p style="font-size: 12px; color: #60667E; border-top: 1px solid #232738; padding-top: 20px; text-align: center; margin: 0;">
              Sent with love &bull; Figma Masterclass Marketing Lab &bull; No spam guaranteed.
            </p>
          </div>
        `
        });
      } catch (emailErr) {
        console.warn('Resend email send notice:', emailErr?.message || emailErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Email successfully collected and lead magnet sent!'
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ error: 'Internal server error processing subscription.' });
  }
}
