import nodemailer from 'nodemailer';

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Builds a clean, minimalistic, cross-client safe HTML email template.
 * Tested for compatibility across Gmail, Apple Mail, Outlook, and Yahoo Mail.
 */
function buildEmailTemplate(options: {
  title: string;
  previewText: string;
  headingLabel: string;
  bodyParagraph: string;
  otp: string;
  expiryNote: string;
  warningNote?: string;
}): string {
  const { title, previewText, headingLabel, bodyParagraph, otp, expiryNote, warningNote } = options;

  // Individual styled digit cells in crisp monospace style
  const digits = otp.split('').map(
    (d) =>
      `<td style="padding: 0 4px;">
        <div style="
          width: 40px; height: 48px; line-height: 48px;
          text-align: center;
          font-size: 24px; font-weight: 700;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
          color: #0F172A;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        ">${d}</div>
      </td>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">

  <!-- Gmail preview snippet -->
  <div style="display: none; max-height: 0; overflow: hidden;">${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 48px 16px;">
    <tr><td align="center">

      <table role="presentation" width="520" cellpadding="0" cellspacing="0"
        style="max-width: 520px; width: 100%; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);">

        <!-- Accent Top Bar -->
        <tr>
          <td style="height: 4px; background: #8B5E3C;"></td>
        </tr>

        <!-- Header -->
        <tr>
          <td style="padding: 32px 36px 24px; border-bottom: 1px solid #F1F5F9;">
            <div style="font-size: 16px; font-weight: 700; color: #0F172A; letter-spacing: -0.2px;">
              Shri Kutch Gurjar Kshatriya Samaj
            </div>
            <div style="font-size: 12px; color: #64748B; margin-top: 2px; font-weight: 500;">
              Community Census Portal
            </div>
          </td>
        </tr>

        <!-- Content Body -->
        <tr>
          <td style="padding: 32px 36px;">

            <h1 style="font-size: 20px; font-weight: 600; color: #0F172A; margin: 0 0 12px 0; letter-spacing: -0.3px;">
              ${headingLabel}
            </h1>

            <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">
              ${bodyParagraph}
            </p>

            <!-- OTP Box -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
              <tr>
                <td style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 24px 16px; text-align: center;">
                  <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748B; font-weight: 600; margin-bottom: 16px;">
                    Verification Code
                  </div>

                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                    <tr>${digits}</tr>
                  </table>

                  <div style="font-size: 12px; color: #64748B; margin-top: 16px; font-weight: 500;">
                    ${expiryNote}
                  </div>
                </td>
              </tr>
            </table>

            ${warningNote ? `
            <div style="border-left: 3px solid #F59E0B; padding-left: 12px; margin-bottom: 20px; font-size: 13px; color: #92400E; line-height: 1.5;">
              ${warningNote}
            </div>` : ''}

            <!-- Security Notice -->
            <div style="border-left: 3px solid #E2E8F0; padding-left: 12px; font-size: 12px; color: #64748B; line-height: 1.5;">
              <strong>Security Notice:</strong> KGK Samaj will never ask for this code. Do not share this code with anyone.
            </div>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 24px 36px; background: #FAF7F2; border-top: 1px solid #F1F5F9; text-align: center;">
            <p style="font-size: 12px; color: #64748B; margin: 0 0 6px 0; line-height: 1.5;">
              Sent by <strong>KGK Samaj Census Portal</strong>. If you did not request this, please ignore this email.
            </p>
            <p style="font-size: 11px; color: #94A3B8; margin: 0;">
              &copy; ${new Date().getFullYear()} Shri Kutch Gurjar Kshatriya Samaj
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
}

/**
 * Sends a generic HTML email via SMTP, or logs to console if credentials are missing (dev mode).
 */
export async function sendEmail({ to, subject, html }: SendMailParams): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || 'KGK Samaj <noreply@kgksamaj.org>';

  if (!host || !user || !pass) {
    console.log(`\n══════════════════════════════════════════════════`);
    console.log(`[EMAIL SERVICE] SMTP not configured — console fallback`);
    console.log(`To      : ${to}`);
    console.log(`Subject : ${subject}`);
    console.log(`══════════════════════════════════════════════════\n`);
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({ from, to, subject, html });
    return true;
  } catch (error) {
    console.error('[EMAIL SERVICE] Send error:', error);
    return false;
  }
}

/**
 * Sends a login OTP verification email
 */
export async function sendLoginOtpEmail(email: string, code: string): Promise<boolean> {
  const html = buildEmailTemplate({
    title: 'Your Sign-In Verification Code',
    previewText: `Your verification code is ${code}. Valid for 5 minutes.`,
    headingLabel: 'Sign-In Verification',
    bodyParagraph:
      'Use the verification code below to complete your sign-in to the <strong>KGK Samaj Census Portal</strong>.',
    otp: code,
    expiryNote: 'Code expires in 5 minutes. Valid for one-time use.',
  });

  return sendEmail({
    to: email,
    subject: `OTP — KGK Samaj Sign-In Code`,
    html,
  });
}

/**
 * Sends a password reset OTP email
 */
export async function sendResetOtpEmail(email: string, code: string): Promise<boolean> {
  const html = buildEmailTemplate({
    title: 'Reset Your Password',
    previewText: `Your verification code is ${code}. Valid for 5 minutes.`,
    headingLabel: 'Password Reset Request',
    bodyParagraph:
      'We received a request to reset your password for the <strong>KGK Samaj Census Portal</strong>.',
    otp: code,
    expiryNote: 'Code expires in 5 minutes.',
    warningNote:
      'If you did not request a password reset, please ignore this message. Your account remains secure.',
  });

  return sendEmail({
    to: email,
    subject: `${code} — KGK Samaj Password Reset`,
    html,
  });
}
