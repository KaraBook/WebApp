import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Axios from "../utils/Axios";
import { toast } from "sonner";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import SummaryApi from "../common/SummaryApi";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function Checkout() {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    const [property, setProperty] = useState(null);
    const [contact, setContact] = useState("");
    const [loading, setLoading] = useState(true);
    const [showGuestDropdown, setShowGuestDropdown] = useState(false);

    const { from, to, guests } = state || {};
    const [guestCount, setGuestCount] = useState(guests || 1);
    const [showCalendar, setShowCalendar] = useState(false);
    const [dateRange, setDateRange] = useState([
        {
            startDate: from ? new Date(from) : new Date(),
            endDate: to ? new Date(to) : new Date(new Date().setDate(new Date().getDate() + 1)),
            key: "selection",
        },
    ]);
    const calendarRef = useRef(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await Axios.get(`/api/properties/${propertyId}`);
                setProperty(res.data.data);
            } catch {
                toast.error("Failed to load property");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [propertyId]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (calendarRef.current && !calendarRef.current.contains(e.target)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!property) return <div className="text-center py-20">Property not found.</div>;

    const startDate = dateRange[0].startDate;
    const endDate = dateRange[0].endDate;
    const nights =
        Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))) || 1;

    const basePrice = property.pricingPerNightWeekdays * nights;
    const tax = Math.round(basePrice * 0.05);
    const total = basePrice + tax;

    const handleContactChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length <= 10) setContact(value);
    };

    const handlePayment = async () => {
        if (contact.length !== 10) {
            toast.error("Enter a valid 10-digit mobile number");
            return;
        }
        try {
            const res = await Axios.post(SummaryApi.createBookingOrder.url, {
                propertyId,
                totalAmount: total,
                checkIn: startDate,
                checkOut: endDate,
                guests: guestCount,
                contactNumber: contact,
            });

            const { order } = res.data;
            const loaded = await loadRazorpayScript();
            if (!loaded) return toast.error("Razorpay SDK failed to load");

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Villa Booking",
                description: "Confirm & Pay",
                order_id: order.id,
                handler: async (response) => {
                    await Axios.post(SummaryApi.verifyBookingPayment.url, response);
                    toast.success("Payment successful!");
                    navigate("/account/bookings/");
                },
                prefill: { contact },
                theme: { color: "#efcc61" },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error(err);
            toast.error("Unable to create payment");
        }
    };

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 px-4 py-10">
            {/* LEFT SECTION */}
            <div>
                <h2 className="text-2xl font-bold mb-6">Confirm and pay</h2>

                {/* Trip Summary */}
                <div className="border rounded-2xl p-5 mb-6">
                    <h3 className="font-semibold mb-2 text-lg">Your trip</h3>

                    {/* Dates */}
                    <div className="flex justify-between text-sm mb-3 relative">
                        <div>
                            <span className="block text-gray-700 font-medium">Dates</span>
                            <span>
                                {format(startDate, "dd MMM")} – {format(endDate, "dd MMM")}
                            </span>
                        </div>
                        <button
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="text-[#233b19] font-semibold hover:underline"
                        >
                            Edit
                        </button>

                        {showCalendar && (
                            <div
                                ref={calendarRef}
                                className="absolute top-10 left-0 bg-white p-3 rounded-2xl shadow-2xl border border-gray-100 z-50"
                            >
                                <DateRange
                                    ranges={dateRange}
                                    onChange={(item) => setDateRange([item.selection])}
                                    minDate={new Date()}
                                    rangeColors={["#efcc61"]}
                                    moveRangeOnFirstSelection={false}
                                    showSelectionPreview={false}
                                    showDateDisplay={false}
                                    months={1}
                                    direction="horizontal"
                                />
                            </div>
                        )}
                    </div>

                    {/* Guests */}
                    <div className="flex justify-between text-sm items-center relative">
                        <div>
                            <span className="block text-gray-700 font-medium">Guests</span>
                            <span>
                                {guestCount} {guestCount > 1 ? "guests" : "guest"}
                            </span>
                        </div>

                        <button
                            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                            className="text-[#233b19] font-semibold hover:underline relative"
                        >
                            Edit
                        </button>

                        {showGuestDropdown && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-2xl shadow-2xl p-3 w-40 z-50">
                                <p className="text-sm text-gray-600 mb-2 font-medium">Select guests</p>
                                <div className="max-h-48 overflow-y-auto">
                                    {[...Array(property.maxGuests || 10)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setGuestCount(i + 1);
                                                setShowGuestDropdown(false);
                                            }}
                                            className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${guestCount === i + 1
                                                ? "bg-[#efcc61] text-black font-semibold"
                                                : "hover:bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {i + 1} {i === 0 ? "Guest" : "Guests"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact */}
                <div className="border rounded-2xl p-5 mb-6">
                    <h3 className="font-semibold mb-3 text-lg">Contact number</h3>
                    <input
                        type="tel"
                        value={contact}
                        onChange={handleContactChange}
                        placeholder="Enter 10-digit mobile number"
                        className="border border-gray-300 rounded-full px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        We'll contact you on this number for booking confirmation.
                    </p>
                </div>

                <Button
                    onClick={handlePayment}
                    disabled={contact.length !== 10}
                    className="w-full bg-[#efcc61] text-black rounded-full py-3 text-lg hover:bg-[#efcc61]"
                >
                    Pay Now
                </Button>
            </div>

            {/* RIGHT SECTION */}
            <div>
                <div className="border rounded-2xl p-5 shadow-sm">
                    <div className="flex gap-3 mb-3">
                        <img
                            src={property.coverImage}
                            alt={property.propertyName}
                            className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div>
                            <h4 className="font-semibold">{property.propertyName}</h4>
                            <p className="text-sm text-gray-600">
                                {property.city}, {property.state}
                            </p>
                        </div>
                    </div>

                    <div className="border-t pt-3 mt-3 text-sm space-y-2">
                        <div className="flex justify-between">
                            <span>
                                {nights} nights × ₹{property.pricingPerNightWeekdays.toLocaleString()}
                            </span>
                            <span>₹{basePrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Taxes</span>
                            <span>₹{tax.toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold text-base">
                            <span>Total (INR)</span>
                            <span>₹{total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
