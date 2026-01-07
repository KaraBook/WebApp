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
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import { getIndianStates, getCitiesByState } from "@/utils/locationUtils";

export default function MyProfile() {
  const fileRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [states] = useState(getIndianStates());
  const [cities, setCities] = useState([]);
  const [selectedStateCode, setSelectedStateCode] = useState("");

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
              <Label>Mobile</Label>
              <Input
                value={user.mobile}
                disabled
                className="mt-1 bg-gray-100"
              />
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
