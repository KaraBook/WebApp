import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, buildRecaptcha, signInWithPhoneNumber } from "../firebase";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";


export default function Login() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [phase, setPhase] = useState("enter");
  const [confirmRes, setConfirmRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginWithTokens } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        try { buildRecaptcha(); } catch (e) { console.log(e.message); }
      }, 300);
    }
  }, []);

  const sendOtp = async () => {
    const ten = mobile.replace(/\D/g, "");
    if (ten.length !== 10) return toast.error("Enter valid 10-digit mobile number");

    setLoading(true);
    try {
      const verifier = window.recaptchaVerifier || (await buildRecaptcha());
      const confirmation = await signInWithPhoneNumber(auth, `+91${ten}`, verifier);

      setConfirmRes(confirmation);
      setPhase("verify");
      toast.success("OTP sent successfully");
    } catch (e) {
      console.error("sendOtp error:", e);
      toast.error(mapFirebasePhoneError(e));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!confirmRes) return;
    if (otp.length < 6) return toast.error("Enter the 6-digit OTP");
    setLoading(true);
    try {
      const cred = await confirmRes.confirm(otp);
      const idToken = await cred.user.getIdToken();
      const r = await api.post("/api/auth/resort-owner/login", null, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      loginWithTokens(r.data);
      toast.success("Login successful");
      navigate("/dashboard", { replace: true });
    } catch (e) {
      console.error("verifyOtp error:", e);
      toast.error(e.response?.data?.message || e.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  function mapFirebasePhoneError(e) {
    const c = e?.code || "";
    if (c.includes("unauthorized-domain"))
      return "Unauthorized domain. Add it under Firebase Auth settings.";
    if (c.includes("invalid-app-credential"))
      return "Invalid Firebase credentials or reCAPTCHA verification failed.";
    if (c.includes("captcha-check-failed"))
      return "reCAPTCHA verification failed. Disable ad blockers and retry.";
    if (c.includes("too-many-requests"))
      return "Too many OTP requests. Please wait and retry.";
    if (c.includes("billing-not-enabled"))
      return "App Check or billing issue in Firebase.";
    return e?.message || "Couldn't send OTP. Please try again.";
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md border border-border shadow-sm">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-xl font-semibold tracking-tight">Resort Owner Login</CardTitle>
          <CardDescription>Sign in securely using your registered mobile number</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {phase === "enter" && (
            <div className="space-y-3">
              <Label htmlFor="mobile">Mobile Number</Label>
              <div className="flex gap-2">
                <div className="px-3 py-2 rounded-md border bg-muted text-sm text-gray-700 select-none">+91</div>
                <Input id="mobile" placeholder="10-digit mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} />
              </div>
              <Button onClick={sendOtp} disabled={loading} className="w-full">
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </div>
          )}

          {phase === "verify" && (
            <div className="space-y-3">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input id="otp" placeholder="6-digit OTP" maxLength={6}
                value={otp} onChange={(e) => setOtp(e.target.value)}
                className="text-center tracking-widest text-lg" />
              <Button onClick={verifyOtp} disabled={loading} className="w-full">
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>
              <Button variant="outline" onClick={() => setPhase("enter")} className="w-full">
                Change Number
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center flex-col items-center gap-1">
          <p className="text-xs text-muted-foreground">Protected by Google reCAPTCHA</p>
          <div id="recaptcha-container" /> {/* must exist in DOM */}
        </CardFooter>
      </Card>
    </div>
  );
}
