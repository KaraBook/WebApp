export const normalizeMobile = (v) => {
  if (!v) return "";
  const digits = String(v).replace(/\D/g, ""); 
  return digits.slice(-10);
};
