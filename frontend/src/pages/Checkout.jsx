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
    const [bookedDates, setBookedDates] = useState([]);
    const [blockedDates, setBlockedDates] = useState([]);
    const guestRef = useRef(null);


    const normalizeRanges = (ranges) =>
        ranges.map((r) => {
            const start = new Date(r.start);
            const end = new Date(r.end);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            return { start, end };
        });

    const isDateDisabled = (date) => {
        const all = [...bookedDates, ...blockedDates];
        return all.some((range) => date >= range.start && date <= range.end);
    };

    const { from, to, guests } = state || {};
    const [guestData, setGuestData] = useState(
        guests || { adults: 1, children: 0, infants: 0 }
    );

    const totalMainGuests = guestData.adults + guestData.children;
    const maxGuests = property?.maxGuests || 1;
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
        if (!propertyId) return;

        const fetchDates = async () => {
            try {
                const bookedRes = await Axios.get(
                    SummaryApi.getBookedDates.url(propertyId)
                );
                const blockedRes = await Axios.get(
                    SummaryApi.getPropertyBlockedDates.url(propertyId)
                );

                setBookedDates(normalizeRanges(bookedRes.data.dates || []));
                setBlockedDates(normalizeRanges(blockedRes.data.dates || []));
            } catch (err) {
                console.error("Failed to fetch calendar dates on checkout");
            }
        };

        fetchDates();
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
                guests: guestData,
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
                handler: (response) => {
                    Axios.post(SummaryApi.verifyBookingPayment.url, response)
                        .catch(() => { });
                    toast.success("Payment successful!");
                    navigate("/account/bookings/", { replace: true });
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
                <div className="border rounded-[0] p-5 mb-6">
                    <h3 className="font-semibold mb-2 text-lg">Your trip</h3>

                    {/* DATE PICKER */}
                    <div className="flex justify-between text-sm mb-3 relative" ref={calendarRef}>
                        <div>
                            <span className="block text-gray-700 font-medium">Dates</span>
                            <span>
                                {format(dateRange[0].startDate, "dd MMM")} – {format(dateRange[0].endDate, "dd MMM")}
                            </span>
                        </div>

                        <button
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="text-[#233b19] font-semibold hover:underline"
                        >
                            Edit
                        </button>

                        {showCalendar && (
                            <div className="absolute top-10 left-0 bg-white p-3 rounded-[0] shadow-2xl border border-gray-100 z-50">
                                <DateRange
                                    ranges={dateRange}
                                    months={2}
                                    direction="horizontal"
                                    showDateDisplay={false}
                                    moveRangeOnFirstSelection={false}
                                    rangeColors={["#04929f"]}
                                    minDate={new Date()}
                                    dayContentRenderer={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);

                                        const isPast = date < today;
                                        const isBlocked = isDateDisabled(date);
                                        const disabled = isPast || isBlocked;

                                        const isSelected =
                                            date >= dateRange[0].startDate &&
                                            date <= dateRange[0].endDate;

                                        return (
                                            <div
                                                onClick={(e) => {
                                                    if (disabled) {
                                                        e.stopPropagation();
                                                        toast.error("This date is unavailable");
                                                    }
                                                }}
                                                className={`
                flex items-center justify-center w-full h-full rounded-full
                ${disabled ? "bg-[#1297a317] text-gray-400 cursor-not-allowed" : ""}
                ${!disabled && !isSelected ? "hover:bg-primary border-primary hover:text-white cursor-pointer" : ""}
                ${isSelected ? "bg-primary text-white font-semibold" : ""}
              `}
                                            >
                                                {date.getDate()}
                                            </div>
                                        );
                                    }}
                                    onChange={(item) => {
                                        const start = item.selection.startDate;
                                        const end = item.selection.endDate;

                                        let invalid = false;
                                        let curr = new Date(start);
                                        while (curr <= end) {
                                            if (isDateDisabled(curr)) invalid = true;
                                            curr.setDate(curr.getDate() + 1);
                                        }

                                        if (invalid) {
                                            toast.error("These dates include unavailable days!");
                                            return;
                                        }

                                        setDateRange([item.selection]);

                                        if (item.selection.startDate !== item.selection.endDate) {
                                            setShowCalendar(false);
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>


                    {/* GUESTS */}
                    {/* GUESTS DROPDOWN */}
                    <div className="flex justify-between text-sm items-center relative" ref={guestRef}>
                        <div>
                            <span className="block text-gray-700 font-medium">Guests</span>
                            <span>{totalMainGuests} guests</span>
                        </div>

                        <button
                            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                            className="text-[#233b19] font-semibold hover:underline"
                        >
                            Edit
                        </button>

                        {showGuestDropdown && (
                            <div className="absolute right-0 top-8 bg-white border shadow-xl p-4 w-[55%] z-50">

                                {/* Adults */}
                                <div className="flex justify-between items-center py-2">
                                    <div>
                                        <p className="font-medium">Adults</p>
                                        <p className="text-xs text-gray-500">Age 13+</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            className="border rounded-full w-7 h-7 flex items-center justify-center"
                                            onClick={() =>
                                                setGuestData((g) => ({ ...g, adults: Math.max(1, g.adults - 1) }))
                                            }
                                        >−</button>

                                        <span>{guestData.adults}</span>

                                        <button
                                            className="border rounded-full w-7 h-7 flex items-center justify-center disabled:opacity-40"
                                            disabled={totalMainGuests >= maxGuests}
                                            onClick={() =>
                                                setGuestData((g) => {
                                                    if (g.adults + g.children >= maxGuests) return g;
                                                    return { ...g, adults: g.adults + 1 };
                                                })
                                            }
                                        >+</button>
                                    </div>
                                </div>

                                {/* Children */}
                                <div className="flex justify-between items-center py-2">
                                    <div>
                                        <p className="font-medium">Children</p>
                                        <p className="text-xs text-gray-500">Age 2–12</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            className="border rounded-full w-7 h-7 flex items-center justify-center"
                                            onClick={() =>
                                                setGuestData((g) => ({ ...g, children: Math.max(0, g.children - 1) }))
                                            }
                                        >−</button>

                                        <span>{guestData.children}</span>

                                        <button
                                            className="border rounded-full w-7 h-7 flex items-center justify-center disabled:opacity-40"
                                            disabled={totalMainGuests >= maxGuests}
                                            onClick={() =>
                                                setGuestData((g) => {
                                                    if (g.adults + g.children >= maxGuests) return g;
                                                    return { ...g, children: g.children + 1 };
                                                })
                                            }
                                        >+</button>
                                    </div>
                                </div>

                                {/* Infants */}
                                <div className="flex justify-between items-center py-2">
                                    <div>
                                        <p className="font-medium">Infants</p>
                                        <p className="text-xs text-gray-500">Under 2</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            className="border rounded-full w-7 h-7 flex items-center justify-center"
                                            onClick={() =>
                                                setGuestData((g) => ({ ...g, infants: Math.max(0, g.infants - 1) }))
                                            }
                                        >−</button>

                                        <span>{guestData.infants}</span>

                                        <button
                                            className="border rounded-full w-7 h-7 flex items-center justify-center"
                                            onClick={() =>
                                                setGuestData((g) => ({ ...g, infants: g.infants + 1 }))
                                            }
                                        >+</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* Contact */}
                <div className="border rounded-[0] p-5 mb-6">
                    <h3 className="font-semibold mb-3 text-lg">Contact number</h3>
                    <input
                        type="tel"
                        value={contact}
                        onChange={handleContactChange}
                        placeholder="Enter 10-digit mobile number"
                        className="border border-gray-300 rounded-[0] px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        We'll contact you on this number for booking confirmation.
                    </p>
                </div>

                <Button
                    onClick={handlePayment}
                    disabled={contact.length !== 10}
                    className="w-full bg-primary text-white rounded-[0] py-3 text-lg hover:bg-primary"
                >
                    Pay Now
                </Button>
            </div>

            {/* RIGHT SECTION */}
            <div>
                <div className="border rounded-[0] p-5 shadow-sm">
                    <div className="flex gap-3 mb-3">
                        <img
                            src={property.coverImage}
                            alt={property.propertyName}
                            className="w-24 h-24 object-cover rounded-[0]"
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
