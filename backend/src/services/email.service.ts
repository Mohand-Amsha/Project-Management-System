export interface InviteEmail {
  to: string;
  inviteUrl: string;
  organizationName: string;
  invitedByName: string;
}

/**
 * No email provider is configured yet, so this only logs the invite link.
 * The Team page shows the same link so an admin can send it manually.
 * To send real emails, replace the body with nodemailer / Resend / SES.
 */
export const sendInviteEmail = async (invite: InviteEmail): Promise<void> => {
  console.log(
    `📧 [email not configured] ${invite.invitedByName} invited ${invite.to} to ${invite.organizationName}: ${invite.inviteUrl}`
  );
};
