import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { format } from "date-fns";
import { toast } from "sonner";

const reasons = [
    "Change of travel plans",
    "Found alternative accommodation",
    "Personal / family emergency",
    "Weather / safety concerns",
    "Other"
];

export default function CancelBookingDialog({ open, booking, onClose }) {
    const [step, setStep] = useState(0);
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState("");
    const [preview, setPreview] = useState(null);
    const [agree, setAgree] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!booking) return;
        setStep(0);
        setReason("");
        setNotes("");
        setAgree(false);
    }, [booking]);

    /* ===== LOAD REFUND PREVIEW ===== */
    const loadPreview = async () => {
        const res = await Axios.get(
            SummaryApi.cancelPreview.url(booking._id)
        );
        setPreview(res.data);
    };

    /* ===== CONFIRM CANCEL ===== */
    const confirmCancel = async () => {
        try {
            setLoading(true);
            await Axios.post(
                SummaryApi.cancelBooking.url(booking._id),
                { reason, notes }
            );
            toast.success("Booking cancelled successfully");
            onClose(true, booking.propertyId._id);
        } catch {
            toast.error("Cancellation failed");
        } finally {
            setLoading(false);
        }
    };

    if (!booking) return null;

    const nights = Math.ceil(
        (new Date(booking.checkOut) - new Date(booking.checkIn)) /
        (1000 * 60 * 60 * 24)
    );

    if (booking?.cancelled) {
        return (
            <Dialog open={open} onOpenChange={() => onClose(false)}>
                <DialogContent className="max-w-lg p-0 z-[9999999] overflow-hidden">

                    <button
                        onClick={() => onClose(false)}
                        className="absolute right-4 top-4 text-gray-500 hover:text-black"
                    >
                        ✕
                    </button>
                    <DialogHeader className="px-6 pt-6">
                        <DialogTitle>Cancel Booking</DialogTitle>
                    </DialogHeader>

                    {/* PROGRESS DOTS */}
                    <div className="flex justify-center gap-2 py-3">
                        {[0, 1, 2, 3, 4].map(i => (
                            <div key={i} className={`w-2 h-2 rounded-full ${step === i ? "bg-red-500" : "bg-gray-300"}`} />
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

                                    <span>Guests</span>
                                    <span className="font-medium text-right">
                                        {booking.guests.adults + booking.guests.children}
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
                                        <div key={r}
                                            onClick={() => setReason(r)}
                                            className={`border p-3 rounded cursor-pointer ${reason === r ? "border-red-500 bg-red-50" : ""
                                                }`}>
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
                            preview ? (
                                <>
                                    <div className="border rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span>Total Paid</span>
                                            <span>₹{booking.grandTotal}</span>
                                        </div>
                                        <div className="flex justify-between text-red-500">
                                            <span>Cancellation Fee</span>
                                            <span>-₹{booking.grandTotal - preview.refundAmount}</span>
                                        </div>
                                        <div className="flex justify-between text-green-600 font-semibold">
                                            <span>Refund Amount</span>
                                            <span>₹{preview.refundAmount}</span>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 text-green-700 p-3 rounded text-sm">
                                        ✔ You'll receive {preview.refundPercent}% refund within 5–7 business days
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10 text-gray-500">
                                    Calculating refund...
                                </div>
                            )
                        )}

                        {/* ================= STEP 4 ================= */}
                        {step === 3 && (
                            <>
                                <p className="font-medium">Cancellation Policy</p>

                                {Array.isArray(booking.propertyId?.cancellationPolicy) &&
                                    booking.propertyId.cancellationPolicy.length > 0 ? (

                                    <div className="border rounded-lg overflow-hidden">
                                        {booking.propertyId.cancellationPolicy.map((p, i) => (
                                            <div key={i} className="flex justify-between px-4 py-2 border-b last:border-0">
                                                <span>{p.minDaysBefore}+ days before check-in</span>
                                                <span className="font-medium">
                                                    {p.refundPercent}% refund
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                ) : (
                                    <div className="bg-yellow-50 text-yellow-700 p-3 rounded text-sm">
                                        This booking is non-refundable.
                                    </div>
                                )}

                                <ul className="text-xs text-gray-500 mt-2 space-y-1">
                                    <li>• Refund initiated within 24 hours</li>
                                    <li>• Credited to original payment method</li>
                                    <li>• Processing time: 5–7 business days</li>
                                </ul>
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
                                        <span>₹{preview.refundAmount}</span>
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} />
                                    I agree to the cancellation policy
                                </label>
                            </>
                        )}

                        {/* ================= FOOTER ================= */}
                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => step === 0 ? onClose(false) : setStep(step - 1)}>
                                Back
                            </Button>

                            <Button
                                className="bg-red-600 hover:bg-red-700"
                                disabled={
                                    (step === 1 && !reason) ||
                                    (step === 4 && !agree) ||
                                    loading
                                }
                                onClick={async () => {

                                    if (step === 1) await loadPreview();

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
}