import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { toast } from "sonner";

export default function EditProfileDialog({ open, onClose, profile, token, onUpdated }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        dateOfBirth: profile.dateOfBirth?.slice(0, 10) || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        pinCode: profile.pinCode || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await Axios.put(
        SummaryApi.updateTravellerProfile.url,
        form,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success("Profile updated");
      onUpdated(res.data.user);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>First Name</Label>
            <Input name="firstName" value={form.firstName} onChange={handleChange} />
          </div>

          <div>
            <Label>Last Name</Label>
            <Input name="lastName" value={form.lastName} onChange={handleChange} />
          </div>

          <div className="sm:col-span-2">
            <Label>Email</Label>
            <Input name="email" value={form.email} onChange={handleChange} />
          </div>

          <div>
            <Label>Date of Birth</Label>
            <Input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
          </div>

          <div>
            <Label>Pin Code</Label>
            <Input name="pinCode" value={form.pinCode} onChange={handleChange} />
          </div>

          <div className="sm:col-span-2">
            <Label>Address</Label>
            <Input name="address" value={form.address} onChange={handleChange} />
          </div>

          <div>
            <Label>City</Label>
            <Input name="city" value={form.city} onChange={handleChange} />
          </div>

          <div>
            <Label>State</Label>
            <Input name="state" value={form.state} onChange={handleChange} />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
