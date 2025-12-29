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
    const [editingMobile, setEditingMobile] = useState(false);
    const [mobile, setMobile] = useState(profile?.mobile || "");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [verifying, setVerifying] = useState(false);


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

    const sendOtp = async () => {
        try {
            await signInWithPhoneNumber(auth, `+91${mobile}`, window.recaptchaVerifier);
            setOtpSent(true);
            toast.success("OTP sent");
        } catch {
            toast.error("Failed to send OTP");
        }
    };

    const verifyOtpAndUpdate = async () => {
        try {
            setVerifying(true);

            await window.confirmationResult.confirm(otp);

            const res = await Axios.put(
                SummaryApi.updateTravellerMobile.url,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            toast.success("Mobile number updated");
            onUpdated({ ...profile, mobile: res.data.mobile });
            setEditingMobile(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || "OTP verification failed");
        } finally {
            setVerifying(false);
        }
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
                    <div className="sm:col-span-2">
                        <Label>Mobile Number</Label>

                        {!editingMobile ? (
                            <div className="flex items-center justify-between border rounded-md px-3 py-2">
                                <span className="text-sm text-gray-700">{profile.mobile}</span>
                                <Button size="sm" variant="outline" onClick={() => setEditingMobile(true)}>
                                    Change
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Input
                                    placeholder="Enter new mobile number"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                />

                                {otpSent && (
                                    <Input
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                )}

                                <div className="flex gap-2">
                                    {!otpSent ? (
                                        <Button onClick={sendOtp} size="sm">
                                            Send OTP
                                        </Button>
                                    ) : (
                                        <Button onClick={verifyOtpAndUpdate} size="sm" disabled={verifying}>
                                            {verifying ? "Verifying..." : "Verify & Update"}
                                        </Button>
                                    )}

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setEditingMobile(false);
                                            setOtp("");
                                            setOtpSent(false);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

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
