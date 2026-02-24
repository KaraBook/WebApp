import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthContext";
import api from "@/api/axios";
import SummaryApi from "@/common/SummaryApi";
import { auth, sendOtp, clearRecaptcha } from "@/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import OtpBoxes from "@/components/OtpBoxes";

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
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [mode, setMode] = useState("otp");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [secondsLeft, setSecondsLeft] = useState(60);

  const autoVerifyLock = useRef(false);

  const mobile10 = useMemo(() => normalize10(mobile), [mobile]);
  const fullPhone = useMemo(() => (mobile10.length === 10 ? `+91${mobile10}` : ""), [mobile10]);

  useEffect(() => {
    if (phase !== "otp") return;
    if (secondsLeft <= 0) return;

    const t = setInterval(() => setSecondsLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [phase, secondsLeft]);


  useEffect(() => {
  if (otp.length === 6 && confirmRes && !verifying && !autoVerifyLock.current) {
    autoVerifyLock.current = true;
    verifyOtp(otp);
  }
}, [otp]);


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
    } catch (err) {
      let message = "We couldn't send the verification code. Please try again.";

      if (err.code === "auth/too-many-requests") {
        message = "Too many attempts. Please wait a few minutes before retrying.";
      }
      else if (err.code === "auth/invalid-phone-number") {
        message = "Please enter a valid mobile number.";
      }
      else if (err.code === "auth/network-request-failed") {
        message = "Network error. Please check your internet connection.";
      }
      else if (err.code === "auth/internal-error") {
        message = "Verification service unavailable. Please refresh and try again.";
      }

      toast.error(message);
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

      if (!data.accessToken) {
        toast.error(data.message || "Access denied");
        return;
      }

      loginWithTokens(data);
      navigate("/dashboard");

    } catch (err) {

      let message;

      switch (err.code) {
        case "auth/invalid-verification-code":
          message = "The code you entered is incorrect.";
          break;

        case "auth/code-expired":
          message = "This code has expired. Please request a new one.";
          setSecondsLeft(0);
          break;

        case "auth/session-expired":
          message = "Session expired. Please resend OTP.";
          setConfirmRes(null);
          break;

        case "auth/too-many-requests":
          message = "Too many attempts. Please wait 5 minutes.";
          break;

        default:
          message = "Verification failed. Please try again.";
      }

      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const onOtpChange = (val) => {
    const clean = onlyDigits(val).slice(0, OTP_LEN);
    setOtp(clean);
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
    clearRecaptcha();
    setPhase("mobile");
    setOtp("");
    setConfirmRes(null);
    setSecondsLeft(60);
    autoVerifyLock.current = false;
  };


  const passwordLogin = async () => {
    if (!identifier || !password) {
      toast.error("Enter username/email and password");
      return;
    }
    setLoading(true);
    try {
      const { url, method } = SummaryApi.ownerPasswordLogin;
      const res = await api.request({
        url,
        method,
        data: {
          identifier,
          password,
        },
      });
      loginWithTokens(res.data);
      toast.success("Login successful");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
    <div id="recaptcha-container" style={{ position: "fixed", top: "-10000px" }} />
    <div className="min-h-screen bg-[#f2f4f8] flex items-center justify-center px-0">

      <div className="w-full max-w-full bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col lg:flex-row">

        {/* ================= LEFT IMAGE (DESKTOP) ================= */}
        <div className="hidden lg:flex lg:w-1/2 relative h-screen">

          <img
            src="/loginhero.jpg"
            alt="Karabook"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 p-12 flex flex-col justify-end text-white">
            <span className="text-xs tracking-widest uppercase opacity-80">
              Welcome Back
            </span>
            <h1 className="text-[48px] font-bold mt-2">KaraBook</h1>
            <p className="mt-3 text-[17px] max-w-md opacity-90">
              Manage your properties, bookings, guests and earnings with ease.
            </p>
          </div>

        </div>


        <div className="w-full lg:w-1/2 flex flex-col">

          <div className="lg:hidden relative h-[290px] overflow-hidden">

            {/* Image */}
            <img
              src="/loginhero.jpg"
              alt="Karabook"
              className="absolute inset-0 w-full h-full object-cover z-0"
            />

            {/* Black overlay */}
            <div className="absolute inset-0 bg-black/50 z-10" />

            {/* Content */}
            <div className="relative z-20 h-full flex flex-col justify-end p-5 text-white">
              <h2 className="text-3xl font-bold">KaraBook</h2>
              <p className="text-sm opacity-90">Owner Portal</p>
            </div>

          </div>


          <div className="flex-1 px-6 sm:px-[100px] py-8 flex flex-col justify-center bg-[#f9f9f9]">

            {/* HEADER */}
            <div className="flex items-center gap-3 md:mb-8 mb-6">
              <img src="/KarabookLogo.png" className="h-9" />
              <span className="text-sm font-semibold text-gray-700">
                Owner Portal
              </span>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900">
              Sign in
            </h2>

            <p className="text-sm text-gray-600 mt-1">
              {mode === "otp"
                ? "Use your registered mobile number to continue."
                : "Login using your username & password."}
            </p>

            {mode === "otp" && (
              <div className="mt-6 space-y-5">

                {phase === "mobile" && (
                  <>
                    <div>
                      <label className="text-sm text-gray-700">
                        Mobile Number
                      </label>

                      <div className="mt-2 flex gap-2">
                        <div className="w-[72px] h-11 flex items-center justify-center border rounded-lg bg-gray-50 text-sm">
                          +91
                        </div>

                        <input
                          value={mobile10}
                          onChange={(e) => setMobile(e.target.value)}
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="Enter number"
                          className="flex-1 h-11 rounded-lg border px-3 text-sm focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    </div>

                    <button
                      onClick={startOtpFlow}
                      disabled={loading || mobile10.length !== 10}
                      className="w-full h-11 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
                    >
                      {loading ? "Sending OTP..." : "Continue"}
                    </button>

                    <button
                      onClick={() => setMode("password")}
                      className="w-full text-sm text-gray-600 hover:text-gray-900"
                    >
                      Login with username & password
                    </button>
                  </>
                )}

                {phase === "otp" && (
                  <>
                    <div>
                      <label className="text-sm text-gray-700">
                        One-Time Password
                      </label>
                      <p className="text-sm text-gray-600 mt-2 text-center">
                        Enter the 6-digit code sent to
                        <span className="font-semibold">
                          {" "}+91 {mobile10.slice(0, 3)}****{mobile10.slice(7)}
                        </span>
                      </p>

                      <button
                        onClick={changeNumber}
                        className="text-sm text-primary underline text-center w-full mt-1"
                      >
                        Change number
                      </button>
                      <OtpBoxes value={otp} setValue={setOtp} length={6} />
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

                    <button
                      onClick={() => verifyOtp(otp)}
                      disabled={otp.length !== 6 || verifying}
                      className="w-full h-12 rounded-xl bg-primary text-white font-semibold disabled:opacity-50 mt-4"
                    >
                      {verifying ? "Verifying..." : "Verify & Continue"}
                    </button>

                    <button
                      onClick={() => setMode("password")}
                      className="w-full text-sm text-gray-600"
                    >
                      Login with password instead
                    </button>
                  </>
                )}
              </div>
            )}


            {mode === "password" && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm text-gray-700">
                    Username / Email
                  </label>
                  <input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="mt-2 h-11 w-full rounded-lg border px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700">
                    Password
                  </label>
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 w-full rounded-lg border px-3 pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={passwordLogin}
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-primary text-white font-medium"
                >
                  {loading ? "Signing in..." : "Login"}
                </button>

                <button
                  onClick={() => setMode("otp")}
                  className="w-full text-sm text-gray-600"
                >
                  ← Back to OTP login
                </button>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="border-t py-4 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Karabook · Secure Owner Access
          </div>
        </div>
      </div>
    </div>
    </>
  );
}