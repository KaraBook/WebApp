export function computePricing(booking, property) {
  const start = new Date(booking.checkIn);
  const end = new Date(booking.checkOut);

  let weekdayNights = 0;
  let weekendNights = 0;
  let d = new Date(start);

  while (d < end) {
    const day = d.getDay();
    if (day === 0 || day === 6) weekendNights++;
    else weekdayNights++;
    d.setDate(d.getDate() + 1);
  }

  const adults = booking.guests.adults || 0;
  const children = booking.guests.children || 0;

  const baseGuests = property.baseGuests || 0;

  const extraAdults = Math.max(0, adults - baseGuests);
  const extraChildren = Math.max(
    0,
    children - Math.max(0, baseGuests - adults)
  );

  const weekdayRate = property.pricingPerNightWeekdays || 0;
  const weekendRate = property.pricingPerNightWeekend || weekdayRate;

  const extraAdultRate = property.extraAdultCharge || 0;
  const extraChildRate = property.extraChildCharge || 0;

  const roomWeekdayAmount = weekdayNights * weekdayRate;
  const roomWeekendAmount = weekendNights * weekendRate;

  const extraAdultAmount =
    extraAdults * extraAdultRate * booking.totalNights;

  const extraChildAmount =
    extraChildren * extraChildRate * booking.totalNights;

  const vegAmount =
    (booking.meals?.veg || 0) * (property.vegMealRate || 0);

  const nonVegAmount =
    (booking.meals?.nonVeg || 0) * (property.nonVegMealRate || 0);

  const subtotal =
    roomWeekdayAmount +
    roomWeekendAmount +
    extraAdultAmount +
    extraChildAmount +
    vegAmount +
    nonVegAmount;

  const tax = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + tax;

  return {
    room: {
      weekdayNights,
      weekendNights,
      weekdayRate,
      weekendRate,
      roomWeekdayAmount,
      roomWeekendAmount,
    },
    extraGuests: {
      extraAdults,
      extraChildren,
      extraAdultRate,
      extraChildRate,
      extraAdultAmount,
      extraChildAmount,
    },
    meals: {
      veg: booking.meals?.veg || 0,
      nonVeg: booking.meals?.nonVeg || 0,
      vegAmount,
      nonVegAmount,
    },
    subtotal,
    tax,
    grandTotal,
  };
}
