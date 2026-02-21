import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { sendOtp as firebaseSendOtp, clearRecaptcha } from "/firebase";
import SummaryApi, { baseURL } from "@/common/SummaryApi";
import { useAuthStore } from "../store/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Shield } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "/firebase";

export default function PhoneLoginModal({ open, onOpenChange }) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const otpRefs = useRef([]);

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [confirmResult, setConfirmResult] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);


  useEffect(() => {
    if (!open) {
      try {
        clearRecaptcha();
        setStep("phone");
        setPhone("");
        setOtp(Array(6).fill(""));
        setConfirmResult(null);
        setTimer(0);
      } catch (e) {
        console.log("recaptcha cleanup skipped");
      }
    }
  }, [open]);


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
      setAttempts(0);

      toast.success("OTP sent successfully");
    } catch (err) {
      const errorCode = err?.code || err?.response?.data?.error?.message;

      if (
        errorCode?.includes("TOO_MANY_ATTEMPTS_TRY_LATER") ||
        errorCode?.includes("auth/too-many-requests")
      ) {
        toast.error(
          "Too many OTP requests. Please try again after a few minutes."
        );
      } else if (
        errorCode?.includes("captcha-check-failed")
      ) {
        toast.error(
          "Verification failed. Please refresh and try again."
        );
      } else if (
        errorCode?.includes("quota-exceeded")
      ) {
        toast.error(
          "OTP service temporarily unavailable. Please try again later."
        );
      } else {
        toast.error("Unable to send OTP. Please try again.");
      }
      console.error("OTP Error:", err);
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
        setTimeout(() => {
          navigate("/signup", { state: { idToken } });
        }, 0);
      }
    } catch (err) {
      const errorCode = err?.code;

      if (errorCode === "auth/too-many-requests") {
        toast.error("Too many incorrect attempts. Please wait before trying again.");
        setTimer(0);
        setOtp(Array(6).fill(""));
        return;
      }

      setAttempts((prev) => {
        const newAttempts = prev + 1;

        if (newAttempts >= 3) {
          setTimer(0);
          setOtp(Array(6).fill(""));
          toast.error("Too many incorrect attempts. Please resend OTP.");
        } else {
          toast.error("Incorrect OTP. Please check the 6-digit code.");
        }

        return newAttempts;
      });
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    const joinedOtp = Array.isArray(otp) ? otp.join("") : "";
    if (joinedOtp.length === 6 && !verifying) {
      verifyOtp(joinedOtp);
    }
  }, [otp]);



  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken(true);

      const check = await axios.post(
        baseURL + SummaryApi.travellerCheckGoogle.url,
        {},
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      if (check.data.exists) {
        const resp = await axios.post(
          baseURL + SummaryApi.travellerLoginGoogle.url,
          {},
          { headers: { Authorization: `Bearer ${idToken}` } }
        );

        setAuth(resp.data);
        toast.success("Welcome back!");
        onOpenChange(false);
      } else {
        onOpenChange(false);
        navigate("/signup", {
          state: {
            idToken,
            method: "google",
            email: result.user.email
          }
        });
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Google login failed"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95%] z-[9999999] p-0 rounded-[12px] border-none overflow-hidden">
        {/* CLOSE */}
        <button
          onClick={() => {
            clearRecaptcha();
            onOpenChange(false);
          }}
          className="absolute top-3 right-3 z-20 text-white/80 hover:text-white"
        >
          ✕
        </button>

        {/* HEADER */}
        <div className="bg-primary-gradient text-white px-6 pt-5 pb-5 text-center">

          <div className="w-12 h-12 md:w-14 md:h-14 mx-auto rounded-[14px] bg-white/20 flex items-center justify-center mb-2">
            <Phone className="w-5 h-5 md:w-7 md:h-7 text-white/70" />
          </div>

          <h2 className="text-xl font-semibold">Welcome Back</h2>
          <p className="text-sm text-white/90 mt-1">
            Sign in to access your bookings and saved places
          </p>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 space-y-2">
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
                disabled={phone.length !== 10 || sending || timer > 0}
                onClick={handleSendOtp}
              >
                {sending ? "Sending OTP..." : "Continue →"}
              </Button>
            </>
          )}

          {step === "otp" && (
            <>
              {/* MOBILE DISPLAY WITH CHANGE OPTION */}
              <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-[14px] border">
                <div>
                  <p className="text-xs text-gray-500">OTP sent to</p>
                  <p className="font-medium text-sm">+91 {phone}</p>
                </div>

                <button
                  onClick={() => {
                    clearRecaptcha();
                    setStep("phone");
                    setOtp(Array(6).fill("")); 
                    setConfirmResult(null);
                    setTimer(0);
                  }}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Change
                </button>
              </div>

              {/* OTP INPUT */}
              <div>
                <Label className="text-sm font-medium mb-3 block text-center">
                  Enter OTP
                </Label>

                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      disabled={verifying}
                      className="w-12 h-12 text-center text-lg font-semibold rounded-xl"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (!value) return;

                        const newOtp = [...otp];
                        newOtp[index] = value;
                        setOtp(newOtp);

                        if (index < 5) {
                          otpRefs.current[index + 1]?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace") {
                          if (otp[index]) {
                            const newOtp = [...otp];
                            newOtp[index] = "";
                            setOtp(newOtp);
                          } else if (index > 0) {
                            otpRefs.current[index - 1]?.focus();
                          }
                        }
                      }}
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
                        if (pasted.length === 6) {
                          const newOtp = pasted.split("").slice(0, 6);
                          setOtp(newOtp);
                          otpRefs.current[5]?.focus();
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* TIMER / RESEND */}
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

              {/* VERIFY BUTTON */}
              <Button
                className="w-full py-5 rounded-[14px] bg-primary text-white"
                disabled={otp.join("").length !== 6 || verifying}
                onClick={() => verifyOtp(otp.join(""))}
              >
                {verifying ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" />
                    Verifying...
                  </div>
                ) : (
                  "Verify & Continue →"
                )}
              </Button>
            </>
          )}

          <div className="text-center text-xs text-gray-400">or</div>

          <Button
            onClick={handleGoogleLogin}
            className="w-full py-5 rounded-[14px] hover:bg-white bg-white text-black border flex items-center justify-center gap-3"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </Button>

          {/* SIGN UP LINK */}
          <p className="text-xs text-center text-gray-500 leading-relaxed px-4">
            If you are new to KaraBook, you’ll be redirected to the sign-up page after mobile verification.
          </p>

          <p className=" border-t text-[12px] text-center text-gray-500 pt-2">
            By continuing, you agree to our <a href="/terms-and-conditions" className="text-primary">Terms & Conditions</a> and <a href="/privacy-policy" className="text-primary">Privacy Policy</a>.
          </p>
        </div>

      </DialogContent>
    </Dialog>
  );
}
