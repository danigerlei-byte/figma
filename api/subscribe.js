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
          subject: '📖 Your Copy: Design Principles in Figma (Field Guide)',
          html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #161720; color: #F3F4F8; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
            <div style="margin-bottom: 24px; text-align: center;">
              <span style="background: rgba(255, 95, 56, 0.15); color: #FF5F38; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.15em;">
                A Practical Field Guide &bull; October 2026
              </span>
            </div>

            <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 800; line-height: 1.2; margin-bottom: 12px; text-align: center;">
              Design Principles in Figma.
            </h1>
            <p style="font-size: 16px; line-height: 1.6; color: #A0A5BA; text-align: center; margin-bottom: 32px;">
              Eight principles that make interfaces clear, calm and usable — and the exact Figma features that turn each one into a habit.
            </p>

            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${baseUrl}/lead-magnet/design-principles-in-figma.html" style="background: #FF5F38; color: #FFFFFF; padding: 16px 32px; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 16px; display: inline-block; box-shadow: 0 4px 20px rgba(255, 95, 56, 0.4);">
                📖 Open & Read 12-Page Field Guide →
              </a>
            </div>

            <div style="background: #1F202C; border: 1px solid #2B2C3C; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
              <h3 style="margin-top: 0; color: #19B875; font-size: 16px; margin-bottom: 12px;">
                ✨ What’s inside your field guide:
              </h3>
              <ul style="color: #D8DAE0; padding-left: 20px; line-height: 2; margin: 0; font-size: 14px;">
                <li><strong>01 Visual hierarchy</strong> &bull; Size, weight, color, position, space</li>
                <li><strong>02 Alignment & grids</strong> &bull; Layout grids, Auto layout, constraints</li>
                <li><strong>03 Spacing & proximity</strong> &bull; 8-point scale & spacing variables</li>
                <li><strong>04 Contrast & color</strong> &bull; 60-30-10 rule, WCAG AA, color tokens</li>
                <li><strong>05 Typography</strong> &bull; Type scale &times;1.25 & text styles</li>
                <li><strong>06 Consistency</strong> &bull; Components, properties & team libraries</li>
                <li><strong>07 Balance & whitespace</strong> &bull; Focus & progressive disclosure</li>
                <li><strong>08 Feedback & affordance</strong> &bull; States & interactive components</li>
                <li><strong>✓ The Nine-Point Pre-Share Checklist</strong> &bull; Run before you share</li>
                <li><strong>⚡ Shortcuts Worth Memorizing</strong> &bull; Quick actions reference</li>
              </ul>
            </div>

            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${baseUrl}/figma-master-kit-website.zip" style="color: #7053FF; text-decoration: none; font-weight: 700; font-size: 14px;">
                📦 Download Complete Website & Playbook Bundle (.ZIP)
              </a>
            </div>

            <p style="font-size: 12px; color: #72778E; border-top: 1px solid #282937; padding-top: 20px; text-align: center; margin: 0;">
              Sent with love &bull; Design Principles in Figma &bull; Free Field Guide.
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
