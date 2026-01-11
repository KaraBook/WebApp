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
      "x-firebase-auth": "true", 
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
    <div id="recaptcha-container" />

    <div className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden">

      {/* HEADER */}
      <div className="bg-gradient-to-b from-[#18b6c8] to-[#0f8ea8] px-6 py-10 text-center">
        <img
          src="/KarabookLogo.png"
          alt="KaraBook"
          className="h-10 mx-auto mb-4"
        />

        <h2 className="text-xl font-semibold text-white">
          Welcome Back
        </h2>
        <p className="text-sm text-white/90 mt-1">
          Sign in to manage your property, bookings & availability
        </p>
      </div>

      {/* CONTENT */}
      <div className="px-6 py-6">
        {phase === "mobile" ? (
          <div className="space-y-5">
            <div>
              <Label className="text-sm">Registered Mobile Number</Label>

              <div className="flex gap-2 mt-2">
                <div className="w-[70px] flex items-center justify-center rounded-lg border bg-gray-50 text-sm">
                  IN +91
                </div>

                <Input
                  value={mobile10}
                  onChange={(e) => setMobile(e.target.value)}
                  inputMode="numeric"
                  placeholder="Enter registered number"
                  maxLength={10}
                  className="h-11 rounded-lg"
                />
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Secure login using OTP to access your owner dashboard
              </p>
            </div>

            <Button
              onClick={startOtpFlow}
              disabled={loading || mobile10.length !== 10}
              className="w-full h-11 rounded-lg bg-[#7ec9d3] hover:bg-[#6abdc7] text-white"
            >
              {loading ? "Sending OTP..." : "Continue →"}
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm text-center text-gray-600">
              Enter the OTP sent to your registered mobile number
            </p>

            <div>
              <Label>One-Time Password (OTP)</Label>
              <Input
                ref={otpInputRef}
                value={otp}
                onChange={(e) => onOtpChange(e.target.value)}
                inputMode="numeric"
                maxLength={OTP_LEN}
                placeholder="••••••"
                className="h-11 text-center tracking-[0.4em] font-semibold rounded-lg"
                disabled={verifying}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500">

              {secondsLeft > 0 ? (
                <span>Resend in {formatTimer(secondsLeft)}</span>
              ) : (
                <button
                  onClick={resendOtp}
                  className="underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <Button
              onClick={() => verifyOtp(otp)}
              disabled={otp.length !== OTP_LEN || verifying}
              className="w-full h-11 rounded-lg bg-[#7ec9d3] hover:bg-[#6abdc7]"
            >
              {verifying ? "Verifying..." : "Verify & Enter Dashboard"}
            </Button>
          </div>
        )}

        {/* OWNER CONTEXT FOOTER */}
        <p className="text-[11px] text-center text-gray-500 mt-6">
          Manage your property calendar, bookings, guests and earnings securely
        </p>
      </div>
    </div>
  </div>
);
}