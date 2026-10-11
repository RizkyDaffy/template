import { createTransport } from 'nodemailer'
import { config } from './config.ts'

// ponytail: nodemailer loaded lazily only when SMTP is configured; add to
// package.json dependencies when enabling email delivery.
export async function sendResetEmail(to: string, resetUrl: string): Promise<void> {
  const { createTransport: ct } = await import('nodemailer' as string).catch(() => ({ createTransport: null }))
  if (!ct) throw new Error('nodemailer not installed — run: npm i nodemailer')
  const transport = ct({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  })
  await transport.sendMail({
    from: config.smtp.from,
    to,
    subject: 'DCS — Password Reset',
    text: `Reset your password using this link (valid 30 minutes):\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
    html: `<p>Reset your password using this link (valid 30 minutes):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, ignore this email.</p>`,
  })
}
