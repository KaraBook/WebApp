export const normalizeMobile = (mobile) => {
  if (!mobile) return null;

  let digits = String(mobile).replace(/\D/g, "");

  if (digits.startsWith("91") && digits.length === 12) {
    digits = digits.slice(2);
  }

  return digits.length === 10 ? digits : null;
};
