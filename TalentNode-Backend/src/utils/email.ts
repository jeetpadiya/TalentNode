import nodemailer from 'nodemailer'
import dns from "node:dns"

type OrganizationInviteEmailParams = {
  to: string
  organizationName: string
  inviterName: string
  role: string
  inviteUrl: string
}

dns.setDefaultResultOrder("ipv4first")

console.log("DNS order configured");
console.log(process.version);

console.log({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
});

const getRequiredEnv = (key: string) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`${key} is not configured`)
  }

  return value
}



export const sendOrganizationInviteEmail = async (
  params: OrganizationInviteEmailParams,
) => {
  const { to, organizationName, inviterName, role, inviteUrl } = params

  const smtpHost = getRequiredEnv('SMTP_HOST')
  const smtpPort = Number(process.env.SMTP_PORT ?? 587)
  const smtpSecure = process.env.SMTP_SECURE === 'true'

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: getRequiredEnv('SMTP_USER'),
      pass: getRequiredEnv('SMTP_PASS'),
    },
    connectionTimeout: 15_000,
    socketTimeout: 15_000,
    // Avoid IPv6-only failures in some hosting environments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)



  console.log('SMTP transport configured (invite):', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ?? 587,
    secure: process.env.SMTP_SECURE,
  })

  // transporter.verify() can fail in container/hosting environments due to transient
  // DNS/network restrictions. Sending the email is the real goal.
  // Still keep a short verify attempt and don’t block request on failure.
  try {
    await transporter.verify()
    console.log('SMTP verified successfully (invite)')
  } catch (err) {
    console.warn('SMTP verify skipped/failed (invite):', err)
  }


  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject: `${inviterName} invited you to join ${organizationName}`,
    html: `
      <p>${inviterName} invited you to join <strong>${organizationName}</strong> as <strong>${role}</strong>.</p>
      <p><a href="${inviteUrl}">Accept invite</a></p>
      <p>This invite link expires in 7 days.</p>
    `,
    text: [
      `${inviterName} invited you to join ${organizationName} as ${role}.`,
      `Accept invite: ${inviteUrl}`,
      'This invite link expires in 7 days.',
    ].join('\n\n'),
  })
}

export type CandidateEmailParams = {
  to: string
  subject: string
  htmlBody: string
}

export const sendCandidateEmail = async (params: CandidateEmailParams) => {
  const { to, subject, htmlBody } = params

  const smtpHost = getRequiredEnv('SMTP_HOST')
  const smtpPort = Number(process.env.SMTP_PORT ?? 587)
  const smtpSecure = process.env.SMTP_SECURE === 'true'

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: getRequiredEnv('SMTP_USER'),
      pass: getRequiredEnv('SMTP_PASS'),
    },
    connectionTimeout: 15_000,
    socketTimeout: 15_000,
  } as any)

  // Helpful runtime logging
  console.log('SMTP transport configured (candidate):', {
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject,
    html: htmlBody,
  })
}
