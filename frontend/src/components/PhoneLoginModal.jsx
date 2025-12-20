import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { auth, buildRecaptcha, signInWithPhoneNumber } from "/firebase";
import SummaryApi, { baseURL } from "@/common/SummaryApi";
import { useAuthStore } from "../store/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

  /* ================= RESET ON CLOSE ================= */
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
    } catch {}
  }, [open]);

  /* ================= TIMER ================= */
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

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    if (phone.length !== 10) return;

    setSending(true);
    try {
      try {
        await auth.signOut();
      } catch {}

      let verifier = window.recaptchaVerifier || buildRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        auth,
        `+91${phone}`,
        verifier
      );

      setConfirmResult(confirmation);
      setStep("otp");
      setTimer(60);

      toast.success("OTP sent successfully");
    } catch (err) {
      toast.error(err?.message || "Failed to send OTP");
    } finally {
      setSending(false);
    }
  };

  /* ================= VERIFY OTP ================= */
  const verifyOtp = async (code = otp) => {
    if (!confirmResult || code.length !== 6) return;

    setVerifying(true);
    try {
      const credential = await confirmResult.confirm(code);
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

        toast.success("Welcome back!");
        onOpenChange(false);
      } else {
        onOpenChange(false);
        navigate("/signup", { state: { idToken } });
      }
    } catch {
      toast.error("Invalid OTP. Please try again.");
      setOtp("");
    } finally {
      setVerifying(false);
    }
  };

  /* ================= AUTO VERIFY WHEN 6 DIGITS ================= */
  useEffect(() => {
    if (otp.length === 6 && !verifying) {
      verifyOtp(otp);
    }
  }, [otp]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[12px] p-6">
        <DialogHeader>
          <DialogTitle className="text-[22px] font-semibold tracking-tight">
            Continue with mobile number
          </DialogTitle>

          <DialogDescription className="text-[14px] text-gray-600 mt-1">
            {step === "phone"
              ? "We’ll send a one-time password (OTP) to verify your number."
              : `Enter the 6-digit OTP sent to +91 ${phone}`}
          </DialogDescription>
        </DialogHeader>

        {/* PHONE STEP */}
        {step === "phone" && (
          <div className="flex flex-col gap-4 mt-4">
            <Label className="text-[13px] font-medium">Mobile Number</Label>

            <div className="flex gap-2">
              <div className="px-4 py-2 border bg-gray-100 text-sm rounded-[8px]">
                +91
              </div>

              <Input
                maxLength={10}
                inputMode="numeric"
                placeholder="Enter mobile number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, ""))
                }
              />
            </div>

            <Button
              className="w-full py-3"
              disabled={phone.length !== 10 || sending}
              onClick={sendOtp}
            >
              {sending ? "Sending OTP..." : "Continue"}
            </Button>
          </div>
        )}

        {/* OTP STEP */}
        {step === "otp" && (
          <div className="flex flex-col gap-4 mt-4">
            <Label className="text-[13px] font-medium">One-Time Password</Label>

            <Input
              maxLength={6}
              inputMode="numeric"
              placeholder="Enter 6-digit OTP"
              value={otp}
              disabled={verifying}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
            />

            <div className="flex justify-between text-sm text-gray-600">
              {timer > 0 ? (
                <span>Resend OTP in {timer}s</span>
              ) : (
                <button
                  className="underline text-black"
                  onClick={sendOtp}
                >
                  Resend OTP
                </button>
              )}

              <button
                className="underline"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setConfirmResult(null);
                }}
              >
                Edit mobile number
              </button>
            </div>

            {verifying && (
              <p className="text-center text-sm text-gray-500">
                Verifying OTP…
              </p>
            )}
          </div>
        )}

        <div id="recaptcha-container" className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
