import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";
import SummaryApi from "@/common/SummaryApi";
import { format } from "date-fns";
import { toast } from "sonner";

const reasons = [
    "Property maintenance",
    "Overbooking",
    "Personal emergency",
    "Property unavailable",
    "Other"
];

export default function OwnerCancelBookingDialog({ open, booking, onClose }) {
    const [step, setStep] = useState(0);
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState("");
    const [agree, setAgree] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refundPercent, setRefundPercent] = useState(100);

    useEffect(() => {
        if (!booking) return;
        setStep(0);
        setReason("");
        setNotes("");
        setAgree(false);
    }, [booking]);

    const confirmCancel = async () => {
        try {
            setLoading(true);
            await api.post(
                SummaryApi.ownerCancelBooking.url(booking._id),
                { reason, notes, refundPercent }
            );
            toast.success("Booking cancelled successfully");
            onClose(true);
        } catch {
            toast.error("Cancellation failed");
        } finally {
            setLoading(false);
        }
    };

    if (!booking) return null;

    const refundAmount = Math.round(
        (booking.grandTotal * refundPercent) / 100
    );

    return (
        <Dialog open={open} onOpenChange={() => onClose(false)}>
            <DialogContent className="max-w-lg p-0 z-[9999999] overflow-hidden">

                <DialogHeader className="px-6 pt-6">
                    <DialogTitle>Cancel Booking</DialogTitle>
                </DialogHeader>

                {/* PROGRESS DOTS (5 STEPS like traveller) */}
                <div className="flex justify-center gap-2 py-3">
                    {[0, 1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${step === i ? "bg-primary" : "bg-gray-300"}`}
                        />
                    ))}
                </div>

                <div className="px-6 pb-6 space-y-5">

                    {/* ================= STEP 1 ================= */}
                    {step === 0 && (
                        <>
                            <div className="border rounded-lg p-4 flex gap-3">
                                <img src={booking.propertyId.coverImage} className="w-20 h-16 object-cover rounded" />
                                <div>
                                    <p className="font-semibold">{booking.propertyId.propertyName}</p>
                                    <p className="text-xs text-gray-500">Ref: {booking._id.slice(-6)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                <span>Check-in</span>
                                <span className="font-medium text-right">
                                    {format(new Date(booking.checkIn), "EEE, dd MMM yyyy")}
                                </span>

                                <span>Check-out</span>
                                <span className="font-medium text-right">
                                    {format(new Date(booking.checkOut), "EEE, dd MMM yyyy")}
                                </span>

                                <span>Traveller</span>
                                <span className="font-medium text-right">
                                    {booking.userId.firstName} {booking.userId.lastName}
                                </span>

                                <span>Total Paid</span>
                                <span className="font-semibold text-right">
                                    ₹{booking.grandTotal.toLocaleString()}
                                </span>
                            </div>
                        </>
                    )}

                    {/* ================= STEP 2 ================= */}
                    {step === 1 && (
                        <>
                            <p className="font-medium">Why are you cancelling?</p>
                            <div className="space-y-2">
                                {reasons.map(r => (
                                    <div
                                        key={r}
                                        onClick={() => setReason(r)}
                                        className={`border p-3 rounded cursor-pointer ${reason === r ? "border-primary bg-[#028ea10f]" : ""
                                            }`}
                                    >
                                        {r}
                                    </div>
                                ))}
                            </div>

                            <textarea
                                placeholder="Additional notes (optional)"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full border rounded p-2 text-sm"
                            />
                        </>
                    )}

                    {/* ================= STEP 3 ================= */}
                    {step === 2 && (
                        <>
                            <p className="font-medium">Set Refund Percentage</p>

                            <div className="space-y-3">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="10"
                                    value={refundPercent}
                                    onChange={(e) => setRefundPercent(Number(e.target.value))}
                                    className="w-full"
                                />

                                <div className="flex justify-between text-sm">
                                    <span>0%</span>
                                    <span className="font-semibold text-primary">
                                        {refundPercent}% refund
                                    </span>
                                    <span>100%</span>
                                </div>

                                <div className="border rounded-lg p-3 text-sm">
                                    <div className="flex justify-between">
                                        <span>Total Paid</span>
                                        <span>₹{booking.grandTotal}</span>
                                    </div>
                                    <div className="flex justify-between text-green-600 font-semibold">
                                        <span>Refund Amount</span>
                                        <span>
                                            ₹{Math.round((booking.grandTotal * refundPercent) / 100)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ================= STEP 4 ================= */}
                    {step === 3 && (
                        <>
                            <div className="border rounded-lg p-4 space-y-2">
                                <div className="flex justify-between">
                                    <span>Total Paid</span>
                                    <span>₹{booking.grandTotal}</span>
                                </div>
                                <div className="flex justify-between text-red-500">
                                    <span>Cancellation Fee</span>
                                    <span>-₹0</span>
                                </div>
                                <div className="flex justify-between text-green-600 font-semibold">
                                    <span>Refund Amount</span>
                                    <span>₹{refundAmount}</span>
                                </div>
                            </div>

                            <div className="bg-green-50 text-green-700 p-3 rounded text-sm">
                                ✔ Traveller will receive {refundPercent}% refund
                            </div>
                        </>
                    )}

                    {/* ================= STEP 5 ================= */}
                    {step === 4 && (
                        <>
                            <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-700">
                                ⚠ This action cannot be undone.
                            </div>

                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span>Booking</span>
                                    <span>{booking.propertyId.propertyName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Reason</span>
                                    <span>{reason}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-green-600">
                                    <span>Refund</span>
                                    <span>₹{refundAmount}</span>
                                </div>
                            </div>

                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} />
                                I agree to refund {refundPercent}% of the amount
                            </label>
                        </>
                    )}

                    {/* ================= FOOTER ================= */}
                    <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={() => step === 0 ? onClose(false) : setStep(step - 1)}>
                            Back
                        </Button>

                        <Button
                            className="bg-primary hover:bg-primary/90"
                            disabled={
                                (step === 1 && !reason) ||
                                (step === 4 && !agree) ||
                                loading
                            }
                            onClick={() => {
                                if (step === 4) confirmCancel();
                                else setStep(step + 1);
                            }}
                        >
                            {step === 4 ? "Confirm Cancellation" : "Continue"}
                        </Button>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}