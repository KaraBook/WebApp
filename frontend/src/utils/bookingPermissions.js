export function isCancelled(b) {
  return b?.cancelled === true;
}

export function isPaid(b) {
  return (
    b?.paymentStatus === "paid" ||
    b?.status === "paid" ||
    b?.status === "confirmed" ||
    !!b?.paymentId
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
  return isCompleted(b) && isPaid(b);
}