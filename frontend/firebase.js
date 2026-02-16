import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

let recaptchaVerifier = null;

export const initRecaptcha = async () => {
  const el = document.getElementById("recaptcha-container");
  if (!el) throw new Error("reCAPTCHA container not found");

  if (recaptchaVerifier) return recaptchaVerifier;

  recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "invisible",
  });

  await recaptchaVerifier.render();

  return recaptchaVerifier;
};

export const clearRecaptcha = () => {
  try {
    recaptchaVerifier?.clear();
  } catch {}
  recaptchaVerifier = null;
};

export const sendOtp = async (phoneNumber) => {
  const verifier = await initRecaptcha();
  return signInWithPhoneNumber(auth, phoneNumber, verifier);
};
