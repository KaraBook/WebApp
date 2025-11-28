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

export const buildRecaptcha = () => {
  return new Promise((resolve, reject) => {
    try {
      if (window.recaptchaVerifier) {
        return resolve(window.recaptchaVerifier);
      }

      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
        },
        auth
      );

      window.recaptchaVerifier.render();
      resolve(window.recaptchaVerifier);
    } catch (e) {
      reject(e);
    }
  });
};


export { signInWithPhoneNumber };
