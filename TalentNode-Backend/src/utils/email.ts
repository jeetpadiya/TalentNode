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
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

  await transporter.verify();
  console.log("SMTP verified successfully");


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

  const transporter = nodemailer.createTransport({
    host: getRequiredEnv('SMTP_HOST'),
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: getRequiredEnv('SMTP_USER'),
      pass: getRequiredEnv('SMTP_PASS'),
    },
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject,
    html: htmlBody,
  })
}
