export function computeRefund(booking, property) {
  const today = new Date();
  const checkIn = new Date(booking.checkIn);

  const daysBefore =
    Math.ceil((checkIn - today) / (1000 * 60 * 60 * 24));

  let refundPercent = 0;

  for (const rule of property.cancellationPolicy) {
    if (daysBefore >= rule.minDaysBefore) {
      refundPercent = rule.refundPercent;
      break;
    }
  }

  const refundAmount =
    (booking.grandTotal * refundPercent) / 100;

  return {
    daysBefore,
    refundPercent,
    refundAmount: Math.round(refundAmount)
  };
}