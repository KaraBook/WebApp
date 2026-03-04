export function propertyCreatedTemplate({
  ownerFirstName,
  ownerEmail,
  ownerPassword,
  propertyName,
  propertyAddress,
  propertyType,
  createdNewUser,
  portalUrl = `${process.env.OWNER_PORTAL_URL}`,
}) {
  const primary = "#038ba0";
  const greeting = ownerFirstName
    ? `Welcome to Karabook, ${ownerFirstName}!`
    : "Welcome to Karabook!";

  const credentialsBlock = createdNewUser
    ? `
      <tr>
        <td style="padding:10px 30px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;padding:16px;">
            <tr>
              <td style="font-weight:600;font-size:14px;color:#374151;padding-bottom:10px;">
                🔐 Your Login Credentials
              </td>
            </tr>
            <tr>
              <td style="font-size:14px;color:#6b7280;padding-bottom:8px;">
                <strong>USERNAME</strong><br/>
                ${ownerEmail}
              </td>
            </tr>
            <tr>
              <td style="font-size:14px;color:#6b7280;">
                <strong>PASSWORD</strong><br/>
                ${ownerPassword}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
    : "";

  return {
    subject: `Your property "${propertyName}" has been added`,

    html: `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 0;font-family:Inter,Arial,sans-serif;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">

<!-- HEADER -->
<tr>
<td style="background:${primary};padding:20px 24px;color:white;font-size:18px;font-weight:600;">
Karabook
</td>
</tr>

<!-- BODY -->
<tr>
<td style="padding:10px 30px;">

<!-- OWNER ACCOUNT CREATED TAG -->
<div style="background:#edfdf3;color:#21c45d;font-size:13px;padding:8px 12px;border-radius:6px;display:inline-block;margin-bottom:10px; margin-top:10px;">
Owner account created
</div>

<h2 style="margin:0 0 10px 0;font-size:22px;color:#111827;">
${greeting}
</h2>

<p style="font-size:14px;color:#6b7280;margin-bottom:20px;">
Your owner account has been created and your property 
<strong>${propertyName}</strong> has been added in 
<strong>draft</strong> mode. Once reviewed, it will go live and start receiving bookings.
</p>

<!-- PROPERTY CARD -->
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:0px;">
<tr>
<td style="font-size:16px;font-weight:600;color:#111827;">
${propertyName}
</td>
</tr>

<tr>
<td style="font-size:13px;color:#6b7280;padding-top:4px;">
${propertyAddress || "—"}
</td>
</tr>

<tr>
<td style="padding-top:10px;font-size:13px;color:#6b7280;">
Property Type: <strong>${propertyType || "—"}</strong>
</td>
</tr>

<tr>
<td style="padding-top:6px;font-size:13px;color:#6b7280;">
Status: <span style="background:#fef3c7;color:#92400e;padding:3px 8px;border-radius:6px;font-size:12px;">Draft</span>
</td>
</tr>

</table>

${credentialsBlock}

<!-- BUTTON -->
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding-top:10px;">
<a href="${portalUrl}" 
style="
display:inline-block;
background:${primary};
color:white;
text-decoration:none;
padding:14px 26px;
border-radius:8px;
font-size:15px;
font-weight:600;
">
Login to Owner Dashboard →
</a>
</td>
</tr>
</table>

<p style="font-size:12px;color:#9ca3af;margin-top:25px;text-align:center;">
If you didn't request this account, please contact our support team immediately.
</p>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="text-align:center;font-size:12px;color:#9ca3af;padding:20px;">
© 2026 Karabook. All rights reserved.<br/>
You received this email because you're registered on Karabook.<br/><br/>
Help Center · Privacy Policy · Unsubscribe
</td>
</tr>

</table>

</td>
</tr>
</table>
`,

    text:
      `Property added successfully\n\n` +
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
  propertyAddress,
  propertyType,
  portalUrl = `${process.env.OWNER_PORTAL_URL}`,
}) {
  const primary = "#038ba0";

  const greeting = ownerFirstName
    ? `Hi ${ownerFirstName}, great news!`
    : "Great news!";

  return {
    subject: `Your property "${propertyName}" is now live! 🎉`,

    html: `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 0;font-family:Inter,Arial,sans-serif;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">

<!-- HEADER -->
<tr>
<td style="background:${primary};padding:20px 24px;color:white;font-size:18px;font-weight:600;">
Karabook
</td>
</tr>

<!-- BODY -->
<tr>
<td style="padding:30px 30px;">

<!-- SUCCESS BADGE -->
<div style="background:#e8f5ef;color:#0f8a5f;font-size:13px;padding:10px 14px;border-radius:8px;display:inline-block;margin-bottom:20px;">
✔ Property added successfully
</div>

<h2 style="margin:0 0 10px 0;font-size:22px;color:#111827;">
Your property is now live! 🎉
</h2>

<p style="font-size:14px;color:#6b7280;margin-bottom:20px;">
${greeting} Your property has been reviewed and is now live on Karabook.
Travellers can start booking it right away.
</p>

<!-- PROPERTY CARD -->
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:20px;">
<tr>
<td style="font-size:16px;font-weight:600;color:#111827;">
${propertyName}
</td>
</tr>

<tr>
<td style="font-size:13px;color:#6b7280;padding-top:4px;">
${propertyAddress || "—"}
</td>
</tr>

<tr>
<td style="padding-top:10px;font-size:13px;color:#6b7280;">
Property Type: <strong>${propertyType || "—"}</strong>
</td>
</tr>

<tr>
<td style="padding-top:6px;font-size:13px;color:#6b7280;">
Status:
<span style="background:#dcfce7;color:#166534;padding:3px 8px;border-radius:6px;font-size:12px;">
Active
</span>
</td>
</tr>
</table>

<!-- BUTTON -->
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding-top:10px;">
<a href="${portalUrl}" 
style="
display:inline-block;
background:${primary};
color:white;
text-decoration:none;
padding:14px 26px;
border-radius:8px;
font-size:15px;
font-weight:600;
">
View Property Dashboard →
</a>
</td>
</tr>
</table>

<p style="font-size:12px;color:#9ca3af;margin-top:25px;text-align:center;">
You can manage your property settings, pricing, and availability from the dashboard.
</p>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="text-align:center;font-size:12px;color:#9ca3af;padding:20px;">
© 2026 Karabook. All rights reserved.<br/>
You received this email because you're registered on Karabook.<br/><br/>
Help Center · Privacy Policy · Unsubscribe
</td>
</tr>

</table>

</td>
</tr>
</table>
`,

    text:
      `Hi,\n\n` +
      `Great news! Your property "${propertyName}" is now live on Karabook.\n\n` +
      `Travellers can now start booking it.\n\n` +
      `Dashboard: ${portalUrl}`,
  };
}


export function ownerBookingNotificationTemplate({
  ownerName,
  propertyName,
  propertyAddress,
  travellerName,
  checkIn,
  checkOut,
  nights,
  guests,
  grandTotal,
  portalUrl = `${process.env.OWNER_PORTAL_URL}/owner/dashboard`,
}) {
  const primary = "#038ba0";

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
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 0;font-family:Inter,Arial,sans-serif;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;border:1px solid #e5e7eb;overflow:hidden;">

<!-- HEADER -->
<tr>
<td style="background:${primary};padding:20px 24px;color:white;font-size:18px;font-weight:600;">
Karabook
</td>
</tr>

<tr>
<td style="padding:30px;">

<!-- BADGE -->
<div style="background:#eaf2ff;color:#2b6cb0;font-size:13px;padding:8px 12px;border-radius:8px;display:inline-block;margin-bottom:15px;">
📅 New booking received
</div>

<h2 style="margin:0 0 10px 0;font-size:22px;color:#111827;">
New Booking Alert 🎉
</h2>

<p style="font-size:14px;color:#6b7280;margin-bottom:20px;">
Hi ${ownerName}, you have received a new booking for <strong>${propertyName}</strong>.
</p>

<!-- PROPERTY CARD -->
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:16px;">
<tr>
<td style="font-size:16px;font-weight:600;color:#111827;">
${propertyName}
</td>
</tr>

<tr>
<td style="font-size:13px;color:#6b7280;padding-top:4px;">
${propertyAddress || "—"}
</td>
</tr>
</table>

<!-- BOOKING DETAILS CARD -->
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:16px;">
<tr>
<td style="font-weight:600;color:#111827;padding-bottom:10px;">
Booking Details
</td>
</tr>

<tr>
<td style="font-size:14px;color:#374151;padding-bottom:8px;">
<strong>Traveller:</strong> ${travellerName}
</td>
</tr>

<tr>
<td style="font-size:14px;color:#374151;padding-bottom:8px;">
<strong>Check-in / Check-out:</strong> ${formatDate(checkIn)} → ${formatDate(checkOut)}
</td>
</tr>

<tr>
<td style="font-size:14px;color:#374151;padding-bottom:8px;">
<strong>Nights:</strong> ${nights}
</td>
</tr>

<tr>
<td style="font-size:14px;color:#374151;">
<strong>Guests:</strong> ${guests}
</td>
</tr>
</table>

<!-- PAYMENT CARD -->
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #cfe0ff;background:#f5f9ff;border-radius:10px;padding:16px;margin-bottom:20px;">
<tr>
<td style="font-size:13px;color:#6b7280;">
TOTAL PAID
</td>
<td align="right">
<span style="background:#dcfce7;color:#166534;font-size:12px;padding:4px 8px;border-radius:6px;">
Paid
</span>
</td>
</tr>

<tr>
<td colspan="2" style="font-size:22px;font-weight:600;color:#111827;padding-top:6px;">
${money(grandTotal)}
</td>
</tr>
</table>

<!-- BUTTON -->
<table width="100%">
<tr>
<td align="center">
<a href="${portalUrl}" style="display:inline-block;background:${primary};color:#fff;text-decoration:none;padding:14px 26px;border-radius:8px;font-size:15px;font-weight:600;">
View Booking in Dashboard →
</a>
</td>
</tr>
</table>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="text-align:center;font-size:12px;color:#9ca3af;padding:20px;">
© 2026 Karabook. All rights reserved.<br/>
You received this email because you're registered on Karabook.<br/><br/>
Help Center · Privacy Policy · Unsubscribe
</td>
</tr>

</table>

</td>
</tr>
</table>
`,
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