import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Axios from "../utils/Axios";
import { format } from "date-fns";
import { CheckCircle, Mail, Clock, Phone, FileText, Home, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThankYou() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { bookingId } = useParams();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!bookingId) {
            navigate("/", { replace: true });
            return;
        }

        const fetchBooking = async () => {
            try {
                const res = await Axios.get(`/api/bookings/${bookingId}`);
                setBooking(res.data.data);
            } catch {
                navigate("/", { replace: true });
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId, navigate]);

    if (loading || !booking) {
        return <div className="text-center py-24">Loading booking…</div>;
    }

    const {
        propertyId: property,
        checkIn,
        checkOut,
        guests,
        meals,
        totalNights,
        grandTotal,
        taxAmount,
        cgstAmount,
        sgstAmount,
        totalAmount,
        createdAt,
        bookingCode,
    } = booking;

    const cgst = Number(cgstAmount || 0);
    const sgst = Number(sgstAmount || 0);
    const totalTax = cgst + sgst;
    const hasTax = totalTax > 0;

    const checkInTime = property?.checkInTime || "2:00 PM";

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-6xl mx-auto">

                {/* SUCCESS HEADER */}
                <div className="text-center mb-10">
                    <div className="relative inline-flex items-center justify-center mb-4">
                        <span className="absolute inline-flex h-24 w-24 rounded-full bg-primary opacity-75 animate-ping"></span>
                        <span className="relative inline-flex h-20 w-20 rounded-full bg-primary items-center justify-center">
                            <CheckCircle className="text-white w-10 h-10" />
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
                    <p className="text-gray-600 mt-2">
                        Thank you for choosing KaraBook. Your reservation is confirmed.
                    </p>

                    <div className="inline-block mt-4 px-4 py-1 rounded-full bg-teal-50 text-teal-700 text-sm font-medium">
                        Booking ID: {bookingCode || bookingId}
                    </div>
                </div>

                {/* CONTENT GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* LEFT: BOOKING DETAILS */}
                    <div className="bg-white rounded-xl border p-6 space-y-4">
                        <h3 className="font-semibold text-lg">Booking Details</h3>

                        <div>
                            <p className="font-medium">{property.propertyName}</p>
                            <p className="text-sm text-gray-500">
                                {property.city}, {property.state}
                            </p>
                        </div>

                        <hr />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Check-in</p>
                                <p className="font-bold">{format(new Date(checkIn), "dd MMM yyyy")}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Check-out</p>
                                <p className="font-bold">{format(new Date(checkOut), "dd MMM yyyy")}</p>
                            </div>
                        </div>

                        <div className="text-sm">
                            <p>
                                Guests: {guests.adults} Adults
                                {guests.children > 0 && `, ${guests.children} Children`}
                            </p>

                            {meals?.includeMeals && (
                                <p className="mt-1">
                                    Meals: Veg {meals.veg}, Non-veg {meals.nonVeg}
                                </p>
                            )}
                        </div>

                        <hr />

                        {/* PRICE BREAKDOWN */}
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span>
                                    Room charges ({totalNights} {totalNights > 1 ? "nights" : "night"})
                                </span>
                                <span className="font-bold">₹{totalAmount.toLocaleString()}</span>
                            </div>

                            {hasTax && (
                                <>
                                    <div className="flex justify-between">
                                        <span>CGST (9%)</span>
                                        <span>₹{cgst.toLocaleString()}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>SGST (9%)</span>
                                        <span>₹{sgst.toLocaleString()}</span>
                                    </div>
                                </>
                            )}

                            <div className="flex justify-between font-semibold border-t pt-2">
                                <span>Total paid</span>
                                <span className="text-teal-600">
                                    ₹{grandTotal.toLocaleString()}
                                </span>
                            </div>
                            {hasTax && (
                                <p className="text-xs text-gray-500 text-right">
                                    (Inclusive of GST)
                                </p>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: NEXT STEPS */}
                    <div className="bg-white rounded-xl border p-6 space-y-5">
                        <h3 className="font-semibold text-lg">What happens next?</h3>

                        <Step
                            icon={<Mail />}
                            title="Confirmation email sent"
                            desc="Check your inbox for booking confirmation and receipt"
                        />

                        <Step
                            icon={<Clock />}
                            title={`Check-in time: ${checkInTime}`}
                            desc="Early check-in available upon request"
                        />

                        <Step
                            icon={<Phone />}
                            title="Property will contact you"
                            desc="Expect a call 24 hours before check-in"
                        />

                        <Step
                            icon={<FileText />}
                            title="Carry valid ID proof"
                            desc="Required for all guests during check-in"
                        />
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap justify-center gap-4 mt-10">
                    <Button
                        className="bg-primary text-white"
                        onClick={() => navigate("/account/bookings")}
                    >
                        <List className="w-4 h-4 mr-2 " />
                        View My Bookings
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => navigate("/")}
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>
                </div>

                {/* FOOTER */}
                <div className="text-center mt-12 text-sm text-gray-500">
                    Need assistance with your booking?
                    <br />
                    Call us: <b>+91 98765 43210</b> | Email: <b>support@karabook.com</b>
                </div>
            </div>
        </div>
    );
}

function Step({ icon, title, desc }) {
    return (
        <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                {icon}
            </div>
            <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-gray-500">{desc}</p>
            </div>
        </div>
    );
}
