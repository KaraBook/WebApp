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
import { useAuth } from "../auth/AuthContext";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function OfflineBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const propertyId = id;
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedStateCode, setSelectedStateCode] = useState("");

  const [disabledDays, setDisabledDays] = useState([]);
  const [guestCount, setGuestCount] = useState(1);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [allowForm, setAllowForm] = useState(false);

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

  const nights = Math.max(
    1,
    Math.ceil(
      (dateRange[0].endDate - dateRange[0].startDate) /
        (1000 * 60 * 60 * 24)
    )
  );

  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMsg, setPopupMsg] = useState("");

  // Load states
  useEffect(() => {
    setStates(getIndianStates());
  }, []);

  // Fetch blocked + booked dates
  useEffect(() => {
    if (!propertyId) return;

    const loadDates = async () => {
      try {
        const blockedRes = await api.get(
          SummaryApi.getPropertyBlockedDates.url(propertyId)
        );
        const bookedRes = await api.get(
          SummaryApi.getBookedDates.url(propertyId)
        );

        const blocked = blockedRes.data.dates || [];
        const booked = bookedRes.data.dates || [];

        const merged = [];

        [...blocked, ...booked].forEach((r) => {
          const s = new Date(r.start);
          const e = new Date(r.end);
          s.setHours(0, 0, 0, 0);
          e.setHours(0, 0, 0, 0);
          const days = eachDayOfInterval({ start: s, end: e });
          merged.push(...days);
        });

        setDisabledDays(merged);
      } catch (error) {
        toast.error("Failed to load dates");
      }
    };

    loadDates();
  }, [propertyId]);

  const isDateDisabled = (date) => {
    return disabledDays.some((d) => d.toDateString() === date.toDateString());
  };

  const handleDateSelection = (item) => {
    const { startDate, endDate } = item.selection;
    let d = new Date(startDate);

    while (d <= endDate) {
      if (isDateDisabled(d)) {
        toast.error("This range contains blocked/unavailable dates");
        return;
      }
      d.setDate(d.getDate() + 1);
    }
    setDateRange([item.selection]);
  };

  // click outside → close calendar
  useEffect(() => {
    const handler = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (key, val) => {
    setTraveller((prev) => ({ ...prev, [key]: val }));
  };

  // Verify mobile → load traveller data
  const verifyMobile = async () => {
    if (traveller.mobile.length !== 10)
      return toast.error("Invalid mobile number");

    try {
      setChecking(true);

      // Owner check
      const ownerCheck = await api.post(
        SummaryApi.checkOwnerByMobile.url,
        { mobile: traveller.mobile }
      );

      if (ownerCheck.data.exists) {
        setAllowForm(false);
        setPopupTitle("Not Allowed");
        setPopupMsg("This number belongs to a Resort Owner.");
        setShowPopup(true);
        return;
      }

      // Traveller check
      const t = await api.post(SummaryApi.checkTravellerByMobile.url, {
        mobile: traveller.mobile,
      });

      setAllowForm(true);

      if (t.data.exists) {
        const data = t.data.traveller;
        const st = states.find((s) => s.name === data.state);

        if (st) {
          setSelectedStateCode(st.isoCode);
          setCities(getCitiesByState(st.isoCode));
        }

        setTraveller({
          ...data,
          dateOfBirth: data.dateOfBirth?.substring(0, 10),
        });

        setPopupTitle("Traveller Found");
        setPopupMsg("Details auto-filled.");
      } else {
        setTraveller((p) => ({
          ...p,
          firstName: "",
          lastName: "",
          email: "",
          address: "",
          city: "",
          state: "",
          pinCode: "",
        }));

        setPopupTitle("New Traveller");
        setPopupMsg("Enter details manually.");
      }

      setShowPopup(true);
    } finally {
      setChecking(false);
    }
  };

  const handleStateChange = (iso) => {
    const st = states.find((s) => s.isoCode === iso);
    setSelectedStateCode(iso);
    setCities(getCitiesByState(iso));
    setTraveller((p) => ({ ...p, state: st.name, city: "" }));
  };

  // Razorpay script loader
  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  // ---- MAIN BOOKING FLOW ----
  const handleBooking = async () => {
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

    for (const k of required) {
      if (!traveller[k]) return toast.error("Fill all fields");
    }

    if (!price) return toast.error("Enter price");

    const totalAmount = nights * Number(price);
    const { startDate, endDate } = dateRange[0];

    setLoading(true);

    try {
      // 1️⃣ Create booking
      const b = await api.post(SummaryApi.ownerOfflineBooking.url, {
        traveller,
        propertyId,
        checkIn: startDate,
        checkOut: endDate,
        guests: guestCount,
        totalAmount,
      });

      const bookingId = b.data.booking._id;

      // 2️⃣ Create Razorpay Order
      const o = await api.post(SummaryApi.ownerCreateOrder.url, {
        bookingId,
        amount: totalAmount,
      });

      const { order } = o.data;

      // 3️⃣ Load Razorpay
      const ok = await loadRazorpay();
      if (!ok) return toast.error("Razorpay SDK failed.");

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Offline Booking",
        handler: async function (response) {
          await api.post(SummaryApi.ownerVerifyPayment.url, {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            bookingId,
          });

          toast.success("Payment Successful!");
          navigate("/owner/bookings");
        },
        theme: { color: "#efcc61" },
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Booking or payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl p-2">
      <h1 className="text-2xl font-semibold mb-8">Create Offline Booking</h1>

      {/* ---- Grid ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Traveller */}
        <Card>
          <CardHeader>
            <CardTitle>Traveller Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Verify Mobile */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label>Mobile</Label>
                <Input
                  maxLength={10}
                  value={traveller.mobile}
                  onChange={(e) =>
                    handleChange("mobile", e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>
              <Button
                onClick={verifyMobile}
                disabled={checking || traveller.mobile.length !== 10}
              >
                {checking ? "Checking..." : "Verify"}
              </Button>
            </div>

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
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={traveller.lastName}
                      onChange={(e) =>
                        handleChange("lastName", e.target.value)
                      }
                    />
                  </div>
                </div>

                <Label>Email</Label>
                <Input
                  type="email"
                  value={traveller.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>DOB</Label>
                    <Input
                      type="date"
                      value={traveller.dateOfBirth}
                      onChange={(e) =>
                        handleChange("dateOfBirth", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label>Pin Code</Label>
                    <Input
                      maxLength={6}
                      value={traveller.pinCode}
                      onChange={(e) =>
                        handleChange(
                          "pinCode",
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                    />
                  </div>
                </div>

                <Label>Address</Label>
                <Input
                  value={traveller.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />

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
                          <SelectItem
                            key={s.isoCode}
                            value={s.isoCode}
                          >
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
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select City" />
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

        {/* Right: Booking */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative">
              <Label>Dates</Label>

              <div
                className="border p-2 rounded cursor-pointer mt-1"
                onClick={() => setShowCalendar(true)}
              >
                {format(dateRange[0].startDate, "dd MMM")} –{" "}
                {format(dateRange[0].endDate, "dd MMM")} ({nights} nights)
              </div>

              {showCalendar && (
                <div
                  ref={calendarRef}
                  className="absolute bg-white border rounded shadow-xl z-50 mt-2"
                >
                  <DateRange
                    ranges={dateRange}
                    onChange={handleDateSelection}
                    disabledDates={disabledDays}
                    moveRangeOnFirstSelection={false}
                    minDate={new Date()}
                    rangeColors={["#efcc61"]}
                  />
                </div>
              )}
            </div>

            <Label>Guests</Label>
            <Input
              type="number"
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              min={1}
            />

            <Label>Price Per Night (₹)</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            {price && (
              <p>
                Total:{" "}
                <strong>
                  ₹{(Number(price) * nights).toLocaleString()}
                </strong>
              </p>
            )}

            <Button
              className="w-full bg-[#efcc61] hover:bg-[#e6c04f]"
              disabled={loading}
              onClick={handleBooking}
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Popup */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{popupTitle}</DialogTitle>
            <DialogDescription>{popupMsg}</DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowPopup(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
