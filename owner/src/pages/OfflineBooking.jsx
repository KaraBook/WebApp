import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DateRange } from "react-date-range";
import { format, eachDayOfInterval } from "date-fns";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import api from "../api/axios";
import SummaryApi from "@/common/SummaryApi";
import { getIndianStates, getCitiesByState } from "@/utils/locationUtils";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const normalize = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// 👉 IMPORTANT: LOCAL DATE STRING (no toISOString – avoids -1 day bug in IST)
const formatLocalDateString = (date) => {
  const d = new Date(date);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};

export default function OfflineBooking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [propertyId, setPropertyId] = useState(null);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [foodPreference, setFoodPreference] = useState("veg");

  const [disabledDays, setDisabledDays] = useState([]);
  const [guestCount, setGuestCount] = useState({
    adults: 1,
    children: 0,
  });
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const guestRef = useRef(null);

  const [price, setPrice] = useState({ weekday: 0, weekend: 0 });

  const [meals, setMeals] = useState({
    includeMeals: false,
    veg: 0,
    nonVeg: 0,
  });

  const [guestRules, setGuestRules] = useState({
    maxGuests: 0,
    baseGuests: 0,
    extraAdultCharge: 0,
    extraChildCharge: 0,
  });

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [allowForm, setAllowForm] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMsg, setPopupMsg] = useState("");

  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  const [traveller, setTraveller] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    dateOfBirth: "",
    address: "",
    pinCode: "",
    state: "",
    city: "",
  });

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      key: "selection",
    },
  ]);


  const getNights = () => {
    const start = normalize(dateRange[0].startDate);
    const end = normalize(dateRange[0].endDate);
    if (!start || !end || end <= start) return 0;

    const diffMs = end - start;
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    let total = 0;
    let d = normalize(dateRange[0].startDate);
    const end = normalize(dateRange[0].endDate);

    while (d < end) {
      const day = d.getDay();
      const isWeekend = day === 0 || day === 6;

      total += isWeekend ? Number(price.weekend) : Number(price.weekday);
      d.setDate(d.getDate() + 1);
    }

    return total;
  };



  // ---------- EFFECTS ----------

  useEffect(() => {
    setStates(getIndianStates());
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (guestRef.current && !guestRef.current.contains(e.target)) {
        setShowGuestDropdown(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!id || id.length < 10) {
      toast.error("Invalid property.");
      return;
    }
    setPropertyId(id);
  }, [id]);

  useEffect(() => {
    if (!propertyId) return;

    const loadData = async () => {
      try {
        const propRes = await api.get(
          SummaryApi.getSingleProperty(propertyId).url
        );

        const prop = propRes.data.data;
        if (prop) {
          setPrice({
            weekday: Number(prop.pricingPerNightWeekdays || 0),
            weekend: Number(prop.pricingPerNightWeekend || 0),
          });

          setGuestRules({
            maxGuests: Number(prop.maxGuests || 0),
            baseGuests: Number(prop.baseGuests || 0),
            extraAdultCharge: Number(prop.extraAdultCharge || 0),
            extraChildCharge: Number(prop.extraChildCharge || 0),
          });
        }

        const blockedRes = await api.get(
          SummaryApi.getPropertyBlockedDates.url(propertyId)
        );
        const blocked = blockedRes.data?.dates || [];

        const bookedRes = await api.get(
          SummaryApi.getBookedDates.url(propertyId)
        );
        const booked = bookedRes.data?.dates || [];

        let fullList = [];

        [...blocked, ...booked].forEach((range) => {
          const start = new Date(range.start || range.startDate);
          const end = new Date(range.end || range.endDate || range.start);

          start.setHours(0, 0, 0, 0);
          end.setHours(0, 0, 0, 0);

          fullList.push(...eachDayOfInterval({ start, end }));
        });

        setDisabledDays(fullList);
      } catch (err) {
        console.log("Property Load Error:", err?.response?.data || err);
        toast.error("Failed to load property data");
      }
    };

    loadData();
  }, [propertyId]);

  useEffect(() => {
    const close = (e) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target) &&
        !e.target.closest(".date-input")
      ) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // ---------- DATE HANDLING ----------

  const isDateDisabled = (date) => {
    return disabledDays.some(
      (d) => d.toDateString() === new Date(date).toDateString()
    );
  };

  const handleDateSelection = (item) => {
    const { startDate, endDate } = item.selection;
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    for (const day of days) {
      if (isDateDisabled(day)) {
        toast.error("Selected dates include unavailable days.");
        return;
      }
    }

    setDateRange([
      {
        startDate,
        endDate,
        key: "selection",
      },
    ]);
  };

  // ---------- FORM HANDLERS ----------

  const handleChange = (key, val) => {
    setTraveller((prev) => ({ ...prev, [key]: val }));
  };

  const verifyMobile = async () => {
    if (traveller.mobile.length !== 10) {
      return toast.error("Invalid mobile number");
    }

    try {
      const ownerCheck = await api.post(SummaryApi.checkOwnerByMobile.url, {
        mobile: traveller.mobile,
      });

      if (ownerCheck.data.exists) {
        setAllowForm(false);
        setPopupTitle("Not Allowed");
        setPopupMsg("This mobile belongs to a property owner.");
        setShowPopup(true);
        return;
      }
    } catch {
      // ignore owner check failure
    }

    setChecking(true);

    try {
      const res = await api.post(SummaryApi.checkTravellerByMobile.url, {
        mobile: traveller.mobile,
      });

      setAllowForm(true);

      if (res.data.exists) {
        const t = res.data.traveller;

        const st = states.find((s) => s.name === t.state);
        const iso = st?.isoCode || "";

        setCities(iso ? getCitiesByState(iso) : []);
        setSelectedStateCode(iso);

        setTraveller({
          firstName: t.firstName,
          lastName: t.lastName,
          email: t.email,
          mobile: t.mobile,
          dateOfBirth: t.dateOfBirth?.substring(0, 10),
          address: t.address,
          pinCode: t.pinCode,
          state: t.state,
          city: t.city,
        });

        setPopupTitle("Traveller Found");
        setPopupMsg("Traveller details auto-filled.");
      } else {
        setTraveller((p) => ({
          ...p,
          firstName: "",
          lastName: "",
          email: "",
          address: "",
          state: "",
          city: "",
        }));

        setCities([]);
        setSelectedStateCode("");

        setPopupTitle("New Traveller");
        setPopupMsg("Please fill traveller details.");
      }

      setShowPopup(true);
    } finally {
      setChecking(false);
    }
  };

  const handleStateChange = (code) => {
    setSelectedStateCode(code);

    const st = states.find((s) => s.isoCode === code);

    setTraveller((p) => ({
      ...p,
      state: st?.name || "",
      city: "",
    }));

    setCities(getCitiesByState(code));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };


  const updateGuests = (type, delta) => {
    setGuestCount((g) => {
      const next = { ...g, [type]: g[type] + delta };
      if (next.adults < 1) next.adults = 1;
      if (next.children < 0) next.children = 0;
      const total = next.adults + next.children;
      if (guestRules.maxGuests && total > guestRules.maxGuests) {
        toast.error(`Maximum ${guestRules.maxGuests} guests allowed`);
        return g;
      }
      return next;
    });
  };


  const updateMeals = (type, delta) => {
    setMeals((m) => {
      const next = { ...m, [type]: m[type] + delta };
      if (next[type] < 0) next[type] = 0;
      const totalMeals = next.veg + next.nonVeg;
      const totalGuests = guestCount.adults + guestCount.children;
      if (totalMeals > totalGuests) {
        toast.error(`Meals cannot exceed ${totalGuests} guests`);
        return m;
      }
      return next;
    });
  };

  const handleBooking = async () => {
    if (!allowForm) return toast.error("Please verify mobile first");

    const required = [
      "firstName",
      "lastName",
      "email",
      "mobile",
      "dateOfBirth",
      "address",
      "pinCode",
      "state",
      "city",
    ];

    for (const f of required) {
      if (!traveller[f]) {
        return toast.error("Please fill all required fields");
      }
    }

    const nights = getNights();
    if (nights <= 0) {
      return toast.error("Please select a valid date range");
    }

    const totalAmount = calculateTotal();
    if (totalAmount <= 0) return toast.error("Invalid booking amount");

    const checkIn = dateRange[0].startDate;
    const checkOut = dateRange[0].endDate;

    // LOCAL YYYY-MM-DD (no timezone shift)
    const checkInStr = formatLocalDateString(checkIn);
    const checkOutStr = formatLocalDateString(checkOut);

    // Debug log – mirrors backend computation context
    console.log("📘 OFFLINE BOOKING DEBUG", {
      rawStart: checkIn,
      rawEnd: checkOut,
      checkInStr,
      checkOutStr,
      nights,
      price,
      totalAmount,
    });

    setLoading(true);

    try {
      // 1) Create offline booking (server will recompute and validate price)
      const res = await api.post(SummaryApi.ownerOfflineBooking.url, {
        traveller,
        propertyId,
        checkIn: checkInStr,
        checkOut: checkOutStr,
        guests: {
          adults: guestCount.adults,
          children: guestCount.children,
        },
        meals,
      });

      const bId = res.data.booking._id;

      // 2) Create Razorpay order
      const orderRes = await api.post(SummaryApi.ownerCreateOrder.url, {
        bookingId: bId,
        amount: totalAmount,
      });

      const { order } = orderRes.data;

      const load = await loadRazorpayScript();
      if (!load) {
        toast.error("Razorpay failed to load");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Booking Payment",
        description: "Offline Booking Payment",
        order_id: order.id,
        handler: async function (response) {
          try {
            await api.post(SummaryApi.ownerVerifyPayment.url, {
              bookingId: bId,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            toast.success("Payment successful!");
            navigate("/bookings");
          } catch {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: traveller.firstName + " " + traveller.lastName,
          email: traveller.email,
          contact: traveller.mobile,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.log("Booking Error:", err.response?.data || err);
      toast.error(
        err.response?.data?.message || "Failed to create booking"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- RENDER ----------

  return (
    <div className="bg-[#f5f5f7] min-h-[100dvh] md:px-8 md:py-6 px-2 py-4">
      <div className="max-w-6xl p-2 mx-auto">
        <h1 className="text-[26px] font-bold text-gray-900 flex items-center gap-3 mb-2">Create Offline Booking</h1>

        {!propertyId ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT: Traveller */}
            <Card>
              <CardHeader>
                <CardTitle>Traveller Details</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Mobile */}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label>Mobile</Label>
                    <Input
                      value={traveller.mobile}
                      onChange={(e) =>
                        handleChange("mobile", e.target.value.replace(/\D/g, ""))
                      }
                      maxLength={10}
                      placeholder="10-digit number"
                      className="mt-1"
                    />
                  </div>

                  <Button
                    onClick={verifyMobile}
                    disabled={checking || traveller.mobile.length !== 10}
                    className="bg-primary text-white"
                  >
                    {checking ? "Checking..." : "Verify"}
                  </Button>
                </div>

                {/* Show form only after mobile verified */}
                {allowForm && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>First Name</Label>
                        <Input
                          value={traveller.firstName}
                          onChange={(e) =>
                            handleChange("firstName", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input
                          value={traveller.lastName}
                          onChange={(e) =>
                            handleChange("lastName", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Email</Label>
                      <Input
                        value={traveller.email}
                        onChange={(e) =>
                          handleChange("email", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Date of Birth</Label>
                        <Input
                          type="date"
                          value={traveller.dateOfBirth}
                          onChange={(e) =>
                            handleChange("dateOfBirth", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Pin Code</Label>
                        <Input
                          value={traveller.pinCode}
                          onChange={(e) =>
                            handleChange(
                              "pinCode",
                              e.target.value.replace(/\D/g, "")
                            )
                          }
                          maxLength={6}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Address</Label>
                      <Input
                        value={traveller.address}
                        onChange={(e) =>
                          handleChange("address", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>State</Label>
                        <Select
                          value={selectedStateCode}
                          onValueChange={handleStateChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select State" />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((s) => (
                              <SelectItem key={s.isoCode} value={s.isoCode}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>City</Label>
                        <Select
                          value={traveller.city}
                          onValueChange={(v) => handleChange("city", v)}
                          disabled={!cities.length}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                cities.length
                                  ? "Select City"
                                  : "Select State first"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((c) => (
                              <SelectItem key={c.name} value={c.name}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* RIGHT: Booking */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Dates */}
                <div className="relative">
                  <Label>Dates</Label>
                  <div
                    className="border rounded-lg p-2 cursor-pointer mt-1 date-input"
                    onClick={() => setShowCalendar(true)}
                  >
                    {format(dateRange[0].startDate, "dd MMM")} –{" "}
                    {format(dateRange[0].endDate, "dd MMM")}
                  </div>

                  {showCalendar && (
                    <div
                      ref={calendarRef}
                      className="
      mt-2 bg-white border border-gray-200 rounded-2xl p-0
      max-h-[70vh] overflow-y-auto
      md:absolute md:shadow-xl md:z-50
    "
                    >
                      <DateRange
                        ranges={dateRange}
                        onChange={handleDateSelection}
                        minDate={new Date()}
                        disabledDates={disabledDays}
                        moveRangeOnFirstSelection={false}
                        showSelectionPreview={false}
                        showDateDisplay={false}
                        months={1}
                        direction="horizontal"
                        rangeColors={["#0097A7"]}
                      />
                    </div>
                  )}
                </div>

                {/* Guests */}
                <div className="relative" ref={guestRef}>
                  <Label>Guests</Label>

                  {/* Collapsed Box */}
                  <div
                    className="border rounded-lg p-2 cursor-pointer mt-1 bg-white"
                    onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                  >
                    {guestCount.adults + guestCount.children} guests
                  </div>

                  {/* Dropdown */}
                  {showGuestDropdown && (
                    <div className="absolute w-full bg-white shadow-xl border rounded-xl mt-2 z-50 p-4 space-y-4">
                      {/* Adults */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Adults</p>
                          <p className="text-xs text-gray-500">Age 13+</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateGuests("adults", -1)}
                          >
                            -
                          </Button>

                          <span className="w-6 text-center">
                            {guestCount.adults}
                          </span>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateGuests("adults", +1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Children</p>
                          <p className="text-xs text-gray-500">Age 2–12</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateGuests("children", -1)}
                          >
                            -
                          </Button>

                          <span className="w-6 text-center">
                            {guestCount.children}
                          </span>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateGuests("children", +1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                <Card className="border border-gray-200">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-base">Meals</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Include Meals */}
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={meals.includeMeals}
                        onChange={(e) =>
                          setMeals((m) => ({ ...m, includeMeals: e.target.checked }))
                        }
                      />
                      Include Meals
                    </label>

                    {meals.includeMeals && (
                      <>
                        {/* Veg */}
                        <div className="flex items-center justify-between">
                          <span>Veg Guests</span>
                          <div className="flex items-center gap-3">
                            <Button size="sm" variant="outline" onClick={() => updateMeals("veg", -1)}>
                              -
                            </Button>
                            <span>{meals.veg}</span>
                            <Button size="sm" variant="outline" onClick={() => updateMeals("veg", +1)}>
                              +
                            </Button>
                          </div>
                        </div>

                        {/* Non Veg */}
                        <div className="flex items-center justify-between">
                          <span>Non-Veg Guests</span>
                          <div className="flex items-center gap-3">
                            <Button size="sm" variant="outline" onClick={() => updateMeals("nonVeg", -1)}>
                              -
                            </Button>
                            <span>{meals.nonVeg}</span>
                            <Button size="sm" variant="outline" onClick={() => updateMeals("nonVeg", +1)}>
                              +
                            </Button>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500">
                          Total meals selected: {meals.veg + meals.nonVeg} /{" "}
                          {guestCount.adults + guestCount.children}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Total */}
                <div>
                  <Label>Total Price</Label>
                  <div className="border rounded-lg p-2 mt-1 bg-gray-50">
                    ₹{calculateTotal().toLocaleString()}
                  </div>
                </div>

                {guestRules.baseGuests > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Includes {guestRules.baseGuests} guests.
                    Extra adult ₹{guestRules.extraAdultCharge}/night,
                    extra child ₹{guestRules.extraChildCharge}/night.
                  </p>
                )}

                <Button
                  className="w-full bg-primary text-white py-3"
                  disabled={loading}
                  onClick={handleBooking}
                >
                  {loading ? "Creating..." : "Proceed to Payment"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Popup */}
        <Dialog open={showPopup} onOpenChange={setShowPopup}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{popupTitle}</DialogTitle>
              <DialogDescription>{popupMsg}</DialogDescription>
            </DialogHeader>
            <Button onClick={() => setShowPopup(false)} className="mt-4">
              Close
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
