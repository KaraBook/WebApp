import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthContext";
import api from "@/api/axios";
import SummaryApi from "@/common/SummaryApi";
import { auth, sendOtp } from "@/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const OTP_LEN = 6;

const onlyDigits = (v) => (v || "").replace(/\D/g, "");
const normalize10 = (v) => onlyDigits(v).slice(-10);

function formatTimer(sec) {
  const s = Math.max(0, sec);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function OwnerLogin() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState("mobile"); // mobile | otp
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmRes, setConfirmRes] = useState(null);
  const { loginWithTokens } = useAuth();

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(60);

  const otpInputRef = useRef(null);
  const autoVerifyLock = useRef(false);

  const mobile10 = useMemo(() => normalize10(mobile), [mobile]);
  const fullPhone = useMemo(() => (mobile10.length === 10 ? `+91${mobile10}` : ""), [mobile10]);

  // timer for resend
  useEffect(() => {
    if (phase !== "otp") return;
    if (secondsLeft <= 0) return;

    const t = setInterval(() => setSecondsLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [phase, secondsLeft]);


  const backendOwnerPrecheck = async () => {
    // your SummaryApi uses BASE_URL + /api/auth/resort-owner/precheck
    const { url, method } = SummaryApi.ownerPrecheck;
    const res = await api.request({
      url,
      method,
      data: { mobile: mobile10 },
    });
    return res.data;
  };

  const backendOwnerLogin = async (firebaseIdToken) => {
    const { url, method } = SummaryApi.ownerLogin;
    const res = await api.request({
      url,
      method,
      headers: {
        Authorization: `Bearer ${firebaseIdToken}`,
      },
    });
    return res.data;
  };

  const startOtpFlow = async () => {
    if (mobile10.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      await backendOwnerPrecheck();

      const confirmation = await sendOtp(fullPhone);

      setConfirmRes(confirmation);
      setPhase("otp");
      setSecondsLeft(60);
      setOtp("");
      autoVerifyLock.current = false;

      toast.success("OTP sent successfully");
      setTimeout(() => otpInputRef.current?.focus(), 50);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };


  const verifyOtp = async (code) => {
    if (!confirmRes) return toast.error("Please request OTP again.");
    if (code.length !== OTP_LEN) return;

    if (verifying) return;
    setVerifying(true);

    try {
      const cred = await confirmRes.confirm(code);
      const idToken = await cred.user.getIdToken(true);

      const data = await backendOwnerLogin(idToken);

      loginWithTokens(data);

      navigate("/dashboard", { replace: true });

    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid OTP. Please try again.";
      toast.error(msg);

      autoVerifyLock.current = false;
    } finally {
      setVerifying(false);
    }
  };

  const onOtpChange = (val) => {
    const clean = onlyDigits(val).slice(0, OTP_LEN);
    setOtp(clean);

    // auto-verify when complete (professional UX)
    if (clean.length === OTP_LEN && !autoVerifyLock.current) {
      autoVerifyLock.current = true;
      verifyOtp(clean);
    } else if (clean.length < OTP_LEN) {
      autoVerifyLock.current = false;
    }
  };

  const resendOtp = async () => {
    if (secondsLeft > 0 || loading) return;

    setLoading(true);
    try {
      await backendOwnerPrecheck();

      const confirmation = await sendOtp(fullPhone);

      setConfirmRes(confirmation);
      setSecondsLeft(60);
      setOtp("");
      autoVerifyLock.current = false;

      toast.success("OTP resent");
      setTimeout(() => otpInputRef.current?.focus(), 50);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to resend OTP"
      );
    } finally {
      setLoading(false);
    }
  };


  const changeNumber = () => {
    setPhase("mobile");
    setOtp("");
    setConfirmRes(null);
    setSecondsLeft(60);
    autoVerifyLock.current = false;
  };


  return (
    <div className="min-h-screen w-full bg-[#f6f7fb] flex items-center justify-center px-4">
      {/* required for Firebase reCAPTCHA */}
      <div id="recaptcha-container" />

      <Card className="w-full max-w-xl rounded-2xl shadow-sm border bg-white">
        <CardHeader className="pt-8 pb-4 flex flex-col items-center text-center">
          {/* Replace with your logo */}
          <img
            src="/logo.png"
            alt="KaraBook"
            className="h-10 w-auto mb-3"
          />
          <CardTitle className="text-2xl font-semibold">
            Resort Owner Login
          </CardTitle>
          <CardDescription className="mt-1">
            Sign in securely using your registered mobile number
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {phase === "mobile" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Mobile Number</Label>

                <div className="flex gap-2">
                  <div className="w-[70px] flex items-center justify-center rounded-md border bg-muted/40 text-sm">
                    +91
                  </div>

                  <Input
                    value={mobile10}
                    onChange={(e) => setMobile(e.target.value)}
                    inputMode="numeric"
                    placeholder="Enter mobile number"
                    className="h-11"
                    maxLength={10}
                  />
                </div>
              </div>

              <Button
                onClick={startOtpFlow}
                disabled={loading || mobile10.length !== 10}
                className="w-full h-11 rounded-md"
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-2">
                Protected by Google reCAPTCHA
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground text-center">
                OTP sent to <span className="font-medium text-foreground">{fullPhone}</span>
              </div>

              <div className="space-y-2">
                <Label>Enter OTP</Label>
                <Input
                  ref={otpInputRef}
                  value={otp}
                  onChange={(e) => onOtpChange(e.target.value)}
                  inputMode="numeric"
                  placeholder="••••••"
                  className="h-11 text-center tracking-[0.35em] font-semibold"
                  maxLength={OTP_LEN}
                  disabled={verifying}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={changeNumber}
                    className="underline underline-offset-4 hover:text-foreground"
                    disabled={loading || verifying}
                  >
                    Change number
                  </button>

                  <span>
                    {secondsLeft > 0 ? (
                      <>Resend in <span className="font-medium">{formatTimer(secondsLeft)}</span></>
                    ) : (
                      <button
                        type="button"
                        onClick={resendOtp}
                        className="underline underline-offset-4 hover:text-foreground"
                        disabled={loading}
                      >
                        Resend OTP
                      </button>
                    )}
                  </span>
                </div>
              </div>

              {/* This button exists (like many pro websites) but OTP also auto-verifies */}
              <Button
                onClick={() => verifyOtp(otp)}
                disabled={otp.length !== OTP_LEN || verifying}
                className="w-full h-11 rounded-md"
              >
                {verifying ? "Verifying..." : "Verify and continue"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                OTP will verify automatically once completed
              </p>
            </div>
          )}
        </CardContent>

      </Card>
    </div>
  );
}
