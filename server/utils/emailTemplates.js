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
  taxRate = 18,
  portalUrl = process.env.TRAVELLER_PORTAL_URL,
}) {
  const formatIndiaDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

  const formattedCheckIn = formatIndiaDate(checkIn);
  const formattedCheckOut = formatIndiaDate(checkOut);
  const formattedSubtotal = money(subtotal);
  const formattedCGST = money(cgst);
  const formattedSGST = money(sgst);
  const formattedTotal = money(grandTotal);

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
              <tr>
  <td style="padding:6px 0;"><strong>Room Charges:</strong></td>
  <td>${formattedSubtotal}</td>
</tr>

<tr>
  <td style="padding:6px 0;">CGST:</td>
  <td>${formattedCGST}</td>
</tr>
<tr>
  <td style="padding:6px 0;">SGST:</td>
  <td>${formattedSGST}</td>
</tr>

<tr>
  <td style="border-top:1px solid #eee;padding-top:10px">
    <strong>Total Paid</strong>
  </td>
  <td style="border-top:1px solid #eee;padding-top:10px">
    <strong>${formattedTotal}</strong>
  </td>
</tr>

<tr><td><strong>Payment Method:</strong></td><td>${paymentMethod}</td></tr>
<tr><td><strong>Order ID:</strong></td><td>${orderId}</td></tr>
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