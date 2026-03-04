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
  propertyCheckInTime,
  propertyCheckOutTime,
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

  const safeBookingId = String(bookingId || "");
  const formattedBookingId = safeBookingId.startsWith("KB-")
    ? `#${safeBookingId}`
    : `#KB-${safeBookingId}`;

  return {
    subject: `Booking Confirmed – ${propertyName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Booking Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;background:#f3f4f6;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.05);">

<!-- ================= HEADER ================= -->
<tr>
<td style="background:#038ba0;padding:22px 24px;text-align:center;color:#ffffff;">

  <div style="font-size:26px;font-weight:700;letter-spacing:0.3px;">
    Karabook
  </div>

  <div style="margin-top:12px;font-size:16px;font-weight:600;">
    ✓ Booking Confirmed
    <span style="
      display:inline-block;
      background:rgba(255,255,255,0.2);
      padding:4px 10px;
      border-radius:14px;
      font-size:11px;
      margin-left:8px;
      letter-spacing:0.5px;">
      CONFIRMED
    </span>
  </div>

  <div style="margin-top:6px;font-size:12px;opacity:0.9;">
    Booking ID: <strong>${formattedBookingId}</strong>
  </div>

</td>
</tr>

<!-- ================= BODY ================= -->
<tr>
<td style="padding:20px 20px;">

<p style="margin:0 0 6px 0;font-size:14px;">
Dear <strong>${travellerName}</strong>,
</p>

<p style="margin:0 0 18px 0;font-size:13px;color:#5f6b6a;line-height:1.6;">
Thank you for your booking! Your reservation has been confirmed.
Below are the details of your stay.
</p>

<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

<!-- ===== PROPERTY ===== -->
<div style="font-size:12px;font-weight:600;letter-spacing:1px;color:#6b7c7b;margin-bottom:10px;">
PROPERTY
</div>

<div style="background:#eef3f2;border:1px solid #e2e8e7;border-radius:12px;padding:12px;margin-bottom:22px;">

  <div style="font-size:15px;font-weight:600;color:#1f2937;">
    ${propertyName}
  </div>

  <div style="font-size:13px;color:#5f6b6a;line-height:1.5;">
    ${propertyAddress || ""}
  </div>

</div>

<!-- ===== STAY DETAILS ===== -->
<div style="font-size:12px;font-weight:600;letter-spacing:1px;color:#6b7c7b;margin-bottom:10px;">
STAY DETAILS
</div>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;">
<tr>
<td width="48%" valign="top">
  <div style="background:#eef3f2;border:1px solid #e2e8e7;border-radius:12px;padding:12px;margin-bottom:12px;">
    <div style="font-size:12px;color:#6b7c7b;margin-bottom:4px;">Check-in</div>
    <div style="font-size:14px;font-weight:600;color:#1f2937;">
      ${formatIndiaDate(checkIn)}
    </div>
  </div>
</td>

<td width="2%"></td>

<td width="48%" valign="top">
  <div style="background:#eef3f2;border:1px solid #e2e8e7;border-radius:12px;padding:12px;margin-bottom:12px;">
    <div style="font-size:12px;color:#6b7c7b;margin-bottom:4px;">Check-out</div>
    <div style="font-size:14px;font-weight:600;color:#1f2937;">
      ${formatIndiaDate(checkOut)}
    </div>
  </div>
</td>
</tr>

<tr>
<td width="48%" valign="top">
  <div style="background:#eef3f2;border:1px solid #e2e8e7;border-radius:12px;padding:12px;">
    <div style="font-size:12px;color:#6b7c7b;margin-bottom:4px;">Nights</div>
    <div style="font-size:14px;font-weight:600;color:#1f2937;">
      ${nights}
    </div>
  </div>
</td>

<td width="2%"></td>

<td width="48%" valign="top">
  <div style="background:#eef3f2;border:1px solid #e2e8e7;border-radius:12px;padding:12px;">
    <div style="font-size:12px;color:#6b7c7b;margin-bottom:4px;">Guests</div>
    <div style="font-size:14px;font-weight:600;color:#1f2937;">
      ${guests}
    </div>
  </div>
</td>
</tr>
</table>

<!-- ===== HOST CONTACT ===== -->
${hostName
        ? `
<div style="font-size:12px;font-weight:600;letter-spacing:1px;color:#6b7c7b;margin-bottom:10px;">
HOST CONTACT
</div>

<div style="background:#eef3f2;border:1px solid #e2e8e7;border-radius:12px;padding:12px;margin-bottom:22px;">
  <div style="font-size:14px;font-weight:600;margin-bottom:6px;">
    ${hostName}
  </div>
  ${hostPhone ? `<div style="font-size:13px;color:#5f6b6a;margin-bottom:4px;">${hostPhone}</div>` : ""}
  ${hostEmail ? `<div style="font-size:13px;color:#5f6b6a;">${hostEmail}</div>` : ""}
</div>
`
        : ""
      }

<!-- ===== PAYMENT ===== -->
<div style="font-size:12px;font-weight:600;letter-spacing:1px;color:#6b7c7b;margin-bottom:10px;">
PAYMENT INFORMATION
</div>

<div style="background:#eef3f2;border:1px solid #e2e8e7;border-radius:12px;padding:12px;margin-bottom:22px;">

<table width="100%" cellpadding="4" cellspacing="0">
<tr>
<td style="font-size:13px;color:#5f6b6a;">Payment Method</td>
<td align="right" style="font-size:13px;">${paymentMethod}</td>
</tr>

<tr>
<td style="font-size:13px;color:#5f6b6a;">Room Charges (${nights} Nights)</td>
<td align="right" style="font-size:13px;">${money(subtotal)}</td>
</tr>

<tr>
<td style="font-size:13px;color:#5f6b6a;">Tax (GST)</td>
<td align="right" style="font-size:13px;">${money(cgst + sgst)}</td>
</tr>

<tr>
<td style="border-top:1px solid #d1d5db;padding-top:10px;font-size:14px;font-weight:600;">
Grand Total
</td>
<td align="right" style="border-top:1px solid #d1d5db;padding-top:10px;font-size:14px;font-weight:600;">
${money(grandTotal)}
</td>
</tr>

<tr>
<td colspan="2" style="padding-top:8px;font-size:11px;color:#6b7c7b;">
Order ID: ${orderId}
</td>
</tr>
</table>

</div>

<!-- ===== IMPORTANT INFO ===== -->
<div style="font-size:11px;font-weight:600;letter-spacing:1px;color:#6b7c7b;margin-bottom:10px;">
IMPORTANT INFORMATION
</div>

<div style="background:#eef3f2;border:1px solid #e2e8e7;border-radius:12px;padding:12px;">
<strong style="font-size:13px;">Check-in / Check-out Time</strong>
<div style="font-size:12px;color:#5f6b6a;margin-top:4px;">
Check-in: ${propertyCheckInTime || "2:00 PM"} onwards · Check-out: ${propertyCheckOutTime || "11:00 AM"}
</div>
</div>

<!-- ===== VIEW BOOKING BUTTON ===== -->
<div style="text-align:center;margin-top:20px;margin-bottom:10px;">
  <a href="${portalUrl}/account/bookings"
     style="
       display:inline-block;
       background:#038ba0;
       color:#ffffff;
       padding:14px 24px;
       font-size:14px;
       font-weight:600;
       border-radius:10px;
       text-decoration:none;
     ">
     View Booking
  </a>
</div>

<!-- ================= FOOTER ================= -->
<tr>
<td style="text-align:center;padding:24px;background:#f9fafb;font-size:12px;color:#6b7c7b;">
Need help?<br/>
Contact us at <strong>web.karabook@gmail.com</strong><br/>
© ${new Date().getFullYear()} Karabook. All rights reserved.
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`,
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