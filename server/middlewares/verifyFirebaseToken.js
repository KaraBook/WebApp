import admin from "../config/firebase.js";

export const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
     console.log("❌ No Authorization header");
    return res.status(401).json({ message: "No token provided" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    console.log("✅ Firebase token verified");
    console.log("Firebase UID:", decodedToken.uid);
    console.log("Firebase Phone:", decodedToken.phone_number);
    console.log("Firebase Provider:", decodedToken.firebase?.sign_in_provider);
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.log("❌ Firebase verify FAILED");
    console.error("Firebase token verification failed:", error);
    res.status(401).json({ message: "Invalid Firebase token" });
  }
};
