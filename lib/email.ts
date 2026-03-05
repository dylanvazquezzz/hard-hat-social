import 'server-only'
// SERVER ONLY — never import this in client components.
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@contractorsconnect.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://contractorsconnect.com'

export async function sendApprovalEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "You're approved — Welcome to Contractors Connect",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#e2e8f0;background:#0f172a;padding:32px;border-radius:8px;">
        <h1 style="color:#f8fafc;font-size:24px;margin-bottom:8px;">Welcome aboard, ${name}.</h1>
        <p style="color:#94a3b8;margin-bottom:24px;">
          Your application to Contractors Connect has been reviewed and <strong style="color:#10b981;">approved</strong>.
          You're now part of a verified network of credentialed tradespeople.
        </p>

        <h2 style="color:#f8fafc;font-size:16px;margin-bottom:8px;">What's next</h2>
        <ol style="color:#94a3b8;padding-left:20px;margin-bottom:24px;line-height:1.8;">
          <li>Sign in at <a href="${APP_URL}/auth?redirect=/profile" style="color:#f59e0b;">${APP_URL}/auth?redirect=/profile</a></li>
          <li>Complete your profile — add a photo and set your @username</li>
          <li>Browse the directory to find subs or work opportunities</li>
        </ol>

        <a href="${APP_URL}/auth?redirect=/profile" style="display:inline-block;background:#f59e0b;color:#0f172a;font-weight:700;padding:12px 24px;border-radius:6px;text-decoration:none;">
          Sign In Now
        </a>

        <p style="color:#475569;font-size:12px;margin-top:32px;">
          Contractors Connect · Verified tradespeople only
        </p>
      </div>
    `,
  })
}

export async function sendRejectionEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Application update — Contractors Connect',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#e2e8f0;background:#0f172a;padding:32px;border-radius:8px;">
        <h1 style="color:#f8fafc;font-size:24px;margin-bottom:8px;">Hi ${name},</h1>
        <p style="color:#94a3b8;margin-bottom:16px;">
          Thank you for applying to Contractors Connect. After reviewing your application,
          we're unable to approve it at this time.
        </p>
        <p style="color:#94a3b8;margin-bottom:24px;">
          This is typically due to insufficient credential documentation. If you believe this
          is an error or you'd like to reapply with additional documentation, please reach out
          or submit a new application.
        </p>
        <a href="${APP_URL}/apply" style="display:inline-block;background:#334155;color:#f8fafc;font-weight:600;padding:12px 24px;border-radius:6px;text-decoration:none;">
          Reapply
        </a>
        <p style="color:#475569;font-size:12px;margin-top:32px;">
          Contractors Connect · Verified tradespeople only
        </p>
      </div>
    `,
  })
}
