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

export const getRecaptcha = async () => {

  const container = document.getElementById("recaptcha-container");
  if (!container) throw new Error("Recaptcha container missing");

  if (recaptchaVerifier) {
    try {
      await recaptchaVerifier.render();
      return recaptchaVerifier;
    } catch {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }
  }

  recaptchaVerifier = new RecaptchaVerifier(
    container,
    {
      size: "invisible",
      callback: () => { },
      "expired-callback": () => {
        clearRecaptcha();
      },
    },
    auth
  );
  
  await recaptchaVerifier.render();
  return recaptchaVerifier;
};

export const sendOtp = async (phoneNumber) => {
  const verifier = await getRecaptcha();
  return signInWithPhoneNumber(auth, phoneNumber, verifier);
};

export const clearRecaptcha = () => {
  if (recaptchaVerifier) {
    try { recaptchaVerifier.clear(); } catch { }
    recaptchaVerifier = null;
  }
};