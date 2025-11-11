export default function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      return resolve(true);
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Razorpay SDK failed to load");
      reject(false);
    };

    document.body.appendChild(script);
  });
}
