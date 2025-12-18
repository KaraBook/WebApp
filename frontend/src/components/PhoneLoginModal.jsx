import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { auth, buildRecaptcha, signInWithPhoneNumber } from "/firebase";
import SummaryApi, { baseURL } from "@/common/SummaryApi";
import { useAuthStore } from "../store/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PhoneLoginModal({ open, onOpenChange }) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [confirmResult, setConfirmResult] = useState(null);

  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setStep("phone");
      setPhone("");
      setOtp("");
      setTimer(0);
      setConfirmResult(null);
      clearInterval(timerRef.current);
      return;
    }

    try {
      buildRecaptcha();
    } catch { }
  }, [open]);

  useEffect(() => {
    if (timer <= 0) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timer]);

  const sendOtp = async () => {
    if (phone.length !== 10) return;

    setSending(true);
    try {
      try { await auth.signOut(); } catch { }

      let verifier = window.recaptchaVerifier;
      if (!verifier) {
        verifier = buildRecaptcha();
      }

      const num = `+91${phone}`;
      const confirmation = await signInWithPhoneNumber(auth, num, verifier);

      setConfirmResult(confirmation);
      setStep("otp");
      setTimer(60);

      toast.success("OTP sent");

    } catch (err) {
      console.error("OTP error:", err);
      toast.error(err?.message || "Failed to send OTP");
    } finally {
      setSending(false);
    }
  };


  const verifyOtp = async () => {
    if (!confirmResult || !otp) return;

    setVerifying(true);
    try {
      const credential = await confirmResult.confirm(otp);
      const idToken = await credential.user.getIdToken(true);

      const check = await axios.post(
        baseURL + SummaryApi.travellerCheck.url,
        {},
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      if (check?.data?.exists) {
        const resp = await axios.post(
          baseURL + SummaryApi.travellerLogin.url,
          {},
          { headers: { Authorization: `Bearer ${idToken}` } }
        );

        setAuth({
          user: resp.data.user,
          accessToken: resp.data.accessToken,
          refreshToken: resp.data.refreshToken,
        });

        toast.success("Login successful!");
        onOpenChange(false);
      } else {
        onOpenChange(false);
        navigate("/signup", { state: { idToken } });
      }

    } catch (err) {
      alert(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[12px] p-6">

        <DialogHeader>
          <DialogTitle className="text-[22px] font-semibold tracking-tight">
            Login or Sign Up
          </DialogTitle>

          <DialogDescription className="text-[14px] text-gray-600 mt-1">
            {step === "phone"
              ? "Enter your mobile number to continue."
              : `OTP sent to +91 ${phone}. Enter the OTP to continue.`}
          </DialogDescription>
        </DialogHeader>

        {/* Phone Step */}
        {step === "phone" && (
          <div className="flex flex-col gap-4 mt-4">

            <Label className="text-[13px] font-medium">Mobile Number</Label>

            <div className="flex gap-2">
              <div className="px-4 py-2 border bg-gray-100 text-sm text-gray-700 rounded-[8px]">
                +91
              </div>

              <Input
                className="rounded-[8px] border px-3 py-2 text-[15px]"
                maxLength={10}
                inputMode="numeric"
                placeholder="Enter number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, ""))
                }
              />
            </div>

            <Button
              className="w-full bg-primary text-white py-3 rounded-[8px]"
              disabled={phone.length !== 10 || sending}
              onClick={sendOtp}
            >
              {sending ? "Sending..." : "Continue"}
            </Button>
          </div>
        )}

        {/* OTP Step */}
        {step === "otp" && (
          <div className="flex flex-col gap-4 mt-4">

            <Label className="text-[13px] font-medium">Enter OTP</Label>

            <Input
              className="!rounded-none border px-3 py-2 text-[15px]"
              maxLength={6}
              inputMode="numeric"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
            />

            {/* Timer & Resend */}
            <div className="flex justify-between text-sm text-gray-600">
              {timer > 0 ? (
                <span>Resend in {timer}s</span>
              ) : (
                <button
                  className="underline text-black"
                  onClick={sendOtp}
                >
                  Resend OTP
                </button>
              )}

              <button
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setConfirmResult(null);
                }}
                className="underline"
              >
                Change Number
              </button>
            </div>

            <Button
              className="w-full bg-primary text-white py-3 !rounded-none"
              disabled={otp.length < 4 || verifying}
              onClick={verifyOtp}
            >
              {verifying ? "Verifying..." : "Verify & Continue"}
            </Button>
          </div>
        )}

        <div id="recaptcha-container" className="hidden" />

      </DialogContent>
    </Dialog>
  );
}
