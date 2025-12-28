import React, { useEffect, useState, useRef } from "react";
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

export default function Login({ userType = "owner" }) {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [phase, setPhase] = useState("enter");
  const [confirmRes, setConfirmRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const autoVerifyTriggered = useRef(false);

  const { loginWithTokens } = useAuth();
  const navigate = useNavigate();

  /* -------------------- INIT RECAPTCHA -------------------- */
  useEffect(() => {
    buildRecaptcha();
  }, []);

  /* -------------------- SEND OTP -------------------- */
  const sendOtp = async () => {
  const num = mobile.replace(/\D/g, "");
  if (num.length !== 10) {
    toast.error("Enter valid 10-digit number");
    return;
  }

  setLoading(true);

  try {
    const verifier = window.recaptchaVerifier;

    const precheckUrl =
      userType === "manager"
        ? SummaryApi.managerPrecheck?.url
        : SummaryApi.ownerPrecheck?.url;

    await api.post(precheckUrl, { mobile: num });

    const confirmation = await signInWithPhoneNumber(
      auth,
      `+91${num}`,
      verifier
    );

    setConfirmRes(confirmation);
    setPhase("verify");
    setOtp("");
    autoVerifyTriggered.current = false;

    setCanResend(false);
    setTimer(90);

    toast.success("OTP sent successfully");
  } catch (err) {
    console.error("sendOtp error:", err);

    toast.error(
      err.code === "auth/too-many-requests"
        ? "Too many attempts. Try again later."
        : err?.response?.data?.message || "Failed to send OTP"
    );
  } finally {
    setLoading(false);
  }
};


  /* -------------------- OTP TIMER -------------------- */
  useEffect(() => {
    if (!canResend && timer > 0) {
      const timeout = setTimeout(() => setTimer((t) => t - 1), 1000);
      return () => clearTimeout(timeout);
    } else if (timer === 0 && !canResend) {
      setCanResend(true);
    }
  }, [timer, canResend]);

  /* -------------------- VERIFY OTP -------------------- */
  const verifyOtp = async () => {
    if (!confirmRes || loading) return;
    if (otp.length !== 6) return;

    setLoading(true);

    try {
      const cred = await confirmRes.confirm(otp);
      const idToken = await cred.user.getIdToken();

      const loginUrl =
        userType === "manager"
          ? SummaryApi.managerLogin?.url
          : SummaryApi.ownerLogin?.url;

      const res = await api.post(loginUrl, null, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      loginWithTokens(res.data);

      toast.success(
        userType === "manager" ? "Manager logged in!" : "Login successful"
      );

      navigate(
        userType === "manager" ? "/manager/dashboard" : "/dashboard",
        { replace: true }
      );
    } catch (e) {
      console.error("OTP error:", e);

      toast.error(
        e.code === "auth/invalid-verification-code"
          ? "Invalid OTP. Please try again."
          : "OTP verification failed"
      );

    } finally {
      setLoading(false);
    }
  };


  /* -------------------- AUTO VERIFY ON 6 DIGITS -------------------- */
  useEffect(() => {
    if (
      phase === "verify" &&
      otp.length === 6 &&
      confirmRes &&
      !autoVerifyTriggered.current
    ) {
      autoVerifyTriggered.current = true;
      verifyOtp();
    }
  }, [otp, phase, confirmRes]);

  /* -------------------- JSX UI -------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md border border-border shadow-sm">
        <CardHeader className="text-center space-y-2">
          <img
            src="/owner/KarabookLogo.png"
            alt="Karabook"
            className="h-10 mx-auto"
          />

          <CardTitle className="text-xl font-semibold">
            {userType === "manager" ? "Manager Login" : "Resort Owner Login"}
          </CardTitle>

          <CardDescription>
            {userType === "manager"
              ? "Managers login using the number assigned by the owner"
              : "Sign in securely using your registered mobile number"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* ENTER MOBILE */}
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
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>

              <Button
                onClick={sendOtp}
                disabled={loading || !canResend}
                className="w-full"
              >
                {loading
                  ? "Sending OTP..."
                  : canResend
                    ? "Send OTP"
                    : `Resend in ${timer}s`}
              </Button>
            </div>
          )}

          {/* VERIFY OTP */}
          {phase === "verify" && (
            <div className="space-y-4">
              <Label>Enter OTP</Label>

              <Input
                placeholder="6-digit OTP"
                maxLength={6}
                value={otp}
                autoFocus
                onChange={(e) => {
                  autoVerifyTriggered.current = false;
                  setOtp(e.target.value.replace(/\D/g, ""));
                }}
                className="text-center tracking-widest text-lg"
              />

              {/* Fallback button (auto-triggered on 6 digits) */}
              <Button
                onClick={verifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>

              {canResend ? (
                <Button variant="outline" className="w-full" onClick={sendOtp}>
                  Resend OTP
                </Button>
              ) : (
                <Button variant="outline" disabled className="w-full opacity-50">
                  Resend in {timer}s
                </Button>
              )}
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
