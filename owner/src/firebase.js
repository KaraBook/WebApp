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


export const buildRecaptcha = () => {
  if (typeof window === "undefined") return null;

  if (window.recaptchaVerifier) {
    return window.recaptchaVerifier; 
  }

  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
      size: "invisible",
      callback: () => {
        console.log("reCAPTCHA verified");
      },
    }
  );

  window.recaptchaVerifier.render();
  return window.recaptchaVerifier;
};



export { signInWithPhoneNumber };
