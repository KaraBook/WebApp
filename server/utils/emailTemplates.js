export function propertyCreatedTemplate({
  ownerFirstName,
  propertyName,
  createdNewUser,
  tempPassword,         
  portalUrl,
}) {
  const greeting = ownerFirstName ? `Hi ${ownerFirstName},` : "Hi,";

  const newUserBlock = createdNewUser
    ? `
      <p><strong>Your owner account has been created.</strong></p>
      <ul>
        <li><strong>Registered mobile:</strong> (use OTP on login)</li>
        ${tempPassword ? `<li><strong>Temporary password:</strong> ${tempPassword}</li>` : ""}
      </ul>
    `
    : `<p>Your owner account is already active.</p>`;

  return {
    subject: `Your property “${propertyName}” has been added`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; line-height:1.6; color:#111">
        <h2 style="margin:0 0 12px">Property added successfully</h2>
        <p>${greeting}</p>
        <p>Your property <strong>${propertyName}</strong> has been created in BookMyStay.</p>
        ${newUserBlock}
        <p>You can manage your listing here:</p>
        <p>
          <a href="${portalUrl}" 
             style="display:inline-block;background:#111;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">
            Open Owner Dashboard
          </a>
        </p>
        <p style="margin-top:24px;color:#555;">If you did not request this, please ignore this email.</p>
      </div>
    `,
    text:
      `Property added successfully\n\n` +
      `${greeting}\n\n` +
      `Your property "${propertyName}" has been created.\n` +
      (createdNewUser
        ? `An owner account was created for you.${tempPassword ? ` Temporary password: ${tempPassword}` : ""}\n`
        : `Your owner account is already active.\n`) +
      `Open Owner Dashboard: ${portalUrl}\n`,
  };
}
