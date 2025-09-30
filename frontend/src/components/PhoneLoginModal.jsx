import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { auth, buildRecaptcha, signInWithPhoneNumber, } from "/firebase";
import SummaryApi, { baseURL } from "@/common/SummaryApi";
import { useAuthStore } from "../store/auth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PhoneLoginModal({ open, onOpenChange, onClose  }) {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [confirmResult, setConfirmResult] = useState(null);
  

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

 useEffect(() => {
    if (open) {
      try {
        buildRecaptcha();
      } catch {}
    } else {
      setStep("phone");
      setPhone("");
      setOtp("");
      setConfirmResult(null);
      setSending(false);
      setVerifying(false);
    }
  }, [open]);

  const sendOtp = async () => {
    if (phone.length !== 10) return;
    setSending(true);
    try {
      const appVerifier = buildRecaptcha();
      const e164 = phone.startsWith("+") ? phone : `+91${phone}`;
      const conf = await signInWithPhoneNumber(auth, e164, appVerifier);
      setConfirmResult(conf);
      setStep("otp");
    } catch (err) {
      alert(err?.message || "Failed to send OTP");
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
      onOpenChange(false);
    } else {
      onOpenChange(false);
      navigate("/signup", { state: { idToken } });
    }
  } catch (err) {
    alert(err?.response?.data?.message || err?.message || "Verification failed");
  } finally {
    setVerifying(false);
  }
};



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login or Sign up</DialogTitle>
          <DialogDescription>
            Continue with your mobile number. We’ll send you a one-time password.
          </DialogDescription>
        </DialogHeader>

        {step === "phone" && (
          <div className="grid gap-3">
            <Label htmlFor="mobile">Mobile number</Label>
            <div className="flex gap-2">
              <div className="inline-flex items-center rounded-md border px-3 text-sm text-muted-foreground">
                +91
              </div>
              <Input
                id="mobile"
                inputMode="numeric"
                maxLength={10}
                placeholder="10 digit number"
                value={phone}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  if (v.length <= 10) setPhone(v);
                }}
              />
            </div>

            <Button
              className="w-full"
              disabled={sending || phone.length !== 10}
              onClick={sendOtp}
            >
              {sending ? "Sending..." : "Send OTP"}
            </Button>
          </div>
        )}

        {step === "otp" && (
          <div className="grid gap-3">
            <Label htmlFor="otp">Enter OTP</Label>
            <Input
              id="otp"
              inputMode="numeric"
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />

            <div className="flex items-center gap-2">
              <Button
                className="flex-1"
                disabled={verifying || otp.length < 4}
                onClick={verifyOtp}
              >
                {verifying ? "Verifying..." : "Verify & Continue"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setConfirmResult(null);
                }}
              >
                Change number
              </Button>
            </div>
          </div>
        )}


        <div id="recaptcha-container" className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
