import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, buildRecaptcha, signInWithPhoneNumber } from "../firebase.js";
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
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const verifierRef = useRef(null);
  const confirmRef = useRef(null);
  const verifyingRef = useRef(false);

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

    try {
      const verifier = buildRecaptcha();

      const precheckUrl =
        userType === "manager"
          ? SummaryApi.managerPrecheck.url
          : SummaryApi.ownerPrecheck.url;

      // ⚠️ precheck can use api (NO firebase token here)
      await api.post(precheckUrl, { mobile: num });

      const confirmation = await signInWithPhoneNumber(
        auth,
        `+91${num}`,
        verifier
      );

      confirmRef.current = confirmation;
      setPhase("verify");
      setTimer(90);

      toast.success("OTP sent successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };


  /* ---------------- VERIFY OTP ---------------- */
  const verifyOtp = async () => {
    if (!confirmRef.current) return;
    if (verifyingRef.current) return;

    verifyingRef.current = true;
    setLoading(true);

    try {
      const cred = await confirmRef.current.confirm(otp);
      const idToken = await cred.user.getIdToken(true);

      const loginUrl =
        userType === "manager"
          ? SummaryApi.managerLogin.url
          : SummaryApi.ownerLogin.url;

      const res = await api.post(
        loginUrl,
        null,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      loginWithTokens(res.data);
      toast.success("Login successful");
      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error(err);
      toast.error("Invalid or expired OTP");
      verifyingRef.current = false; // allow retry
    } finally {
      setLoading(false);
    }
  };


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
            Sign in securely using your registered mobile number
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
              <Button onClick={sendOtp} disabled={loading} className="w-full">
                {loading ? "Sending OTP..." : "Send OTP"}
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
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="text-center tracking-widest text-lg"
              />

              <Button
                disabled={loading || otp.length !== 6}
                onClick={verifyOtp}
                className="w-full"
              >
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
