export function buildBookingWhatsappMessage(booking) {

    const propertyName = booking.propertyId?.propertyName || "our resort";

    const formatDate = (d) =>
        new Date(d).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

    const checkin = formatDate(booking.checkIn);
    const checkout = formatDate(booking.checkOut);

    const guests =
        typeof booking.guests === "object"
            ? (booking.guests.adults || 0) + (booking.guests.children || 0)
            : booking.guests || 0;

    const amount = Number(
        booking.grandTotal ?? booking.totalAmount ?? 0
    ).toLocaleString("en-IN");

    const message =
        `We’re excited to host you at *${propertyName}*

📅 Check-in: ${checkin}
📅 Check-out: ${checkout}
👥 Guests: ${guests}
💰 Booking Amount: ₹${amount}

Your stay is coming up soon!

If you need any assistance, special arrangements, or have questions before arrival, feel free to reply to this message.

We look forward to welcoming you!`;

    return message.trim();
}



export const buildCancelledWhatsappMessage = (b) => {
    const guest =
        `${b.userId?.firstName || ""} ${b.userId?.lastName || ""}`.trim() || "Guest";

    const property = b.propertyId?.propertyName || "our property";

    const formatDate = (d) =>
        new Date(d).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

    return `Hello ${guest},

Your booking at *${property}* has been cancelled.

📅 Original Stay: ${formatDate(b.checkIn)} → ${formatDate(b.checkOut)}

If you cancelled by mistake or want different dates, we’ll be happy to help 😊

For refund or any clarification, just reply to this message anytime.

We hope to host you in the future 🌿`;
};



export const encodeWhatsapp = (text) => {
    if (!text) return "";

    let cleaned = text.trimStart();

    cleaned = cleaned.normalize("NFC");

    cleaned = cleaned
        .replace(/📅/g, "•")
        .replace(/💰/g, "₹")
        .replace(/👥/g, "Guests:")
        .replace(/🌴✨/g, "")
        .replace(/🌿/g, "")
        .replace(/😊/g, "");

    return encodeURIComponent(cleaned);
};