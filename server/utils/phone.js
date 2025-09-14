export const normalizeMobile = (v) => {
  if (!v) return "";
  const digits = String(v).replace(/\D/g, ""); // strip +, spaces, etc
  return digits.slice(-10); // keep last 10 (India)
};
