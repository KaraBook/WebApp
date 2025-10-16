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


export function bookingConfirmationTemplate({
  travellerName,
  propertyName,
  checkIn,
  checkOut,
  totalAmount,
  bookingId,
  nights,
  guests,
  portalUrl
}) {
  const formattedCheckIn = new Date(checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const formattedCheckOut = new Date(checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const formattedAmount = `₹${Number(totalAmount).toLocaleString("en-IN")}`;

  return {
    subject: `Booking Confirmed – ${propertyName}`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; line-height:1.6; color:#111; padding:20px; background:#f9f9f9;">
        <div style="max-width:600px;margin:auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.08)">
          <div style="background:#00919e;color:white;padding:16px 24px;">
            <h2 style="margin:0;font-weight:600;">Booking Confirmation</h2>
          </div>
          <div style="padding:24px;">
            <p>Hi <strong>${travellerName}</strong>,</p>
            <p>Your booking at <strong>${propertyName}</strong> has been confirmed successfully!</p>

            <table style="width:100%;border-collapse:collapse;margin-top:16px;">
              <tr><td style="padding:6px 0;"><strong>Check-in:</strong></td><td>${formattedCheckIn}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Check-out:</strong></td><td>${formattedCheckOut}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Nights:</strong></td><td>${nights}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Guests:</strong></td><td>${guests}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Total Amount:</strong></td><td>${formattedAmount}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Booking ID:</strong></td><td>${bookingId}</td></tr>
            </table>

            <p style="margin-top:16px;">You can view your booking details anytime in your dashboard.</p>

            <div style="text-align:center;margin-top:24px;">
              <a href="${portalUrl}" style="background:#00919e;color:white;text-decoration:none;padding:12px 20px;border-radius:6px;display:inline-block;">View Booking</a>
            </div>

            <p style="margin-top:24px;">We look forward to hosting you. Have a great stay!</p>
            <p style="margin-top:16px;font-size:13px;color:#666;">Need help? Contact us anytime at support@bookmysaty.in</p>
          </div>
        </div>
      </div>
    `
  };
}
