import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { sendOtp as firebaseSendOtp } from "/firebase";
import SummaryApi, { baseURL } from "@/common/SummaryApi";
import { useAuthStore } from "../store/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Shield } from "lucide-react";

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
    if (timer <= 0) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timer]);


 const handleSendOtp = async () => {
    if (phone.length !== 10) return;

    setSending(true);
    try {
      await axios({
        method: SummaryApi.travellerPrecheck.method,
        url: baseURL + SummaryApi.travellerPrecheck.url,
        data: { mobile: phone },
      });

      const confirmation = await firebaseSendOtp(`+91${phone}`);

      setConfirmResult(confirmation);
      setStep("otp");
      setTimer(60);

      toast.success("OTP sent successfully");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Cannot send OTP"
      );
    } finally {
      setSending(false);
    }
  };


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

  useEffect(() => {
    if (otp.length === 6 && !verifying) {
      verifyOtp(otp);
    }
  }, [otp]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95%] z-[9999999] p-0 rounded-[12px] border-none overflow-hidden">
        {/* CLOSE */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-20 text-white/80 hover:text-white"
        >
          ✕
        </button>

        {/* HEADER */}
        <div className="bg-primary-gradient text-white px-6 pt-10 pb-8 text-center">

          <div className="w-14 h-14 mx-auto rounded-[14px] bg-white/20 flex items-center justify-center mb-4">
            <Phone className="w-7 h-7 text-white/70" />
          </div>

          <h2 className="text-xl font-semibold">Welcome Back</h2>
          <p className="text-sm text-white/90 mt-1">
            Sign in to access your bookings and saved places
          </p>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 space-y-4">
          {step === "phone" && (
            <>
              <div>
                <Label className="text-sm font-medium mb-1 -mt-4 block">
                  Mobile Number
                </Label>

                <div className="flex gap-2">
                  <div className="px-2 w-20 py-2 flex items-center bg-gray-100 border rounded-[14px] text-sm font-medium">
                    IN +91
                  </div>

                  <Input
                    maxLength={10}
                    inputMode="numeric"
                    placeholder="Enter mobile number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    className="rounded-[14px] p-6"
                  />
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  <Shield className="inline mr-1 w-3 h-3" />We’ll send a one-time password (OTP) to verify your number
                </p>
              </div>

              <Button
                className="w-full py-5 rounded-[14px] bg-primary text-white"
                disabled={phone.length !== 10 || sending}
                onClick={handleSendOtp}
              >
                {sending ? "Sending OTP..." : "Continue →"}
              </Button>
            </>
          )}

          {step === "otp" && (
            <>
              <div>
                <Label className="text-sm font-medium mb-1 block">
                  Enter OTP
                </Label>

                <Input
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="6-digit OTP"
                  value={otp}
                  disabled={verifying}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, ""))
                  }
                  className="rounded-[14px] p-6 text-center tracking-[6px]"
                />
              </div>

              <div className="text-sm text-gray-600 text-center">
                {timer > 0 ? (
                  <span>Resend OTP in {timer}s</span>
                ) : (
                  <button
                    onClick={handleSendOtp}
                    className="text-primary font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <Button
                className="w-full py-5 rounded-[14px] bg-primary text-white"
                disabled={otp.length !== 6 || verifying}
                onClick={() => verifyOtp(otp)}
              >
                {verifying ? "Verifying..." : "Verify & Continue →"}
              </Button>
            </>
          )}

          {/* SIGN UP LINK */}
          <p className="text-xs text-center text-gray-500 leading-relaxed px-4">
            If you are new to KaraBook, you’ll be redirected to the sign-up page after mobile verification.
          </p>

          <p className=" border-t text-[12px] text-center text-gray-500 pt-2">
            By continuing, you agree to our <a href="/terms-and-conditions" className="text-primary">Terms & Conditions</a> and <a href="/privacy-policy" className="text-primary">Privacy Policy</a>.
          </p>
        </div>

        <div id="recaptcha-container" className="hidden" />
      </DialogContent>

    </Dialog>
  );
}
