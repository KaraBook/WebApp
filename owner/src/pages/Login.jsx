import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, buildRecaptcha, signInWithPhoneNumber } from "../firebase";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { useAuth } from "../auth/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        try {
          buildRecaptcha();
        } catch (e) {
          console.log(e.message);
        }
      }, 300);
    }
  }, []);

  /* ---------------- SEND OTP ---------------- */
  const sendOtp = async () => {
    const ten = mobile.replace(/\D/g, "");
    if (ten.length !== 10) return toast.error("Enter valid 10-digit mobile number");

    if (!canResend) {
      return toast.error(`Please wait ${timer}s before requesting a new OTP`);
    }

    setLoading(true);
    try {
      const check = await api.post(SummaryApi.ownerPrecheck.url, { mobile: ten });
      if (!check.data?.success) {
        toast.error(check.data?.message || "This number is not authorized to log in.");
        setLoading(false);
        return;
      }

      const verifier = window.recaptchaVerifier || (await buildRecaptcha());
      const confirmation = await signInWithPhoneNumber(auth, `+91${ten}`, verifier);
      setConfirmRes(confirmation);
      setPhase("verify");
      toast.success("OTP sent successfully");

      setCanResend(false);
      setTimer(30);

    } catch (e) {
      console.error("sendOtp error:", e);
      toast.error(e.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!canResend && timer > 0) {
      const countdown = setTimeout(() => setTimer((t) => t - 1), 1000);
      return () => clearTimeout(countdown);
    } else if (timer === 0 && !canResend) {
      setCanResend(true);
    }
  }, [timer, canResend]);


  /* ---------------- VERIFY OTP ---------------- */
  const verifyOtp = async () => {
    if (!confirmRes) return;
    if (otp.length < 6) return toast.error("Enter the 6-digit OTP");

    setLoading(true);
    try {
      const cred = await confirmRes.confirm(otp);
      const idToken = await cred.user.getIdToken();

      const r = await api.post(SummaryApi.ownerLogin.url, null, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      loginWithTokens(r.data);
      toast.success("Login successful");
      navigate("/dashboard", { replace: true });
    } catch (e) {
      console.error("verifyOtp error:", e);
      if (e.code === "auth/invalid-verification-code") {
        toast.error("Incorrect OTP. Please try again.");
      } else if (e.code === "auth/session-expired") {
        toast.error("OTP session expired. Please resend OTP.");
        setPhase("enter");
      } else {
        toast.error(e.response?.data?.message || e.message || "OTP verification failed");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ERROR MAPPER ---------------- */
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

  /* ---------------- JSX ---------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md border border-border shadow-sm">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-xl font-semibold tracking-tight">
            <img
              src="/owner/KarabookLogo.png"
              alt="BookMyStay"
              className="h-3 w-auto md:h-14 m-auto"
            />
            Resort Owner Login
          </CardTitle>
          <CardDescription>
            Sign in securely using your registered mobile number
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {phase === "enter" && (
            <div className="space-y-3">
              <Label htmlFor="mobile">Mobile Number</Label>
              <div className="flex gap-2">
                <div className="px-3 py-2 rounded-md border bg-muted text-sm text-gray-700 select-none">
                  +91
                </div>
                <Input
                  id="mobile"
                  placeholder="10-digit mobile"
                  value={mobile}
                  maxLength={10}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) setMobile(value);
                  }}
                />
              </div>
              <Button
                onClick={sendOtp}
                disabled={loading || !canResend}
                className="w-full"
              >
                {loading ? "Sending OTP..." : canResend ? "Send OTP" : `Resend in ${timer}s`}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-1">
                Use your registered mobile number associated with your property account.
              </p>
            </div>
          )}

          {phase === "verify" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="otp" className="text-sm font-medium">Enter OTP</Label>
                {!canResend && (
                  <span className="text-xs text-gray-500">
                    Resend in {timer}s
                  </span>
                )}
              </div>

              <Input
                id="otp"
                placeholder="6-digit OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="text-center tracking-widest text-lg"
              />

              <Button onClick={verifyOtp} disabled={loading} className="w-full">
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>

              {canResend ? (
                <Button
                  variant="outline"
                  onClick={sendOtp}
                  className="w-full"
                >
                  Resend OTP
                </Button>
              ) : (
                <Button variant="outline" disabled className="w-full opacity-50">
                  Resend in {timer}s
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setPhase("enter")}
                className="w-full"
              >
                Change Number
              </Button>
            </div>
          )}

        </CardContent>

        <CardFooter className="flex justify-center flex-col items-center gap-1">
          <p className="text-xs text-muted-foreground">
            Protected by Google reCAPTCHA
          </p>
          <div id="recaptcha-container" />
        </CardFooter>
      </Card>
    </div>
  );
}
