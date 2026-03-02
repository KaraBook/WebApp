export function isCancelled(b) {
  return b?.cancelled === true;
}

export function isPaid(b) {
  if (!b) return false;

  return (
    b.paymentStatus === "paid" &&
    b.status === "confirmed"
  );
}

export function isCompleted(b) {
  if (!b?.checkOut) return false;
  return new Date(b.checkOut) < new Date() && !isCancelled(b);
}

export function canViewInvoice(b) {
  return isPaid(b) && !isCancelled(b);
}

export function canRate(b) {
  if (!b) return false;

  const now = new Date();
  const checkout = new Date(b.checkOut);

  const isPaid =
    b.paymentStatus === "paid" ||
    b.status === "confirmed" ||
    b.paymentId;

  if (b.cancelled) return false;
  if (!isPaid) return false;
  if (now < checkout) return false;
  if (b.hasReview) return false;

  return true;
}

export function canCancel(b) {
  if (!b) return false;
  if (isCancelled(b)) return false;
  if (!isPaid(b)) return false;
  if (!b.checkIn) return false;
  const now = new Date();
  const checkInDate = new Date(b.checkIn);
  if (checkInDate <= now) return false;
  return true;
}