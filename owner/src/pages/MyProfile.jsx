import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import api from "../api/axios";
import { Eye, EyeOff, Lock } from "lucide-react";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import { getIndianStates, getCitiesByState } from "@/utils/locationUtils";
import { sendOtp } from "@/firebase";


const formatIndianMobile = (mobile) => {
  const digits = String(mobile || "").replace(/\D/g, "");
  if (digits.length !== 10) return null;
  return `+91${digits}`;
};



export default function MyProfile() {
  const fileRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [states] = useState(getIndianStates());
  const [cities, setCities] = useState([]);
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [mobileEdit, setMobileEdit] = useState(false);
  const [newMobile, setNewMobile] = useState("");
  const OTP_DURATION = 60;
  const [otpTimer, setOtpTimer] = useState(0);
  const [resending, setResending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmRes, setConfirmRes] = useState(null);
  const [otpCode, setOtpCode] = useState("");

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    dateOfBirth: "",
    address: "",
    pinCode: "",
    state: "",
    city: "",
    avatarUrl: "",
  });

  /* ---------------- LOAD PROFILE ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerProfile.url);
        const u = res.data?.user;

        if (u) {
          setUser({
            ...u,
            dateOfBirth: u.dateOfBirth
              ? u.dateOfBirth.substring(0, 10)
              : "",
          });

          const st = states.find((s) => s.name === u.state);
          if (st) {
            setSelectedStateCode(st.isoCode);
            setCities(getCitiesByState(st.isoCode));
          }
        }
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  useEffect(() => {
    if (otpTimer <= 0) return;

    const interval = setInterval(() => {
      setOtpTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpTimer]);

  /* ---------------- STATE CHANGE ---------------- */
  const handleStateChange = (code) => {
    setSelectedStateCode(code);
    const st = states.find((s) => s.isoCode === code);

    setUser((p) => ({
      ...p,
      state: st?.name || "",
      city: "",
    }));

    setCities(getCitiesByState(code));
  };

  /* ---------------- SAVE PROFILE ---------------- */
  const handleSave = async () => {
    setSaving(true);
    setErrors({});

    try {
      const payload = {
        ...user,
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : null,
        pinCode: user.pinCode || null,
      };

      const res = await api.put(
        SummaryApi.updateOwnerProfile.url,
        payload
      );

      toast.success("Profile updated successfully");

      setUser({
        ...res.data.user,
        dateOfBirth: res.data.user.dateOfBirth
          ? res.data.user.dateOfBirth.substring(0, 10)
          : "",
      });
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        toast.error("Please fix highlighted fields");
      } else {
        toast.error(err.response?.data?.message || "Update failed");
      }
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- AVATAR UPLOAD ---------------- */
  const handleAvatarUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post(
        SummaryApi.uploadOwnerAvatar.url,
        formData
      );
      setUser((p) => ({ ...p, avatarUrl: res.data.avatarUrl }));
      toast.success("Avatar updated");
    } catch {
      toast.error("Failed to upload avatar");
    }
  };

  /* ---------------- AVATAR REMOVE ---------------- */
  const handleAvatarRemove = async () => {
    try {
      await api.delete(SummaryApi.removeOwnerAvatar.url);
      setUser((p) => ({ ...p, avatarUrl: "" }));
      toast.success("Avatar removed");
    } catch {
      toast.error("Failed to remove avatar");
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error("All password fields are required");
      return;
    }
    if (passwordData.new.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await api.put(SummaryApi.updateOwnerPassword.url, {
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
      });
      toast.success("Password updated successfully");
      setPasswordData({
        current: "",
        new: "",
        confirm: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password update failed");
    }
  };


  const sendOtpForOwner = async () => {
    try {
      if (newMobile.length !== 10) {
        toast.error("Enter valid 10-digit mobile number");
        return;
      }

      setLoading(true);

      const { url, method } = SummaryApi.checkMobileAvailability;

      await api.request({
        url,
        method,
        data: { mobile: newMobile },
      });

      const formatted = formatIndianMobile(newMobile);
      if (!formatted) {
        toast.error("Invalid mobile number");
        return;
      }
      console.log("Sending OTP to:", formatted);
      const confirmation = await sendOtp(formatted);

      setOtpSent(true);
      setConfirmRes(confirmation);
      setOtpTimer(OTP_DURATION);

      toast.success("OTP sent");

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


  const verifyOwnerOtp = async (code) => {
    if (!confirmRes) {
      return toast.error("Request OTP first");
    }

    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      return toast.error("Enter valid 6-digit OTP");
    }

    try {
      const cred = await confirmRes.confirm(code);
      const idToken = await cred.user.getIdToken(true);

      await api.put(SummaryApi.updateOwnerMobile.url, {}, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "x-firebase-auth": "true",
        },
      });

      setUser(p => ({ ...p, mobile: newMobile }));

      setMobileEdit(false);
      setOtpSent(false);
      setNewMobile("");
      setOtpCode("");
      setConfirmRes(null);

      toast.success("Mobile updated");

    } catch (err) {
      toast.error(err?.message || "Verification failed");
    }
  };


  const resendOtp = async () => {
    if (otpTimer > 0) return;

    try {
      setResending(true);

      const formatted = formatIndianMobile(newMobile);
      const confirmation = await sendOtp(formatted);

      setConfirmRes(confirmation);
      setOtpTimer(OTP_DURATION);

      toast.success("OTP resent");
    } catch (err) {
      toast.error("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };


  /* ---------------- INITIALS ---------------- */
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""
    }`.toUpperCase();

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <>
    <div id="recaptcha-container"></div>
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-[26px] font-bold mb-4">My Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                className="w-20 h-20 rounded-full object-cover border"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold">
                {initials || "U"}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => fileRef.current.click()}
              >
                Change Avatar
              </Button>

              {user.avatarUrl && (
                <Button
                  variant="destructive"
                  onClick={handleAvatarRemove}
                >
                  Remove
                </Button>
              )}

              <input
                ref={fileRef}
                type="file"
                hidden
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] &&
                  handleAvatarUpload(e.target.files[0])
                }
              />
            </div>
          </div>

          {/* Names */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="First Name"
              value={user.firstName}
              error={errors.firstName}
              onChange={(v) =>
                setUser({ ...user, firstName: v })
              }
            />
            <Field
              label="Last Name"
              value={user.lastName}
              error={errors.lastName}
              onChange={(v) =>
                setUser({ ...user, lastName: v })
              }
            />
          </div>

          {/* Email / Mobile */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Email"
              value={user.email}
              error={errors.email}
              onChange={(v) => setUser({ ...user, email: v })}
            />
            <div>
              <Label>Mobile Number</Label>

              {!mobileEdit ? (
                <div className="flex gap-2 mt-1">
                  <Input value={user.mobile} disabled />
                  <Button
                    variant="outline"
                    onClick={() => setMobileEdit(true)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 mt-1">

                  <Input
                    placeholder="Enter new mobile"
                    value={newMobile}
                    maxLength={10}
                    inputMode="numeric"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setNewMobile(value);
                    }}
                  />

                  {!otpSent ? (
                    <Button
                      disabled={!formatIndianMobile(newMobile)}
                      onClick={sendOtpForOwner}
                    >
                      Send OTP
                    </Button>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500">
                        OTP sent. Verify to update.
                      </p>

                      <Input
                        placeholder="Enter 6-digit OTP"
                        value={otpCode}
                        maxLength={6}
                        inputMode="numeric"
                        onChange={(e) =>
                          setOtpCode(e.target.value.replace(/\D/g, ""))
                        }
                      />

                      <div className="flex items-center gap-3">
                        <Button
                          disabled={otpCode.length !== 6}
                          onClick={() => verifyOwnerOtp(otpCode)}
                        >
                          Verify OTP
                        </Button>

                        {otpTimer > 0 ? (
                          <span className="text-sm text-gray-500">
                            Resend in {otpTimer}s
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            disabled={resending}
                            onClick={resendOtp}
                          >
                            Resend OTP
                          </Button>
                        )}
                      </div>
                    </>
                  )}

                  <Button
                    variant="ghost"
                    onClick={() => {
                      setMobileEdit(false);
                      setOtpSent(false);
                      setNewMobile("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

          </div>

          {/* DOB / PIN */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              type="date"
              label="Date of Birth"
              value={user.dateOfBirth}
              error={errors.dateOfBirth}
              onChange={(v) =>
                setUser({ ...user, dateOfBirth: v })
              }
            />
            <Field
              label="Pin Code"
              value={user.pinCode}
              error={errors.pinCode}
              onChange={(v) =>
                setUser({
                  ...user,
                  pinCode: v.replace(/\D/g, ""),
                })
              }
            />
          </div>

          {/* Address */}
          <Field
            label="Address"
            value={user.address}
            error={errors.address}
            onChange={(v) => setUser({ ...user, address: v })}
          />

          {/* State / City */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>State</Label>
              <Select
                value={selectedStateCode}
                onValueChange={handleStateChange}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((s) => (
                    <SelectItem key={s.isoCode} value={s.isoCode}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.state}
                </p>
              )}
            </div>

            <div>
              <Label>City</Label>
              <Select
                value={user.city}
                onValueChange={(v) =>
                  setUser({ ...user, city: v })
                }
                disabled={!cities.length}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.city}
                </p>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-wrap items-center justify-between">

              {/* Current Password */}
              <PasswordField
                label="Current Password"
                value={passwordData.current}
                show={showPass.current}
                onToggle={() =>
                  setShowPass(p => ({ ...p, current: !p.current }))
                }
                onChange={v =>
                  setPasswordData(p => ({ ...p, current: v }))
                }
              />

              {/* New Password */}
              <PasswordField
                label="New Password"
                value={passwordData.new}
                show={showPass.new}
                onToggle={() =>
                  setShowPass(p => ({ ...p, new: !p.new }))
                }
                onChange={v =>
                  setPasswordData(p => ({ ...p, new: v }))
                }
              />

              {/* Confirm Password */}
              <PasswordField
                label="Confirm Password"
                value={passwordData.confirm}
                show={showPass.confirm}
                onToggle={() =>
                  setShowPass(p => ({ ...p, confirm: !p.confirm }))
                }
                onChange={v =>
                  setPasswordData(p => ({ ...p, confirm: v }))
                }
              />

              <Button
                variant="outline"
                onClick={handlePasswordUpdate}
                className="w-full mt-4"
              >
                Update Password
              </Button>

            </CardContent>
          </Card>


          {/* Save */}
          <div className="pt-4">
            <Button
              className="bg-primary text-white px-6"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}

/* ---------------- FIELD COMPONENT ---------------- */
function Field({ label, value, onChange, error, type = "text" }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 ${error ? "border-red-500" : ""}`}
      />
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}


function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
}) {
  return (
    <div className="w-full md:w-auto">
      <Label>{label}</Label>

      <div className="relative mt-1">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="pr-10"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
        >
          {show ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
