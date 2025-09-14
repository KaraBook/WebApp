import { useState } from "react";
import { auth, buildRecaptcha, signInWithPhoneNumber } from "../firebase";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [phase, setPhase] = useState("enter"); // enter | verify
  const [confirmRes, setConfirmRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginWithTokens } = useAuth();
  const navigate = useNavigate();

  const sendOtp = async () => {
  const ten = mobile.replace(/\D/g, "");
  if (ten.length !== 10) return alert("Enter 10-digit mobile");
  setLoading(true);
  try {
    const verifier = await buildRecaptcha();  // ensures render()
    const confirmation = await signInWithPhoneNumber(auth, `+91${ten}`, verifier);
    setConfirmRes(confirmation);
    setPhase("verify");
  } catch (e) {
    console.error("sendOtp error:", e?.code, e?.message);
    alert(mapFirebasePhoneError(e));
  } finally {
    setLoading(false);
  }
};



function mapFirebasePhoneError(e) {
  const c = e?.code || "";
  if (c.includes("unauthorized-domain")) return "Add this domain under Auth → Settings → Authorized domains.";
  if (c.includes("missing-recaptcha-token") || c.includes("captcha-check-failed"))
    return "reCAPTCHA failed. Disable ad blockers and try again.";
  if (c.includes("too-many-requests")) return "Too many OTP requests. Wait a minute and retry.";
  if (c.includes("billing-not-enabled")) return "Turn OFF App Check enforcement or Enterprise reCAPTCHA.";
  if (c.includes("quota-exceeded")) return "Daily SMS quota reached on Spark plan. Try later or use a test number.";
  return e?.message || "Couldn’t send OTP. Please try again.";
}


  const verifyOtp = async () => {
    if (!confirmRes) return;
    if (otp.length < 6) return alert("Enter the 6-digit OTP");
    setLoading(true);
    try {
      const cred = await confirmRes.confirm(otp);
      const idToken = await cred.user.getIdToken();

      // Exchange for app tokens (server validates + creates owner session)
      const r = await api.post("/api/auth/resort-owner/login", null, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      loginWithTokens(r.data);
      navigate("/dashboard", { replace: true });
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || e.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="w-full max-w-md bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-center">Resort Owner Login</h1>

        {phase === "enter" && (
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium">Mobile Number</label>
            <div className="flex gap-2">
              <span className="px-3 py-2 rounded border bg-gray-50">+91</span>
              <input
                className="flex-1 px-3 py-2 rounded border outline-none"
                placeholder="10-digit mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
            <button
              disabled={loading}
              onClick={sendOtp}
              className="w-full py-2 rounded bg-black text-white hover:bg-gray-900"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}

        {phase === "verify" && (
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium">Enter OTP</label>
            <input
              className="w-full px-3 py-2 rounded border outline-none tracking-widest text-center"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              placeholder="------"
            />
            <button
              disabled={loading}
              onClick={verifyOtp}
              className="w-full py-2 rounded bg-black text-white hover:bg-gray-900"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <button
              type="button"
              onClick={() => setPhase("enter")}
              className="w-full py-2 rounded border"
            >
              Change number
            </button>
          </div>
        )}

        {/* Invisible reCAPTCHA root */}
        <div id="recaptcha-container" />
      </div>
    </div>
  );
}
