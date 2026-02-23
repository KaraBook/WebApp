import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Axios from "../utils/Axios";
import { toast } from "sonner";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import SummaryApi from "../common/SummaryApi";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import { ArrowLeft } from "lucide-react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { State } from "country-state-city";

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    return isMobile;
}


const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);

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
    const isMobile = useIsMobile();
    const [pricing, setPricing] = useState(null);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [verifyingPayment, setVerifyingPayment] = useState(false);
    const [openingRazorpay, setOpeningRazorpay] = useState(false);
    const showFullLoader = creatingOrder || verifyingPayment;

    const hasFood =
        Array.isArray(property?.foodAvailability) &&
        property.foodAvailability.length > 0;

    const [mealCounts, setMealCounts] = useState({
        veg: 0,
        nonVeg: 0,
    });

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
        guests || { adults: 1, children: 0, }
    );

    const maxGuests = property?.maxGuests || 1;
    const baseGuests = property?.baseGuests || 0;
    const extraAdultCharge = property?.extraAdultCharge || 0;
    const extraChildCharge = property?.extraChildCharge || 0;

    const totalMainGuests = guestData.adults + guestData.children;
    const totalGuests = guestData.adults + guestData.children;
    const totalMealsSelected =
        mealCounts.veg + mealCounts.nonVeg;

    const extraAdults = Math.max(0, guestData.adults - baseGuests);
    const remainingBaseAfterAdults = Math.max(0, baseGuests - guestData.adults);
    const extraChildren = Math.max(
        0,
        guestData.children - remainingBaseAfterAdults
    );

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

    useEffect(() => {
        const handleClickOutsideGuests = (e) => {
            if (
                guestRef.current &&
                !guestRef.current.contains(e.target)
            ) {
                setShowGuestDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutsideGuests);

        return () => {
            document.removeEventListener("mousedown", handleClickOutsideGuests);
        };
    }, []);

    const startDate = dateRange[0].startDate;
    const endDate = dateRange[0].endDate;

    useEffect(() => {
        if (!property || !startDate || !endDate) return;

        const toLocalYMD = (date) => {
            const d = new Date(date);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${y}-${m}-${day}`;
        };
        const fetchPricing = async () => {
            try {
                const res = await Axios.post(
                    SummaryApi.previewPricing.url,
                    {
                        propertyId,
                        checkIn: toLocalYMD(startDate),
                        checkOut: toLocalYMD(endDate),
                        guests: guestData,
                        meals: mealCounts,
                    }
                );

                setPricing(res.data.pricing);
            } catch (err) {
                console.error("Pricing error:", err);
                setPricing(null);
            }
        };


        fetchPricing();
    }, [property, startDate, endDate, guestData, mealCounts]);


    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!property) return <div className="text-center py-20">Property not found.</div>;

    const handleContactChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length <= 10) setContact(value);
    };

    const handlePayment = async () => {
        if (creatingOrder || openingRazorpay || verifyingPayment) return;
        if (contact.length !== 10) {
            toast.error("Enter a valid 10-digit mobile number");
            return;
        }

        if (totalMealsSelected > totalGuests) {
            toast.error("Meal count cannot exceed total guests");
            return;
        }

        try {
            setCreatingOrder(false);

            const loaded = await loadRazorpayScript();
            if (!loaded) {
                return toast.error("Razorpay SDK failed to load");
            }

            setOpeningRazorpay(true);

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Villa Booking",
                description: "Confirm & Pay",
                order_id: order.id,

                handler: async (response) => {
                    try {
                        setOpeningRazorpay(false);
                        setVerifyingPayment(true);

                        const verifyRes = await Axios.post(
                            SummaryApi.verifyBookingPayment.url,
                            response,
                            { timeout: 20000 }
                        );

                        const bookingId =
                            verifyRes.data?.bookingId ||
                            verifyRes.data?.data?.bookingId ||
                            verifyRes.data?.booking?._id;

                        if (!bookingId) {
                            throw new Error("bookingId missing");
                        }

                        toast.success("Payment successful!");
                        setVerifyingPayment(false);
                        navigate(`/thank-you/${bookingId}`, { replace: true });

                    } catch (err) {
                        setVerifyingPayment(false);
                        toast.error("Payment verification failed");
                    }
                },

                modal: {
                    ondismiss: function () {
                        setOpeningRazorpay(false);
                        setCreatingOrder(false);
                        setVerifyingPayment(false);
                        toast.info("Payment cancelled");
                    },
                },

                theme: { color: "#efcc61" },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            setCreatingOrder(false);
            setVerifyingPayment(false);

            console.error(err);
            toast.error(
                err.response?.data?.message || "Unable to create payment"
            );
        }
    };


    function MealCounter({ label, value, onChange, max }) {
        return (
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{label}</span>

                <div className="flex items-center gap-3">
                    <button
                        className="border rounded-full w-7 h-7"
                        onClick={() => onChange(Math.max(0, value - 1))}
                    >
                        −
                    </button>

                    <span>{value}</span>

                    <button
                        className="border rounded-full w-7 h-7 disabled:opacity-40"
                        disabled={value >= max}
                        onClick={() => onChange(value + 1)}
                    >
                        +
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 md:gap-10 px-4 py-10 pb-28 md:pb-10">
            {showFullLoader && (
                <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>

                        <p className="text-sm font-medium text-gray-700">
                            {creatingOrder && "Preparing your booking..."}
                            {openingRazorpay && "Opening secure payment..."}
                            {verifyingPayment && "Confirming your payment..."}
                        </p>
                    </div>
                </div>
            )}

            {/* LEFT SECTION */}
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 mb-4 rounded-[8px] text-sm font-medium text-gray-600 bg-gray-200 px-3 py-3 hover:text-black transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <h2 className="text-2xl font-bold mb-6">Confirm and pay</h2>

                {/* Trip Summary */}
                <div className="border rounded-[12px] p-5 mb-6">
                    <h3 className="font-semibold mb-2 text-lg">Your trip</h3>

                    {/* DATE PICKER */}
                    <div className="flex justify-between text-sm mb-3 relative" ref={calendarRef}>
                        <div>
                            <span className="block text-gray-700 font-medium">Dates</span>
                            <span className="text-[15px] font-bold">
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
                            <div
                                className={`absolute top-10 z-50 bg-white p-3 rounded-[12px] shadow-2xl border border-gray-100 flex items-center justify-center
                                 ${isMobile
                                        ? "left-1/2 -translate-x-1/2 w-[95vw]"
                                        : "left-0"}
                                `}>
                                <DateRange
                                    ranges={dateRange}
                                    months={isMobile ? 1 : 2}
                                    direction="horizontal"
                                    showDateDisplay={false}
                                    moveRangeOnFirstSelection={false}
                                    rangeColors={["#04929f"]}
                                    minDate={tomorrow}
                                    dayContentRenderer={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);

                                        const isPast = date < today;
                                        const isBlocked = isDateDisabled(date);
                                        const disabled = isPast || isBlocked;

                                        const startDate = dateRange[0].startDate;
                                        const endDate = dateRange[0].endDate;

                                        const isSelected =
                                            startDate &&
                                            endDate &&
                                            date >= startDate &&
                                            date <= endDate;

                                        const isStart =
                                            startDate &&
                                            date.toDateString() === startDate.toDateString();

                                        const isEnd =
                                            endDate &&
                                            date.toDateString() === endDate.toDateString();

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
        transition-all

        ${disabled
                                                        ? "bg-[#1297a317] text-gray-400 cursor-not-allowed"
                                                        : ""}

        ${isStart || isEnd
                                                        ? "bg-primary text-white font-semibold"
                                                        : ""}

        ${isSelected && !isStart && !isEnd
                                                        ? "text-black"
                                                        : ""}

        ${!disabled && !isSelected
                                                        ? "hover:bg-primary hover:text-white cursor-pointer"
                                                        : ""}
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


                    {/* GUESTS DROPDOWN */}
                    <div className="flex justify-between text-sm items-center relative" ref={guestRef}>
                        <div>
                            <span className="block text-gray-700 font-medium">Guests</span>
                            <span className="text-[15px] font-bold">{totalMainGuests} guests</span>
                        </div>

                        <button
                            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                            className="text-[#233b19] font-semibold hover:underline"
                        >
                            Edit
                        </button>

                        {showGuestDropdown && (
                            <div className="absolute right-0 top-8 bg-white border rounded-[10px] shadow-xl p-4 w-[75%] md:w-[55%] z-50">

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

                            </div>
                        )}
                    </div>

                </div>

                {/* MEALS */}
                {hasFood && (
                    <div className="border rounded-[12px] p-5 mb-6">
                        <h3 className="font-semibold mb-1 text-lg">Meals</h3>

                        <div className="bg-green-50 border border-green-200 rounded-[8px] px-3 py-2 mb-4">
                            <p className="text-sm font-medium text-green-700">
                                🍳 Breakfast is complimentary
                            </p>
                        </div>

                        {(property.foodAvailability.includes("lunch") ||
                            property.foodAvailability.includes("dinner")) && (
                                <div className="space-y-4">

                                    <p className="text-xs text-gray-500">
                                        Add meals (optional)
                                    </p>

                                    <MealCounter
                                        label="Veg Guests"
                                        value={mealCounts.veg}
                                        onChange={(val) =>
                                            setMealCounts((prev) => ({
                                                ...prev,
                                                veg: val,
                                            }))
                                        }
                                        max={totalGuests - mealCounts.nonVeg}
                                    />

                                    <MealCounter
                                        label="Non-Veg Guests"
                                        value={mealCounts.nonVeg}
                                        onChange={(val) =>
                                            setMealCounts((prev) => ({
                                                ...prev,
                                                nonVeg: val,
                                            }))
                                        }
                                        max={totalGuests - mealCounts.veg}
                                    />

                                    <p className="text-xs text-gray-500">
                                        You can add meals for up to {totalGuests} guests
                                    </p>
                                </div>
                            )}
                    </div>
                )}


                {/* Contact */}
                <div className="border rounded-[12px] p-5 mb-6">
                    <h3 className="font-semibold mb-3 text-lg">Contact number</h3>
                    <input
                        type="tel"
                        value={contact}
                        onChange={handleContactChange}
                        placeholder="Enter 10-digit mobile number"
                        className="border border-gray-300 rounded-[10px] px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        We'll contact you on this number for booking confirmation.
                    </p>
                </div>

                <div className="hidden md:block">
                    <Button
                        onClick={handlePayment}
                        disabled={
                            !pricing ||
                            contact.length !== 10 ||
                            creatingOrder ||
                            openingRazorpay ||
                            verifyingPayment
                        }
                        className="w-full bg-primary text-white rounded-[10px] py-6 text-lg hover:bg-primary"
                    >
                        {creatingOrder
                            ? "Preparing payment..."
                            : openingRazorpay
                                ? "Opening payment gateway..."
                                : verifyingPayment
                                    ? "Confirming payment..."
                                    : "Pay Now"}
                    </Button>
                </div>
            </div>

            {/* RIGHT SECTION */}
            <div>
                <div className="border rounded-[12px] mt-[0px] md:mt-[120px] p-5 shadow-sm space-y-4">

                    {/* Property */}
                    <div className="flex gap-3">
                        <img
                            src={property.coverImage}
                            className="w-24 h-24 rounded-[8px] object-cover"
                        />
                        <div>
                            <h4 className="font-semibold">{property.propertyName}</h4>
                            <p className="text-sm text-gray-600">
                                {property.city},{" "}
                                {
                                    State.getStateByCodeAndCountry(property.state, "IN")?.name
                                    || property.state
                                }
                            </p>
                        </div>
                    </div>

                    <hr />

                    {/* Guest Info */}
                    <div className="text-sm space-y-1">
                        <p>Base guests included: <b>{baseGuests}</b></p>
                        <p>Maximum guests allowed: <b>{maxGuests}</b></p>
                        <p>Total guests selected: <b>{totalGuests}</b></p>
                    </div>

                    <hr />

                    {/* Room Charges */}
                    {pricing && (
                        <div className="text-sm space-y-2">
                            <p className="font-medium">Room charges</p>

                            {pricing?.room.weekdayNights > 0 && (
                                <div className="flex justify-between">
                                    <span>
                                        Weekdays ({pricing.room.weekdayNights} nights × ₹{pricing.room.weekdayRate})
                                    </span>
                                    <span>₹{pricing?.room?.roomWeekdayAmount?.toLocaleString?.() ?? "0"}</span>
                                </div>
                            )}

                            {pricing?.room.weekendNights > 0 && (
                                <div className="flex justify-between">
                                    <span>
                                        Weekend ({pricing.room.weekendNights} nights × ₹{pricing.room.weekendRate})
                                    </span>
                                    <span>₹{pricing?.room?.roomWeekendAmount?.toLocaleString?.() ?? "0"}</span>
                                </div>
                            )}

                        </div>
                    )}

                    {/* Extra Guests */}
                    {(extraAdults > 0 || extraChildren > 0) && (
                        <>
                            <hr />
                            <div className="text-sm space-y-2">
                                <p className="font-medium">Extra guest charges</p>

                                {pricing?.extraGuests.extraAdults > 0 && (
                                    <div className="flex justify-between">
                                        <span>
                                            Adults ({pricing.extraGuests.extraAdults} × ₹{pricing.extraGuests.extraAdultRate} × {pricing.totalNights} nights)
                                        </span>
                                        <span>₹{pricing.extraGuests.extraAdultAmount.toLocaleString()}</span>
                                    </div>
                                )}

                                {pricing?.extraGuests.extraChildren > 0 && (
                                    <div className="flex justify-between">
                                        <span>
                                            Children ({pricing.extraGuests.extraChildren} × ₹{pricing.extraGuests.extraChildRate} × {pricing.totalNights} nights)
                                        </span>
                                        <span>₹{pricing.extraGuests.extraChildAmount.toLocaleString()}</span>
                                    </div>
                                )}

                            </div>
                        </>
                    )}

                    {/* Meals */}
                    {(mealCounts.veg > 0 || mealCounts.nonVeg > 0) && (
                        <>
                            <hr />
                            <div className="text-sm">
                                <p className="font-medium">Meals selected</p>
                                {pricing?.meals.veg > 0 && (
                                    <p>Veg: {pricing.meals.veg}</p>
                                )}

                                {pricing?.meals.nonVeg > 0 && (
                                    <p>Non-veg: {pricing.meals.nonVeg}</p>
                                )}
                            </div>
                        </>
                    )}

                    <hr />

                    {/* Totals */}
                    <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{pricing?.subtotal?.toLocaleString?.() ?? "0"}</span>
                        </div>

                        {pricing?.tax > 0 && (
                            <>
                                <div className="flex justify-between">
                                    <span>CGST (9%)</span>
                                    <span>₹{pricing?.cgst?.toLocaleString?.() ?? "0"}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>SGST (9%)</span>
                                    <span>₹{pricing?.sgst?.toLocaleString?.() ?? "0"}</span>
                                </div>
                            </>
                        )}

                        <div className="flex justify-between font-semibold">
                            <span>Total payable</span>
                            <span>₹{pricing?.grandTotal?.toLocaleString?.() ?? "0"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MOBILE STICKY PAY BAR */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow-lg z-[999] px-4 py-2 md:py-3">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs text-gray-500">Total payable</p>
                        <p className="text-lg font-bold">
                            ₹{pricing?.grandTotal?.toLocaleString?.() ?? "0"}
                        </p>
                    </div>

                    <Button
                        onClick={handlePayment}
                        disabled={
                            !pricing ||
                            contact.length !== 10 ||
                            creatingOrder ||
                            openingRazorpay ||
                            verifyingPayment
                        }
                        className="bg-primary text-white rounded-[10px] px-12 py-6 text-base"
                    >
                        <p className="text-sm font-medium text-gray-700">
                            {creatingOrder && "Preparing your booking..."}
                            {openingRazorpay && "Opening secure payment..."}
                            {verifyingPayment && "Confirming your payment..."}
                        </p>
                    </Button>
                </div>
            </div>

        </div>


    );
}
