import axios from "axios";

/**
 * Send WhatsApp message using Meta Cloud API
 * @param {string} phone - 10-digit Indian mobile number
 * @param {string} message - Text body
 */
export const sendWhatsAppText = async (phone, message) => {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    await axios.post(
      `https://graph.facebook.com/v19.0/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        to: `91${phone}`,
        type: "text",
        text: { body: message },
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(`✅ WhatsApp message sent to ${phone}`);
  } catch (err) {
    console.error("❌ WhatsApp send error:", err.response?.data || err.message);
  }
};
