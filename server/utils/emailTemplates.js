export function propertyCreatedTemplate({
  ownerFirstName,
  ownerEmail,
  ownerPassword,
  propertyName,
  createdNewUser,
  portalUrl = `${process.env.OWNER_PORTAL_URL}/login`,
}) {
  const greeting = ownerFirstName ? `Hi ${ownerFirstName},` : "Hi,";

  const credentialsBlock = createdNewUser
    ? `
      <p><strong>Your owner account has been created.</strong></p>
      <ul>
        <li><strong>Username:</strong> ${ownerEmail}</li>
        <li><strong>Password:</strong> ${ownerPassword}</li>
      </ul>
      <p>Please login and change your password after first login.</p>
    `
    : `<p>Your owner account is already active.</p>`;

  return {
    subject: `Your property "${propertyName}" has been added`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; line-height:1.6; color:#111">
        <h2>Property added successfully</h2>
        <p>${greeting}</p>
        <p>Your property <strong>${propertyName}</strong> has been created in Karabook.</p>
        ${credentialsBlock}
        <p>
          <a href="${portalUrl}" 
             style="display:inline-block;background:#0694a0;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">
            Login to Owner Dashboard
          </a>
        </p>
      </div>
    `,
    text:
      `Property added successfully\n\n` +
      `${greeting}\n\n` +
      `Property: ${propertyName}\n\n` +
      (createdNewUser
        ? `Username: ${ownerEmail}\nPassword: ${ownerPassword}\n\n`
        : "") +
      `Login: ${portalUrl}`,
  };
}



export function bookingConfirmationTemplate({
  travellerName,
  propertyName,
  propertyAddress,
  checkIn,
  checkOut,
  bookingId,
  nights,
  guests,
  subtotal,
  cgst,
  sgst,
  grandTotal,
  paymentMethod,
  orderId,
  hostName,
  hostPhone,
  hostEmail,
  portalUrl = process.env.TRAVELLER_PORTAL_URL,
}) {
  const formatIndiaDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

  return {
    subject: `Booking Confirmed – ${propertyName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Booking Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f2f4f5;font-family:Inter,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f5;padding:20px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">

<!-- HEADER -->
<tr>
<td align="center" style="background:#2e9c8f;padding:32px 20px;color:#ffffff;">
  <h2 style="margin:0;font-weight:600;">KisanBooking</h2>
  <div style="font-size:38px;margin:16px 0;">✓</div>
  <h3 style="margin:0;font-weight:600;">Booking Confirmed!</h3>
  <p style="margin:6px 0 0 0;font-size:14px;">Booking ID: <strong>#${bookingId}</strong></p>
  <div style="margin-top:10px;">
    <span style="background:#ffffff33;padding:6px 14px;border-radius:20px;font-size:12px;">
      CONFIRMED
    </span>
  </div>
</td>
</tr>

<!-- BODY -->
<tr>
<td style="padding:28px;">

<p style="margin-top:0;">Dear <strong>${travellerName}</strong>,</p>
<p style="color:#555;font-size:14px;">
Thank you for your booking! Your reservation has been confirmed.
Below are the details of your stay.
</p>

<hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />

<!-- PROPERTY -->
<h4 style="margin-bottom:8px;color:#2e9c8f;">PROPERTY</h4>
<div style="background:#f6f8f9;padding:16px;border-radius:10px;margin-bottom:20px;">
  <strong>${propertyName}</strong><br/>
  <span style="font-size:13px;color:#666;">${propertyAddress || ""}</span>
</div>

<!-- STAY DETAILS -->
<h4 style="margin-bottom:8px;color:#2e9c8f;">STAY DETAILS</h4>
<table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom:20px;">
<tr>
  <td width="50%" style="background:#f6f8f9;border-radius:8px;">
    <strong>Check-in</strong><br/>
    ${formatIndiaDate(checkIn)}
  </td>
  <td width="50%" style="background:#f6f8f9;border-radius:8px;">
    <strong>Check-out</strong><br/>
    ${formatIndiaDate(checkOut)}
  </td>
</tr>
<tr>
  <td width="50%" style="background:#f6f8f9;border-radius:8px;">
    <strong>Nights</strong><br/>
    ${nights}
  </td>
  <td width="50%" style="background:#f6f8f9;border-radius:8px;">
    <strong>Guests</strong><br/>
    ${guests}
  </td>
</tr>
</table>

<!-- HOST -->
${
  hostName
    ? `
<h4 style="margin-bottom:8px;color:#2e9c8f;">HOST CONTACT</h4>
<div style="background:#f6f8f9;padding:16px;border-radius:10px;margin-bottom:20px;">
  <strong>${hostName}</strong><br/>
  ${hostPhone ? `📞 ${hostPhone}<br/>` : ""}
  ${hostEmail ? `✉ ${hostEmail}` : ""}
</div>
`
    : ""
}

<!-- PAYMENT -->
<h4 style="margin-bottom:8px;color:#2e9c8f;">PAYMENT INFORMATION</h4>
<table width="100%" cellpadding="6" cellspacing="0" style="background:#f6f8f9;border-radius:10px;padding:16px;">
<tr>
  <td>Payment Method</td>
  <td align="right">${paymentMethod}</td>
</tr>
<tr>
  <td>Room Charges (${nights} nights)</td>
  <td align="right">${money(subtotal)}</td>
</tr>
<tr>
  <td>CGST</td>
  <td align="right">${money(cgst)}</td>
</tr>
<tr>
  <td>SGST</td>
  <td align="right">${money(sgst)}</td>
</tr>
<tr>
  <td style="border-top:1px solid #ddd;padding-top:10px;">
    <strong>Grand Total</strong>
  </td>
  <td align="right" style="border-top:1px solid #ddd;padding-top:10px;">
    <strong>${money(grandTotal)}</strong>
  </td>
</tr>
<tr>
  <td style="font-size:12px;color:#777;">Order ID</td>
  <td align="right" style="font-size:12px;color:#777;">${orderId}</td>
</tr>
</table>

<!-- IMPORTANT INFO -->
<h4 style="margin:24px 0 8px;color:#2e9c8f;">IMPORTANT INFORMATION</h4>
<div style="background:#f6f8f9;padding:16px;border-radius:10px;font-size:14px;">
  <strong>Check-in / Check-out Time</strong><br/>
  Check-in: 2:00 PM onwards · Check-out: 11:00 AM
</div>

<div style="margin-top:12px;background:#f6f8f9;padding:16px;border-radius:10px;font-size:14px;">
  <strong>Cancellation Policy</strong><br/>
  Free cancellation up to 48 hours before check-in.
</div>

<!-- BUTTON -->
<div style="text-align:center;margin-top:28px;">
  <a href="${portalUrl}"
     style="background:#2e9c8f;color:#ffffff;text-decoration:none;
     padding:12px 22px;border-radius:8px;display:inline-block;">
     View Booking
  </a>
</div>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td align="center" style="padding:20px;color:#777;font-size:13px;background:#fafafa;">
  Need help?<br/>
  Contact us at support@kisanbooking.com<br/><br/>
  © ${new Date().getFullYear()} KisanBooking. All rights reserved.
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`
  };
}


export function propertyPublishedTemplate({
  ownerFirstName,
  propertyName,
  portalUrl = `${process.env.OWNER_PORTAL_URL}/login`,
}) {
  const greeting = ownerFirstName ? `Hi ${ownerFirstName},` : "Hi,";

  return {
    subject: `Your property "${propertyName}" is now live! 🎉`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; line-height:1.6; color:#111">
        <h2>Property Published Successfully</h2>
        <p>${greeting}</p>
        <p>Great news! Your property <strong>${propertyName}</strong> has now been published and is live on Karabook.</p>
        <p>You can now start receiving bookings from travellers.</p>
        <p>
          <a href="${portalUrl}" 
             style="display:inline-block;background:#0694a0;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">
            Go to Owner Dashboard
          </a>
        </p>
      </div>
    `,
    text:
      `Hi,\n\n` +
      `Your property "${propertyName}" is now live on Karabook.\n\n` +
      `You can start receiving bookings.\n\n` +
      `Dashboard: ${portalUrl}`,
  };
}


export function ownerBookingNotificationTemplate({
  ownerName,
  propertyName,
  travellerName,
  checkIn,
  checkOut,
  nights,
  guests,
  grandTotal,
 portalUrl = `${process.env.OWNER_PORTAL_URL}/login`,
}) {
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

  return {
    subject: `New Booking Received – ${propertyName}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.6">
        <h2>New Booking Alert 🎉</h2>

        <p>Hi ${ownerName},</p>

        <p>You have received a new booking for <strong>${propertyName}</strong>.</p>

        <table style="margin-top:15px">
          <tr><td><strong>Traveller:</strong></td><td>${travellerName}</td></tr>
          <tr><td><strong>Check-in:</strong></td><td>${formatDate(checkIn)}</td></tr>
          <tr><td><strong>Check-out:</strong></td><td>${formatDate(checkOut)}</td></tr>
          <tr><td><strong>Nights:</strong></td><td>${nights}</td></tr>
          <tr><td><strong>Guests:</strong></td><td>${guests}</td></tr>
          <tr><td><strong>Total Paid:</strong></td><td>${money(grandTotal)}</td></tr>
        </table>

        <div style="margin-top:20px;">
          <a href="${portalUrl}"
            style="background:#00919e;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">
            View Booking in Dashboard
          </a>
        </div>
      </div>
    `
  };
}


export function managerAccountCreatedTemplate({
  managerName,
  managerEmail,
  managerPassword,
  portalUrl = `${process.env.OWNER_PORTAL_URL}/login`,
}) {
  return {
    subject: "Your KaraBook Manager Account is Ready",
    html: `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111">
        <h2>Welcome to KaraBook 🎉</h2>

        <p>Hi <strong>${managerName}</strong>,</p>

        <p>Your manager account has been created. You can now access the KaraBook dashboard.</p>

        <div style="background:#f5f7f8;padding:16px;border-radius:8px;margin:16px 0">
          <p><strong>Login Email:</strong> ${managerEmail}</p>
          <p><strong>Password:</strong> ${managerPassword}</p>
        </div>

        <p>Please change your password after first login.</p>

        <a href="${portalUrl}"
           style="display:inline-block;background:#00919e;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">
           Login to Dashboard
        </a>

        <p style="margin-top:20px;font-size:13px;color:#666">
          If you did not expect this email, please contact support.
        </p>
      </div>
    `,
  };
}