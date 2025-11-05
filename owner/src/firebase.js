import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};

let app;
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} catch (err) {
  console.warn("Firebase already initialized:", err.message);
}
export const auth = getAuth(app);

export const buildRecaptcha = async () => {
  if (typeof window === "undefined") throw new Error("No window object");
  if (!auth || !auth.app) throw new Error("Auth instance not ready");

  console.log("⚙️ Building reCAPTCHA with auth:", auth.app.name);

  if (window.recaptchaVerifier) {
    try { await window.recaptchaVerifier.clear(); } catch {}
    window.recaptchaVerifier = null;
  }

  const verifier = new RecaptchaVerifier(
    auth, 
    "recaptcha-container",
    {
      size: "invisible",
      callback: () => console.log("✅ reCAPTCHA verified"),
      "expired-callback": () => {
        console.warn("⚠️ reCAPTCHA expired — clearing");
        try { verifier.clear(); } catch {}
        window.recaptchaVerifier = null;
      },
    }
  );

  await verifier.render();
  window.recaptchaVerifier = verifier;
  console.log("✅ reCAPTCHA initialized successfully");
  return verifier;
};

export { signInWithPhoneNumber };
