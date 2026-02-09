import admin from "../config/firebase.js";

export const verifyFirebaseToken = async (req, res, next) => {
  let idToken = req.headers["x-firebase-token"];

  if (!idToken) {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Firebase ")) {
      idToken = authHeader.split(" ")[1];
    }
  }

  if (!idToken) {
    return res.status(401).json({
      message: "Firebase token missing",
    });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error("Firebase token verification failed:", error);

    return res.status(401).json({
      message: "Invalid Firebase token",
    });
  }
};
