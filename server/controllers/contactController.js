import { sendMail } from "../utils/mailer.js";

export const sendContactEnquiry = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const html = `
      <div style="font-family:Arial;padding:20px">
        <h2>New Contact Enquiry — Karabook</h2>

        <table style="border-collapse:collapse;width:100%;max-width:600px">
          <tr>
            <td style="border:1px solid #ddd;padding:8px"><b>Name</b></td>
            <td style="border:1px solid #ddd;padding:8px">${name}</td>
          </tr>

          <tr>
            <td style="border:1px solid #ddd;padding:8px"><b>Email</b></td>
            <td style="border:1px solid #ddd;padding:8px">${email}</td>
          </tr>

          <tr>
            <td style="border:1px solid #ddd;padding:8px"><b>Phone</b></td>
            <td style="border:1px solid #ddd;padding:8px">${phone}</td>
          </tr>

          <tr>
            <td style="border:1px solid #ddd;padding:8px"><b>Message</b></td>
            <td style="border:1px solid #ddd;padding:8px">${message}</td>
          </tr>
        </table>

        <p style="margin-top:20px;color:#777">
          Sent from Karabook website contact page
        </p>
      </div>
    `;

    await sendMail({
      to: "web.karabook@gmail.com",
      subject: `New Enquiry from ${name}`,
      html,
      text: `${name} (${email}, ${phone}) says: ${message}`,
    });

    res.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (err) {
    console.error("CONTACT MAIL ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};



export const sendPropertyLead = async (req, res) => {
  try {
    const { name, email, mobile, propertyName, address, message } = req.body;

    if (!name || !email || !mobile || !propertyName || !address) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // phone validation (VERY IMPORTANT)
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number",
      });
    }

    const html = `
      <div style="font-family:Arial;padding:20px">
        <h2>New Property Listing Request — KaraBook</h2>

        <table style="border-collapse:collapse;width:100%;max-width:650px">
          <tr>
            <td style="border:1px solid #ddd;padding:8px"><b>Owner Name</b></td>
            <td style="border:1px solid #ddd;padding:8px">${name}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ddd;padding:8px"><b>Email</b></td>
            <td style="border:1px solid #ddd;padding:8px">${email}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ddd;padding:8px"><b>Mobile</b></td>
            <td style="border:1px solid #ddd;padding:8px">${mobile}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ddd;padding:8px"><b>Property Name</b></td>
            <td style="border:1px solid #ddd;padding:8px">${propertyName}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ddd;padding:8px"><b>Address</b></td>
            <td style="border:1px solid #ddd;padding:8px">${address}</td>
          </tr>
          <tr>
            <td style="border:1px solid #ddd;padding:8px"><b>Message</b></td>
            <td style="border:1px solid #ddd;padding:8px">${message || "-"}</td>
          </tr>
        </table>

        <p style="margin-top:20px;color:#666">
          This lead came from KaraBook “List Your Property” page.
        </p>
      </div>
    `;

    await sendMail({
      to: "web.karabook@gmail.com",
      subject: `🏡 New Owner Lead: ${propertyName}`,
      html,
      text: `${name} (${mobile}) wants to list property ${propertyName}`,
    });

    res.json({
      success: true,
      message: "Lead submitted successfully",
    });
  } catch (err) {
    console.error("PROPERTY LEAD ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to submit request",
    });
  }
};