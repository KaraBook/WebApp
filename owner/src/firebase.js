import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

let verifier = null;

export const buildRecaptcha = async () => {
  if (verifier) return verifier;

  verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "invisible",
  });

  await verifier.render();
  return verifier;
};

export const clearRecaptcha = () => {
  if (verifier) {
    verifier.clear();
    verifier = null;
  }
};

export { signInWithPhoneNumber };
