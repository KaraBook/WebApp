import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

let recaptchaVerifier = null;
let recaptchaWidgetId = null;

export const getRecaptcha = async () => {
  const container = document.getElementById("recaptcha-container");
  if (!container) throw new Error("Recaptcha container missing");

  // ✅ reuse existing verifier
  if (recaptchaVerifier) return recaptchaVerifier;

  recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
      size: "invisible",
      callback: () => {},
      "expired-callback": () => {
        // expire => reset widget, do not destroy verifier
        try {
          if (recaptchaWidgetId !== null) window.grecaptcha?.reset(recaptchaWidgetId);
        } catch {}
      },
    }
  );

  recaptchaWidgetId = await recaptchaVerifier.render();
  return recaptchaVerifier;
};

export const sendOtp = async (phoneNumber) => {
  const verifier = await getRecaptcha();
  return signInWithPhoneNumber(auth, phoneNumber, verifier);
};

export const resetRecaptcha = () => {
  try {
    if (recaptchaWidgetId !== null) window.grecaptcha?.reset(recaptchaWidgetId);
  } catch {}
};