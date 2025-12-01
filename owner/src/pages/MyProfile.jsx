import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import { getIndianStates, getCitiesByState } from "@/utils/locationUtils";

export default function MyProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  /* ---------------------------------------------------
     LOAD PROFILE
  ---------------------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerProfile.url);
        const u = res.data?.user;

        if (u) {
          setUser({
            ...u,
            dateOfBirth: u.dateOfBirth ? u.dateOfBirth.substring(0, 10) : "",
          });

          // Auto populate states + cities
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

  /* ---------------------------------------------------
     HANDLE STATE CHANGE
  ---------------------------------------------------- */
  const handleStateChange = (code) => {
    setSelectedStateCode(code);
    const st = states.find((s) => s.isoCode === code);

    setUser((prev) => ({
      ...prev,
      state: st?.name || "",
      city: "",
    }));

    setCities(getCitiesByState(code));
  };

  /* ---------------------------------------------------
     SAVE PROFILE
  ---------------------------------------------------- */
  const handleSave = async () => {
    setSaving(true);

    try {
      const res = await api.put("/api/owner/update-profile", user);
      toast.success("Profile updated");

      setUser({
        ...res.data.user,
        dateOfBirth: res.data.user.dateOfBirth?.substring(0, 10),
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
      </div>
    );
  }

  /* ---------------------------------------------------
     UI
  ---------------------------------------------------- */
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-[26px] font-bold text-gray-900 flex items-center gap-3 mb-4 mt-2">My Profile</h1>

      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Avatar */}
          <div className="flex items-center gap-6">
            <img
              src={user.avatarUrl || "/default-avatar.png"}
              className="w-20 h-20 rounded-full object-cover border"
            />
            <Button variant="outline">Change Avatar</Button>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={user.firstName}
                onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={user.lastName}
                onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Email / Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Mobile Number</Label>
              <Input value={user.mobile} disabled className="mt-1 bg-gray-100" />
            </div>
          </div>

          {/* DOB / Pin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={user.dateOfBirth}
                onChange={(e) => setUser({ ...user, dateOfBirth: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Pin Code</Label>
              <Input
                maxLength={6}
                value={user.pinCode}
                onChange={(e) => setUser({ ...user, pinCode: e.target.value.replace(/\D/g, "") })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <Label>Address</Label>
            <Input
              value={user.address}
              onChange={(e) => setUser({ ...user, address: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* State + City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>State</Label>
              <Select value={selectedStateCode} onValueChange={handleStateChange}>
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
            </div>

            <div>
              <Label>City</Label>
              <Select
                value={user.city}
                onValueChange={(v) => setUser({ ...user, city: v })}
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
            </div>
          </div>

          {/* Save Button */}
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
