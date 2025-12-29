import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, getRecaptcha, resetRecaptcha, signInWithPhoneNumber } from "../firebase";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { useAuth } from "../auth/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Login({ userType = "owner" }) {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [phase, setPhase] = useState("enter"); // enter | verify
  const [confirmRes, setConfirmRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const { loginWithTokens } = useAuth();
  const navigate = useNavigate();

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  /* ---------------- SEND OTP ---------------- */
  const sendOtp = async () => {
    const num = mobile.replace(/\D/g, "");
    if (num.length !== 10) return toast.error("Enter valid 10-digit number");

    setLoading(true);
    setOtp("");
    resetRecaptcha();

    try {
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
      setTimer(60);

      toast.success("OTP sent successfully");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const verifyOtp = async () => {
    if (!confirmRes) return toast.error("Please resend OTP");
    if (otp.length !== 6) return;

    setLoading(true);
    try {
      const cred = await confirmRes.confirm(otp);
      const idToken = await cred.user.getIdToken(true);

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
      console.error(err);
      toast.error("Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle>{userType === "manager" ? "Manager Login" : "Resort Owner Login"}</CardTitle>
          <CardDescription>Login securely using your registered mobile number</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {phase === "enter" && (
            <>
              <Label>Mobile Number</Label>
              <div className="flex gap-2">
                <div className="px-3 py-2 border rounded">+91</div>
                <Input value={mobile} maxLength={10} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} />
              </div>
              <Button onClick={sendOtp} disabled={loading} className="w-full">
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </>
          )}

          {phase === "verify" && (
            <>
              <Label>Enter OTP</Label>
              <Input
                value={otp}
                maxLength={6}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="text-center tracking-widest text-lg"
              />

              <Button onClick={verifyOtp} disabled={loading || otp.length !== 6} className="w-full">
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {timer > 0 ? (
                  <>Resend OTP in {timer}s</>
                ) : (
                  <button onClick={sendOtp} className="underline text-primary">
                    Resend OTP
                  </button>
                )}
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="justify-center">
          <div id="recaptcha-container" />
        </CardFooter>
      </Card>
    </div>
  );
}
