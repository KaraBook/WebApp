import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

/** Create a fresh invisible reCAPTCHA and ensure it renders */
export const buildRecaptcha = async () => {
  // clear any old instance
  if (window.recaptchaVerifier) {
    try { window.recaptchaVerifier.clear(); } catch {}
    window.recaptchaVerifier = null;
  }
  window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "invisible",
    callback: () => {},                 // token solved
    "expired-callback": () => {         // recreate on expiry
      try { window.recaptchaVerifier.clear(); } catch {}
      window.recaptchaVerifier = null;
    },
  });
  await window.recaptchaVerifier.render(); // <-- this is critical
  return window.recaptchaVerifier;
};

export { signInWithPhoneNumber };
