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
    const [includeMeals, setIncludeMeals] = useState(false);

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


    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!property) return <div className="text-center py-20">Property not found.</div>;

    const startDate = dateRange[0].startDate;
    const endDate = dateRange[0].endDate;
    const nights =
        Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))) || 1;

    const weekday = Number(property.pricingPerNightWeekdays);
    const weekend = Number(property.pricingPerNightWeekend || weekday);

    const getNightBreakdown = () => {
        let d = new Date(startDate);
        const end = new Date(endDate);
        let weekdays = 0;
        let weekends = 0;

        while (d < end) {
            const day = d.getDay();
            if (day === 0 || day === 6) weekends++;
            else weekdays++;
            d.setDate(d.getDate() + 1);
        }

        return { weekdays, weekends };
    };
    const { weekdays, weekends } = getNightBreakdown();
    const weekdayTotal = weekdays * weekday;
    const weekendTotal = weekends * weekend;

    const calcBasePrice = () => {
        let d = new Date(startDate);
        const end = new Date(endDate);
        let total = 0;

        while (d < end) {
            const day = d.getDay();
            const isWeekend = day === 0 || day === 6;
            total += isWeekend ? weekend : weekday;
            d.setDate(d.getDate() + 1);
        }

        return total;
    };

    const basePrice = calcBasePrice();

    const extraAdultCost = extraAdults * extraAdultCharge * nights;
    const extraChildCost = extraChildren * extraChildCharge * nights;

    const extraGuestPrice = extraAdultCost + extraChildCost;

    const subtotal = basePrice + extraGuestPrice;
    const tax = Math.round(subtotal * 0.10);
    const total = subtotal + tax;



    const handleContactChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length <= 10) setContact(value);
    };

    const handlePayment = async () => {
        if (contact.length !== 10) {
            toast.error("Enter a valid 10-digit mobile number");
            return;
        }

        if (includeMeals && totalMealsSelected !== totalGuests) {
            toast.error("Meal selection must match total guests");
            return;
        }

        try {
            const res = await Axios.post(
                SummaryApi.createBookingOrder.url,
                {
                    propertyId,
                    checkIn: startDate,
                    checkOut: endDate,
                    guests: guestData,
                    contactNumber: contact,
                    meals: includeMeals
                        ? mealCounts
                        : null,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

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
                    navigate("/thank-you", {
                        replace: true,
                        state: {
                            bookingId: booking._id,
                        },
                    });
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
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 px-4 py-10">
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
                            <div className="absolute pl-[42px] top-10 left-0 bg-white p-3 rounded-[12px] shadow-2xl border border-gray-100 z-50">
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
                            <span>{totalMainGuests} guests</span>
                        </div>

                        <button
                            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                            className="text-[#233b19] font-semibold hover:underline"
                        >
                            Edit
                        </button>

                        {showGuestDropdown && (
                            <div className="absolute right-0 top-8 bg-white border rounded-[10px] shadow-xl p-4 w-[55%] z-50">

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
                <div className="border rounded-[12px] p-5 mb-6">
                    <h3 className="font-semibold mb-3 text-lg">Meals</h3>

                    <label className="flex items-center gap-3 mb-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={includeMeals}
                            onChange={(e) => {
                                setIncludeMeals(e.target.checked);
                                if (!e.target.checked) {
                                    setMealCounts({ veg: 0, nonVeg: 0 });
                                }
                            }}
                        />
                        <span className="text-sm font-medium">Include Meals</span>
                    </label>

                    {includeMeals && (
                        <div className="space-y-4">

                            {/* Veg */}
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

                            {/* Non-Veg */}
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
                                Total meals selected: {totalMealsSelected} / {totalGuests}
                            </p>
                        </div>
                    )}
                </div>

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

                <Button
                    onClick={handlePayment}
                    disabled={contact.length !== 10}
                    className="w-full bg-primary text-white rounded-[10px] py-3 text-lg hover:bg-primary"
                >
                    Pay Now
                </Button>
            </div>

            {/* RIGHT SECTION */}
            <div>
                <div className="border rounded-[12px] mt-[120px] p-5 shadow-sm space-y-4">

                    {/* Property */}
                    <div className="flex gap-3">
                        <img
                            src={property.coverImage}
                            className="w-24 h-24 rounded-[8px] object-cover"
                        />
                        <div>
                            <h4 className="font-semibold">{property.propertyName}</h4>
                            <p className="text-sm text-gray-600">
                                {property.city}, {property.state}
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
                    <div className="text-sm space-y-2">
                        <p className="font-medium">Room charges</p>

                        {weekdays > 0 && (
                            <div className="flex justify-between">
                                <span>Weekdays ({weekdays} nights × ₹{weekday})</span>
                                <span>₹{weekdayTotal.toLocaleString()}</span>
                            </div>
                        )}

                        {weekends > 0 && (
                            <div className="flex justify-between">
                                <span>Weekend ({weekends} nights × ₹{weekend})</span>
                                <span>₹{weekendTotal.toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {/* Extra Guests */}
                    {(extraAdults > 0 || extraChildren > 0) && (
                        <>
                            <hr />
                            <div className="text-sm space-y-2">
                                <p className="font-medium">Extra guest charges</p>

                                {extraAdults > 0 && (
                                    <div className="flex justify-between">
                                        <span>Adults ({extraAdults} × ₹{extraAdultCharge} × {nights} nights)</span>
                                        <span>₹{extraAdultCost.toLocaleString()}</span>
                                    </div>
                                )}

                                {extraChildren > 0 && (
                                    <div className="flex justify-between">
                                        <span>Children ({extraChildren} × ₹{extraChildCharge} × {nights} nights)</span>
                                        <span>₹{extraChildCost.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Meals */}
                    {includeMeals && (
                        <>
                            <hr />
                            <div className="text-sm">
                                <p className="font-medium">Meals selected</p>
                                <p>Veg: {mealCounts.veg}</p>
                                <p>Non-veg: {mealCounts.nonVeg}</p>
                            </div>
                        </>
                    )}

                    <hr />

                    {/* Totals */}
                    <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Taxes (10%)</span>
                            <span>₹{tax.toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between font-semibold text-base border-t pt-2">
                            <span>Total payable</span>
                            <span>₹{total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
