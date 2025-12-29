import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  getRecaptcha,
  resetRecaptcha,
  signInWithPhoneNumber,
} from "../firebase";
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

  const verifyingRef = useRef(false);
  const lastAutoOtpRef = useRef("");

  const { loginWithTokens } = useAuth();
  const navigate = useNavigate();

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (!canResend && timer > 0) {
      const t = setTimeout(() => setTimer((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
    if (timer === 0 && !canResend) setCanResend(true);
  }, [timer, canResend]);

  /* ---------------- SEND OTP ---------------- */
  const sendOtp = async () => {
    const num = mobile.replace(/\D/g, "");
    if (num.length !== 10) return toast.error("Enter valid 10-digit number");

    setLoading(true);
    setOtp("");
    verifyingRef.current = false;
    lastAutoOtpRef.current = "";

    try {
      if (!document.getElementById("recaptcha-container")) {
        throw new Error("reCAPTCHA container not mounted");
      }

      resetRecaptcha();
      const verifier = await getRecaptcha();

      const precheckUrl =
        userType === "manager"
          ? SummaryApi.managerPrecheck.url
          : SummaryApi.ownerPrecheck.url;

      await api.post(precheckUrl, { mobile: num });

      const confirmation = await signInWithPhoneNumber(
        auth,
        `+91${num}`,
        verifier
      );

      setConfirmRes(confirmation);
      setPhase("verify");
      setCanResend(false);
      setTimer(90);

      toast.success("OTP sent successfully");
    } catch (err) {
      console.error("sendOtp error:", err);
      resetRecaptcha();
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const verifyOtp = async (value = otp) => {
    if (!confirmRes) return toast.error("Please resend OTP");
    if (value.length !== 6) return;
    if (verifyingRef.current) return;

    verifyingRef.current = true;
    setLoading(true);

    try {
      const cred = await confirmRes.confirm(value);
      const idToken = await cred.user.getIdToken();

      const loginUrl =
        userType === "manager"
          ? SummaryApi.managerLogin.url
          : SummaryApi.ownerLogin.url;

      const res = await api.post(loginUrl, null, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      loginWithTokens(res.data);
      toast.success("Login successful");
      navigate(
        userType === "manager" ? "/manager/dashboard" : "/dashboard",
        { replace: true }
      );
    } catch (err) {
      console.error("verifyOtp error:", err);

      if (err.code === "auth/invalid-verification-code") {
        toast.error("Invalid OTP");
      } else if (
        err.code === "auth/code-expired" ||
        err.code === "auth/session-expired"
      ) {
        toast.error("OTP expired. Please resend.");
        setConfirmRes(null);
        setPhase("enter");
      } else {
        toast.error("OTP verification failed");
      }
    } finally {
      verifyingRef.current = false;
      setLoading(false);
    }
  };

  /* ---------------- AUTO VERIFY ---------------- */
  useEffect(() => {
    if (phase !== "verify") return;
    if (!confirmRes) return;
    if (otp.length !== 6) return;
    if (verifyingRef.current) return;
    if (lastAutoOtpRef.current === otp) return;

    lastAutoOtpRef.current = otp;
    verifyOtp(otp);
  }, [otp, phase, confirmRes]);

  /* ---------------- UI (UNCHANGED) ---------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md border border-border shadow-sm">
        <CardHeader className="text-center space-y-2">
          <img src="/owner/KarabookLogo.png" alt="Karabook" className="h-10 mx-auto" />
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
          {phase === "enter" && (
            <div className="space-y-3">
              <Label>Mobile Number</Label>
              <div className="flex gap-2">
                <div className="px-3 py-2 rounded-md border bg-muted text-sm">+91</div>
                <Input
                  value={mobile}
                  maxLength={10}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <Button onClick={sendOtp} disabled={loading || !canResend} className="w-full">
                {loading ? "Sending OTP..." : canResend ? "Send OTP" : `Resend in ${timer}s`}
              </Button>
            </div>
          )}

          {phase === "verify" && (
            <div className="space-y-4">
              <Label>Enter OTP</Label>
              <Input
                value={otp}
                maxLength={6}
                autoFocus
                onChange={(e) => {
                  lastAutoOtpRef.current = "";
                  setOtp(e.target.value.replace(/\D/g, ""));
                }}
                className="text-center tracking-widest text-lg"
              />
              <Button onClick={() => verifyOtp()} disabled={loading || otp.length !== 6} className="w-full">
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-1">
          <p className="text-xs text-muted-foreground">Protected by Google reCAPTCHA</p>
          <div id="recaptcha-container" />
        </CardFooter>
      </Card>
    </div>
  );
}
