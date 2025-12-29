import { useState, useEffect } from "react";
import axios from "axios";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Axios from "@/utils/Axios"; // ONLY for normal profile update
import SummaryApi, { baseURL } from "@/common/SummaryApi";
import { toast } from "sonner";
import { auth, buildRecaptcha, signInWithPhoneNumber } from "/firebase";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    getIndianStates,
    getCitiesByState,
} from "@/utils/locationUtils";


export default function EditProfileDialog({ open, onClose, profile, onUpdated }) {
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);

    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedStateCode, setSelectedStateCode] = useState("");

    const [editingMobile, setEditingMobile] = useState(false);
    const [mobile, setMobile] = useState(profile?.mobile || "");
    const [otp, setOtp] = useState("");
    const [confirmResult, setConfirmResult] = useState(null);
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [timer, setTimer] = useState(0);

    /* ================= INIT FORM ================= */
    useEffect(() => {
        if (!profile) return;
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
        setMobile(profile.mobile);
    }, [profile]);

    /* ================= RESET + RECAPTCHA ================= */
    useEffect(() => {
        if (!open) {
            setEditingMobile(false);
            setOtp("");
            setConfirmResult(null);
            setTimer(0);
            return;
        }
        try {
            buildRecaptcha();
        } catch { }
    }, [open]);

    /* ================= TIMER ================= */
    useEffect(() => {
        if (timer <= 0) return;
        const i = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(i);
    }, [timer]);

    /* ================= SEND OTP ================= */
    const sendOtp = async () => {
        if (mobile.length !== 10) return;

        setSending(true);
        try {
            // 🔓 PUBLIC PRECHECK (NO INTERCEPTOR)
            await axios.post(
                baseURL + SummaryApi.travellerPrecheck.url,
                { mobile }
            );

            await auth.signOut().catch(() => { });
            const verifier = window.recaptchaVerifier || buildRecaptcha();

            const confirmation = await signInWithPhoneNumber(
                auth,
                `+91${mobile}`,
                verifier
            );

            setConfirmResult(confirmation);
            setTimer(60);
            toast.success("OTP sent successfully");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Cannot send OTP");
        } finally {
            setSending(false);
        }
    };

    /* ================= VERIFY OTP + UPDATE MOBILE ================= */
    const verifyOtpAndUpdate = async (code = otp) => {
        if (!confirmResult || code.length !== 6) return;

        setVerifying(true);
        try {
            const credential = await confirmResult.confirm(code);
            const idToken = await credential.user.getIdToken(true);

            // 🔥 RAW AXIOS (NOT Axios)
            const res = await axios.put(
                baseURL + SummaryApi.updateTravellerMobile.url,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                }
            );

            toast.success("Mobile number updated");
            onUpdated({ ...profile, mobile: res.data.mobile });
            setEditingMobile(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Invalid OTP");
            setOtp("");
        } finally {
            setVerifying(false);
        }
    };

    /* ================= AUTO VERIFY ================= */
    useEffect(() => {
        if (otp.length === 6 && !verifying) {
            verifyOtpAndUpdate(otp);
        }
    }, [otp]);

    /* ================= SAVE PROFILE ================= */
    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await Axios.put(
                SummaryApi.updateTravellerProfile.url,
                form
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


    useEffect(() => {
        const allStates = getIndianStates();
        setStates(allStates);

        if (profile?.state) {
            const found = allStates.find(s => s.name === profile.state);
            if (found) {
                setSelectedStateCode(found.isoCode);
                setCities(getCitiesByState(found.isoCode));
            }
        }
    }, [profile]);

    const handleStateChange = (stateCode) => {
        setSelectedStateCode(stateCode);

        const stateObj = states.find(s => s.isoCode === stateCode);
        setForm({
            ...form,
            state: stateObj?.name || "",
            city: "", // reset city
        });

        const stateCities = getCitiesByState(stateCode);
        setCities(stateCities);
    };



    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>

                {/* 🔐 REQUIRED FOR FIREBASE */}
                <div id="recaptcha-container" className="hidden" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* MOBILE */}
                    <div className="sm:col-span-2">
                        <Label>Mobile Number</Label>

                        {!editingMobile ? (
                            <div className="flex items-center justify-between border rounded-md px-3 py-2">
                                <span>{profile.mobile}</span>
                                <Button size="sm" variant="outline" onClick={() => setEditingMobile(true)}>
                                    Change
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Input
                                    maxLength={10}
                                    inputMode="numeric"
                                    value={mobile}
                                    placeholder="Enter new mobile"
                                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                                />

                                {confirmResult && (
                                    <Input
                                        maxLength={6}
                                        inputMode="numeric"
                                        value={otp}
                                        placeholder="Enter OTP"
                                        disabled={verifying}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    />
                                )}

                                <div className="text-sm text-gray-600">
                                    {timer > 0 ? `Resend OTP in ${timer}s` : (
                                        <button className="underline" onClick={sendOtp}>Resend OTP</button>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    {!confirmResult ? (
                                        <Button size="sm" onClick={sendOtp} disabled={sending || mobile.length !== 10}>
                                            {sending ? "Sending..." : "Send OTP"}
                                        </Button>
                                    ) : (
                                        <Button size="sm" disabled>
                                            {verifying ? "Verifying..." : "Waiting for OTP"}
                                        </Button>
                                    )}

                                    <Button size="sm" variant="ghost" onClick={() => {
                                        setEditingMobile(false);
                                        setOtp("");
                                        setConfirmResult(null);
                                    }}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* OTHER FIELDS */}
                    <div>
                        <Label>First Name</Label>
                        <Input name="firstName" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                    </div>

                    <div>
                        <Label>Last Name</Label>
                        <Input name="lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                    </div>

                    <div className="sm:col-span-2">
                        <Label>Email</Label>
                        <Input name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>

                    <div>
                        <Label>Date of Birth</Label>
                        <Input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                    </div>

                    <div>
                        <Label>Pin Code</Label>
                        <Input name="pinCode" value={form.pinCode} onChange={(e) => setForm({ ...form, pinCode: e.target.value })} />
                    </div>

                    <div className="sm:col-span-2">
                        <Label>Address</Label>
                        <Input name="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    </div>

                    <div>
                        <Label>State</Label>

                        <Select
                            value={selectedStateCode}
                            onValueChange={handleStateChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                            </SelectTrigger>

                            <SelectContent>
                                {states.map((state) => (
                                    <SelectItem key={state.isoCode} value={state.isoCode}>
                                        {state.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>City</Label>

                        <Select
                            value={form.city}
                            onValueChange={(value) =>
                                setForm({ ...form, city: value })
                            }
                            disabled={!selectedStateCode}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select city" />
                            </SelectTrigger>

                            <SelectContent>
                                {cities.map((city) => (
                                    <SelectItem key={city.name} value={city.name}>
                                        {city.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                </div>

                <div className="flex justify-end gap-3 mt-3">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
