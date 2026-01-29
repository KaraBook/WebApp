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

  const [phase, setPhase] = useState("mobile"); 
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

  useEffect(() => {
    if (phase !== "otp") return;
    if (secondsLeft <= 0) return;

    const t = setInterval(() => setSecondsLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [phase, secondsLeft]);


  const backendOwnerPrecheck = async () => {
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
  <div className="min-h-screen w-full bg-[#f6f7fb] flex md:flex-row flex-col">
    <div id="recaptcha-container" />

    {/* ================= LEFT: HERO IMAGE ================= */}
    <div
      className="
        flex lg:w-1/2
        relative overflow-hidden
        h-[45vh] md:h-auto
      "
    >
      <img
        src="/owner/loginhero.jpg"   
        alt="Karabook Property"
        className="absolute inset-0 md:h-full w-full object-cover"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Text Overlay */}
      <div className="relative z-10 p-4 md:p-10 flex flex-col justify-end text-white">
        <p className="text-xs tracking-widest uppercase opacity-80">
          Welcome Back
        </p>

        <h1 className="text-[34px] md:text-[48px] font-sans font-[700]">
          KaraBook
        </h1>

        <p className="mt-1 max-w-md text-[15px] md:text-[18px] opacity-90">
          Manage your properties, bookings, guests and earnings with ease.
        </p>
      </div>
    </div>


    <div className="w-full h-[55vh] md:h-auto lg:w-1/2 flex items-center bg-primary justify-center px-4 py-4 sm:px-8">
      <div className="w-full max-w-md bg-white flex flex-col md:items-start items-center h-full md:h-auto rounded-2xl shadow-lg overflow-hidden">

        {/* HEADER */}
        <div className="px-4 w-full md:px-6 pt-4 md:pt-8 pb-2 md:pb-6">
          <div className="flex items-center justify-between gap-3">
            <img
              src="/owner/KarabookLogo.png"
              alt="Karabook"
              className="h-9"
            />
            <span className="text-[16px] font-bold text-primary">
              Owner Portal
            </span>
          </div>

          <h2 className="text-2xl font-bold mt-4 md:mt-6">
            Sign in
          </h2>

          <p className="text-[14px] md:text-[16px] text-gray-700 mt-1">
            Use your registered <span className="text-primary font-[600]">mobile number</span> to continue.
          </p>
        </div>

        {/* FORM CONTENT */}
        <div className="px-4 w-full md:px-6 pb-4 md:pb-8">

          {phase === "mobile" ? (
            <div className="space-y-5 md:mt-0 mt-2">

              <div>
                <Label className="text-sm">Mobile Number</Label>

                <div className="flex gap-2 mt-2">
                  <div className="w-[70px] flex items-center justify-center rounded-lg border bg-gray-50 text-sm">
                    +91
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
              </div>

              <Button
                onClick={startOtpFlow}
                disabled={loading || mobile10.length !== 10}
                className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90"
              >
                {loading ? "Sending OTP..." : "Continue"}
              </Button>
            </div>
          ) : (
            <div className="space-y-5">

              <p className="text-sm text-left text-gray-600">
                Enter the OTP sent to your mobile number
              </p>

              <div>
                <Label>One-Time Password</Label>
                <Input
                  ref={otpInputRef}
                  value={otp}
                  onChange={(e) => onOtpChange(e.target.value)}
                  inputMode="numeric"
                  maxLength={OTP_LEN}
                  placeholder="••••••"
                  className="h-11 text-center tracking-[0.35em] mt-1 font-semibold rounded-lg"
                  disabled={verifying}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                {secondsLeft > 0 ? (
                  <span>Resend in {formatTimer(secondsLeft)}</span>
                ) : (
                  <button onClick={resendOtp} className="underline">
                    Resend OTP
                  </button>
                )}

              </div>

              <Button
                onClick={() => verifyOtp(otp)}
                disabled={otp.length !== OTP_LEN || verifying}
                className="w-full h-11 rounded-lg bg-[#7ec9d3] hover:bg-[#6abdc7]"
              >
                {verifying ? "Verifying..." : "Verify & Continue"}
              </Button>
            </div>
          )}


<hr className="mt-4 md:mt-8"/>
          {/* FOOTER */}
          <p className="text-[11px] text-center text-gray-400 mt-3 md:mt-6">
            © {new Date().getFullYear()} Karabook · Secure Owner Access
          </p>
        </div>
      </div>
    </div>
  </div>
);
}