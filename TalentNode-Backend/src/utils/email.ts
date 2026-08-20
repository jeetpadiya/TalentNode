import sgMail from "@sendgrid/mail";

type OrganizationInviteEmailParams = {
  to: string;
  organizationName: string;
  inviterName: string;
  role: string;
  inviteUrl: string;
};

export type CandidateEmailParams = {
  to: string;
  subject: string;
  htmlBody: string;
};

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is not configured`);
  }

  return value;
};

// Configure SendGrid once when the application starts
sgMail.setApiKey(getRequiredEnv("SENDGRID_API_KEY"));

const getFromEmail = () => {
  return getRequiredEnv("SENDGRID_FROM_EMAIL");
};

/**
 * Send organization invitation email
 */
export const sendOrganizationInviteEmail = async (
  params: OrganizationInviteEmailParams,
) => {
  const {
    to,
    organizationName,
    inviterName,
    role,
    inviteUrl,
  } = params;

  try {
    const [response] = await sgMail.send({
      from: getFromEmail(),
      to,
      subject: `${inviterName} invited you to join ${organizationName}`,

      html: `
        <p>
          ${inviterName} invited you to join
          <strong>${organizationName}</strong>
          as <strong>${role}</strong>.
        </p>

        <p>
          <a href="${inviteUrl}">
            Accept invite
          </a>
        </p>

        <p>
          This invite link expires in 7 days.
        </p>
      `,

      text: [
        `${inviterName} invited you to join ${organizationName} as ${role}.`,
        `Accept invite: ${inviteUrl}`,
        "This invite link expires in 7 days.",
      ].join("\n\n"),
    });

    console.log("Organization invite email sent:", {
      statusCode: response.statusCode,
      to,
    });

    return response;
  } catch (error) {
    console.error("SendGrid organization invite error:", error);
    throw error;
  }
};

/**
 * Send candidate email
 */
export const sendCandidateEmail = async (
  params: CandidateEmailParams,
) => {
  const {
    to,
    subject,
    htmlBody,
  } = params;

  try {
    const [response] = await sgMail.send({
      from: getFromEmail(),
      to,
      subject,
      html: htmlBody,
    });

    console.log("Candidate email sent:", {
      statusCode: response.statusCode,
      to,
    });

    return response;
  } catch (error) {
    console.error("SendGrid candidate email error:", error);
    throw error;
  }
};