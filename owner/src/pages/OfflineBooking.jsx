import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "../api/axios";
import SummaryApi from "@/common/SummaryApi";
import loadRazorpay from "../utils/Razorpay";
import { getIndianStates, getCitiesByState } from "@/utils/locationUtils";
import { useAuth } from "../auth/AuthContext";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function OfflineBooking() {
  const { id } = useParams();
  const { user } = useAuth();
  const ownerMobile = user?.mobile;

  const [propertyId] = useState(id || "");
  const [guestCount, setGuestCount] = useState(1);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedStateCode, setSelectedStateCode] = useState("");

  const [allowForm, setAllowForm] = useState(false);

  const [blockedDates, setBlockedDates] = useState([]);

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

  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMsg, setPopupMsg] = useState("");

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      key: "selection",
    },
  ]);

  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    setStates(getIndianStates());
  }, []);

  useEffect(() => {
    if (!propertyId) return;

    const fetchBlocked = async () => {
      try {
        const res = await api.get(SummaryApi.getPropertyBlockedDates.url(propertyId));
        setBlockedDates(res.data.dates || []);
      } catch (err) {
        console.error("Failed to load blocked dates", err);
      }
    };

    fetchBlocked();
  }, [propertyId]);

  const isDateBlocked = (date) => {
    return blockedDates.some((range) => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      return date >= start && date <= end;
    });
  };


  useEffect(() => {
    const handleOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleChange = (key, val) => {
    setTraveller((prev) => ({ ...prev, [key]: val }));
  };


  const verifyMobile = async () => {
    if (traveller.mobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (traveller.mobile === ownerMobile) {
      setAllowForm(false);

      setPopupTitle("Owner Number Not Allowed");
      setPopupMsg(
        "This mobile number belongs to a Property Owner account. You cannot create a traveller booking using this number."
      );

      setTraveller({
        firstName: "",
        lastName: "",
        email: "",
        mobile: traveller.mobile,
        dateOfBirth: "",
        address: "",
        pinCode: "",
        state: "",
        city: "",
      });

      setSelectedStateCode("");
      setCities([]);
      setShowPopup(true);
      return;
    }

    setChecking(true);

    try {
      const res = await api.post(SummaryApi.checkTravellerByMobile.url, {
        mobile: traveller.mobile,
      });

      const data = res.data;

      setAllowForm(true);

      if (data.exists) {
        const t = data.traveller;

        const dobFormatted = t.dateOfBirth
          ? t.dateOfBirth.substring(0, 10)
          : "";

        const stateObj = states.find((s) => s.name === t.state);
        const iso = stateObj?.isoCode || "";
        const cityList = iso ? getCitiesByState(iso) : [];

        setCities(cityList);
        setSelectedStateCode(iso);

        setTraveller({
          firstName: t.firstName || "",
          lastName: t.lastName || "",
          email: t.email || "",
          mobile: t.mobile,
          dateOfBirth: dobFormatted,
          address: t.address || "",
          pinCode: t.pinCode || "",
          state: t.state || "",
          city: t.city || "",
        });

        setPopupTitle("Traveller Found");
        setPopupMsg("This number is already registered. Traveller details are auto-filled.");
      }

      else {
        setTraveller({
          firstName: "",
          lastName: "",
          email: "",
          mobile: traveller.mobile,
          dateOfBirth: "",
          address: "",
          pinCode: "",
          state: "",
          city: "",
        });

        setSelectedStateCode("");
        setCities([]);

        setPopupTitle("New Traveller");
        setPopupMsg("This mobile number is not registered. Please fill the traveller details.");
      }

      setShowPopup(true);
    } catch (err) {
      toast.error("Error checking mobile number");
    } finally {
      setChecking(false);
    }
  };



  const handleStateChange = (code) => {
    setSelectedStateCode(code);

    const selected = states.find((s) => s.isoCode === code);
    setTraveller((p) => ({
      ...p,
      state: selected?.name || "",
      city: "",
    }));

    setCities(getCitiesByState(code));
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

    const { startDate, endDate } = dateRange[0];

    const overlaps = blockedDates.some((range) => {
      const bStart = new Date(range.start);
      const bEnd = new Date(range.end);

      return (
        (startDate >= bStart && startDate <= bEnd) ||
        (endDate >= bStart && endDate <= bEnd) ||
        (startDate <= bStart && endDate >= bEnd)
      );
    });

    if (overlaps) {
      toast.error("Selected dates fall inside a blocked date range. Please pick different dates.");
      return;
    }

    for (let f of required) {
      if (!traveller[f]) return toast.error("Please fill all fields");
    }

    if (!price || Number(price) <= 0) return toast.error("Invalid price");

    setLoading(true);

    try {
      const { startDate, endDate } = dateRange[0];

      const nights = Math.max(
        1,
        Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      );
      const totalAmount = nights * Number(price);

      const { data } = await api.post(SummaryApi.ownerOfflineBooking.url, {
        traveller,
        propertyId,
        checkIn: startDate,
        checkOut: endDate,
        guests: guestCount,
        pricePerNight: Number(price),
        nights,
        totalAmount
      });

      const { order } = data;

      const loaded = await loadRazorpay();
      if (!loaded) return toast.error("Razorpay load failed");

      new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        handler: async (response) => {
          await api.post(SummaryApi.verifyBookingPayment.url, {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });

          toast.success("Booking successful!");
        },
        prefill: {
          name: `${traveller.firstName} ${traveller.lastName}`,
          email: traveller.email,
          contact: traveller.mobile,
        },
        theme: { color: "#233b19" },
      }).open();
    } catch (err) {
      toast.error("Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl p-2">
      <h1 className="text-2xl font-semibold mb-8">Create Offline Booking</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT CARD */}
        <Card>
          <CardHeader>
            <CardTitle>Traveller Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label>Mobile</Label>
                <Input
                  value={traveller.mobile}
                  onChange={(e) =>
                    handleChange("mobile", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="10-digit number"
                  maxLength={10}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={verifyMobile}
                disabled={checking || traveller.mobile.length !== 10}
                className="bg-[#233b19] hover:bg-[#1b2e13] text-white"
              >
                {checking ? "Checking..." : "Verify"}
              </Button>
            </div>

            {/* SHOW FORM ONLY AFTER VERIFY */}
            {allowForm && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={traveller.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={traveller.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={traveller.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={traveller.dateOfBirth}
                      onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Pin Code</Label>
                    <Input
                      value={traveller.pinCode}
                      maxLength={6}
                      className="mt-1"
                      onChange={(e) =>
                        handleChange(
                          "pinCode",
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Address</Label>
                  <Input
                    value={traveller.address}
                    className="mt-1"
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>State</Label>
                    <Select
                      value={selectedStateCode}
                      onValueChange={handleStateChange}
                      className="mt-1"
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
                      className="mt-1"
                      onValueChange={(v) =>
                        setTraveller((p) => ({ ...p, city: v }))
                      }
                      disabled={!cities.length}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={cities.length ? "Select City" : "Select State first"}
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

        {/* RIGHT CARD */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="relative">
              <Label>Dates</Label>
              <div
                className="border rounded-lg p-2 cursor-pointer mt-1"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                {format(dateRange[0].startDate, "dd MMM")} –{" "}
                {format(dateRange[0].endDate, "dd MMM")}
              </div>

              {showCalendar && (
                <div
                  ref={calendarRef}
                  className="absolute mt-2 bg-white shadow-lg border rounded-xl z-50"
                >
                  <DateRange
                    ranges={dateRange}
                    onChange={(item) => setDateRange([item.selection])}
                    minDate={new Date()}
                    rangeColors={["#efcc61"]}
                    disabledDay={isDateBlocked}
                  />

                </div>
              )}
            </div>

            <div>
              <Label>Guests</Label>
              <Input
                type="number"
                className="mt-1"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                min={1}
                max={20}
              />
            </div>

            <div>
              <Label>Price Per Night (₹)</Label>
              <Input
                type="number"
                className="mt-1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price for 1 night"
              />
              {price && (
                <p className="mt-2 text-sm text-gray-600">
                  Total Amount: <strong>₹{(Number(price) * nights).toLocaleString()}</strong>
                </p>
              )}
            </div>

            <Button
              className="w-full bg-[#efcc61] hover:bg-[#f5d972] text-black"
              disabled={loading}
              onClick={handleBooking}
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* POPUP */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{popupTitle}</DialogTitle>
            <DialogDescription>{popupMsg}</DialogDescription>
          </DialogHeader>
          <Button className="mt-4" onClick={() => setShowPopup(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
