export default function loadRazorpay(callback) {
  if (window.Razorpay) return callback();

  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = () => callback();
  script.onerror = () => console.error("Razorpay SDK failed to load");
  document.body.appendChild(script);
}
