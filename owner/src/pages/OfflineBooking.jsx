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

export default function OfflineBooking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [propertyId] = useState(id || "");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedStateCode, setSelectedStateCode] = useState("");

  const [disabledDays, setDisabledDays] = useState([]);
  const [guestCount, setGuestCount] = useState(1);

  const [price, setPrice] = useState({ weekday: 0, weekend: 0 });

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

  const nights = Math.max(
    1,
    Math.ceil(
      (dateRange[0].endDate - dateRange[0].startDate) / (1000 * 60 * 60 * 24)
    )
  );

  // Load States
  useEffect(() => {
    setStates(getIndianStates());
  }, []);

  // Load property details + blocked & booked dates
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
        }

        const blockedRes = await api.get(
          SummaryApi.getPropertyBlockedDates.url(propertyId)
        );
        const bookedRes = await api.get(
          SummaryApi.getBookedDates.url(propertyId)
        );

        const blocked = blockedRes.data.dates || [];
        const booked = bookedRes.data.dates || [];

        const fullList = [];

        [...blocked, ...booked].forEach((range) => {
          const start = new Date(range.start);
          const end = new Date(range.end);

          start.setHours(0, 0, 0, 0);
          end.setHours(0, 0, 0, 0);

          const days = eachDayOfInterval({ start, end });
          fullList.push(...days);
        });

        setDisabledDays(fullList);
      } catch {
        toast.error("Failed to load property data");
      }
    };

    loadData();
  }, [propertyId]);

  const isDateDisabled = (date) =>
    disabledDays.some(
      (d) => d.toDateString() === new Date(date).toDateString()
    );

  // Safe selection handler
  const handleDateSelection = (item) => {
    const { startDate, endDate } = item.selection;

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    if (days.some((d) => isDateDisabled(d))) {
      toast.error("Selected range contains unavailable dates.");
      return;
    }

    setDateRange([item.selection]);
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const close = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleChange = (key, val) => {
    setTraveller((prev) => ({ ...prev, [key]: val }));
  };

  const verifyMobile = async () => {
    if (traveller.mobile.length !== 10)
      return toast.error("Invalid mobile number");

    try {
      const ownerCheck = await api.post(SummaryApi.checkOwnerByMobile.url, {
        mobile: traveller.mobile,
      });

      if (ownerCheck.data.exists) {
        setAllowForm(false);
        setPopupTitle("Not Allowed");
        setPopupMsg(
          "This mobile belongs to a Resort Owner and cannot be used."
        );
        setShowPopup(true);
        return;
      }
    } catch {}

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
        setPopupMsg("Enter traveller details manually.");
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

  const calculateTotal = () => {
    let total = 0;

    let d = new Date(dateRange[0].startDate);
    const end = new Date(dateRange[0].endDate);

    while (d < end) {
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      total += isWeekend ? price.weekend : price.weekday;
      d.setDate(d.getDate() + 1);
    }

    return total;
  };

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

    for (const f of required) {
      if (!traveller[f]) return toast.error("Fill all required fields");
    }

    const totalAmount = calculateTotal();
    if (totalAmount <= 0) return toast.error("Invalid total amount");

    setLoading(true);

    try {
      const res = await api.post(SummaryApi.ownerOfflineBooking.url, {
        traveller,
        propertyId,
        checkIn: dateRange[0].startDate,
        checkOut: dateRange[0].endDate,
        guests: guestCount,
        nights,
        totalAmount,
      });

      const bId = res.data.booking._id;

      toast.success("Booking created! Opening payment...");

      const orderRes = await api.post(SummaryApi.ownerCreateOrder.url, {
        bookingId: bId,
        amount: totalAmount,
      });

      const { order } = orderRes.data;

      const load = await loadRazorpayScript();
      if (!load) return toast.error("Razorpay failed to load");

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
            navigate("/owner/bookings");
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
    } catch {
      toast.error("Booking failed");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="max-w-5xl p-2">
      <h1 className="text-2xl font-semibold mb-8">
        Create Offline Booking
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT */}
        <Card className="shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle>Traveller Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* MOBILE */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label>Mobile</Label>
                <Input
                  value={traveller.mobile}
                  onChange={(e) =>
                    handleChange(
                      "mobile",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  maxLength={10}
                  placeholder="10-digit number"
                  className="mt-1"
                />
              </div>

              <Button
                onClick={verifyMobile}
                disabled={checking || traveller.mobile.length !== 10}
                className="bg-black hover:bg-black text-white"
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
                      onValueChange={(v) =>
                        handleChange("city", v)
                      }
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

        {/* RIGHT */}
        <Card className="shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Dates */}
            <div className="relative">
              <Label>Dates</Label>
              <div
                className="border rounded-lg p-2 cursor-pointer mt-1 bg-white"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                {format(dateRange[0].startDate, "dd MMM")} –{" "}
                {format(dateRange[0].endDate, "dd MMM")}
              </div>

              {showCalendar && (
                <div
                  ref={calendarRef}
                  className="absolute mt-2 bg-white shadow-xl border border-gray-200 rounded-2xl z-50 p-3"
                >
                  <DateRange
                    key={disabledDays.length}
                    ranges={dateRange}
                    onChange={handleDateSelection}
                    minDate={new Date()}
                    moveRangeOnFirstSelection={false}
                    showSelectionPreview={false}
                    showDateDisplay={false}
                    months={1}
                    direction="horizontal"
                    rangeColors={["#0097A7"]}
                    disabledDay={(date) =>
                      disabledDays.some(
                        (d) =>
                          d.toDateString() ===
                          new Date(date).toDateString()
                      )
                    }
                  />
                </div>
              )}
            </div>

            {/* Guests */}
            <div>
              <Label>Guests</Label>
              <Input
                type="number"
                value={guestCount}
                onChange={(e) =>
                  setGuestCount(Number(e.target.value))
                }
                min={1}
                className="mt-1"
              />
            </div>

            {/* Total Price */}
            <div>
              <Label>Total Price</Label>
              <div className="border rounded-lg p-2 mt-1 bg-gray-50">
                ₹{calculateTotal().toLocaleString()}
              </div>
            </div>

            {/* Payment Button */}
            <Button
              className="w-full bg-black hover:bg-black text-white py-3"
              disabled={loading}
              onClick={handleBooking}
            >
              {loading ? "Creating..." : "Proceed to Payment"}
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

          <Button onClick={() => setShowPopup(false)} className="mt-4">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
