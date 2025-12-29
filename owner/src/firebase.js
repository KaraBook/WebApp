// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

/**
 * Firebase config
 * Matches your VITE_FB_* environment variables exactly
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};

const app = initializeApp(firebaseConfig);

/**
 * Firebase Auth instance
 */
export const auth = getAuth(app);

/**
 * Create or reuse invisible reCAPTCHA
 * Required element:
 *   <div id="recaptcha-container"></div>
 */
export const buildRecaptcha = () => {
  if (window.recaptchaVerifier) {
    return window.recaptchaVerifier;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved
      },
      "expired-callback": () => {
        resetRecaptcha();
      },
    }
  );

  return window.recaptchaVerifier;
};

/**
 * Reset reCAPTCHA safely
 */
export const resetRecaptcha = () => {
  try {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }

    const el = document.getElementById("recaptcha-container");
    if (el) el.innerHTML = "";
  } catch (err) {
    console.warn("reCAPTCHA reset failed", err);
  }
};

/**
 * Firebase OTP sender
 */
export { signInWithPhoneNumber };
