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
  const ownerMobile = user?.mobile;

  const [propertyId] = useState(id || "");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedStateCode, setSelectedStateCode] = useState("");

  const [blockedDates, setBlockedDates] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
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

  const [showPopup, setShowPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMsg, setPopupMsg] = useState("");

  const [showPaymentBox, setShowPaymentBox] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [receiptImage, setReceiptImage] = useState(null);
  const [bookingId, setBookingId] = useState(null);

  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
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


  useEffect(() => {
    setStates(getIndianStates());
  }, []);


  useEffect(() => {
    if (!propertyId) return;

    const loadDates = async () => {
      try {
        const blockRes = await api.get(
          SummaryApi.getPropertyBlockedDates.url(propertyId)
        );
        const bookRes = await api.get(
          SummaryApi.getBookedDates.url(propertyId)
        );

        const blocked = blockRes.data.dates || [];
        const booked = bookRes.data.dates || [];

        setBlockedDates(blocked);
        setBookedDates(booked);

        const fullList = [];

        [...blocked, ...booked].forEach((r) => {
          const rangeDays = eachDayOfInterval({
            start: new Date(r.start),
            end: new Date(r.end),
          });
          fullList.push(...rangeDays);
        });

        setDisabledDays(fullList);
      } catch (err) {
        console.error("Failed to fetch dates", err);
      }
    };

    loadDates();
  }, [propertyId]);

  
  const isDateDisabled = (day) => {
    return disabledDays.some(
      (d) => d.toDateString() === new Date(day).toDateString()
    );
  };


  const handleDateSelection = (item) => {
    const { startDate, endDate } = item.selection;

    let d = new Date(startDate);
    let invalid = false;

    while (d <= endDate) {
      if (isDateDisabled(d)) {
        invalid = true;
        break;
      }
      d.setDate(d.getDate() + 1);
    }

    if (invalid) {
      toast.error("Selected dates include unavailable days.");
      return;
    }

    setDateRange([item.selection]);
  };

  
  useEffect(() => {
    const handleClick = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);


  const handleChange = (key, val) => {
    setTraveller((prev) => ({ ...prev, [key]: val }));
  };

  const verifyMobile = async () => {
    if (traveller.mobile.length !== 10) {
      toast.error("Invalid mobile number");
      return;
    }

    if (traveller.mobile === ownerMobile) {
      setAllowForm(false);
      setPopupTitle("Not Allowed");
      setPopupMsg("Owner mobile cannot be used for booking.");
      setShowPopup(true);
      return;
    }

    setChecking(true);

    try {
      const res = await api.post(SummaryApi.checkTravellerByMobile.url, {
        mobile: traveller.mobile,
      });

      setAllowForm(true);

      if (res.data.exists) {
        const t = res.data.traveller;

        const stateObj = states.find((s) => s.name === t.state);
        const iso = stateObj?.isoCode || "";

        setCities(iso ? getCitiesByState(iso) : []);
        setSelectedStateCode(iso);

        setTraveller({
          firstName: t.firstName || "",
          lastName: t.lastName || "",
          email: t.email || "",
          mobile: t.mobile,
          dateOfBirth: t.dateOfBirth?.substring(0, 10) || "",
          address: t.address || "",
          pinCode: t.pinCode || "",
          state: t.state || "",
          city: t.city || "",
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
        setSelectedStateCode("");
        setCities([]);

        setPopupTitle("New Traveller");
        setPopupMsg("Enter traveller details manually.");
      }

      setShowPopup(true);
    } catch {
      toast.error("Error verifying mobile");
    } finally {
      setChecking(false);
    }
  };

  const handleStateChange = (code) => {
    setSelectedStateCode(code);

    const st = states.find((s) => s.isoCode === code);
    setTraveller((p) => ({ ...p, state: st?.name || "", city: "" }));

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

    for (let f of required) {
      if (!traveller[f]) return toast.error("Fill all required fields");
    }

    if (!price || Number(price) <= 0)
      return toast.error("Invalid price");

    const { startDate, endDate } = dateRange[0];
    setLoading(true);

    try {
      const totalAmount = nights * Number(price);

      const res = await api.post(SummaryApi.ownerOfflineBooking.url, {
        traveller,
        propertyId,
        checkIn: startDate,
        checkOut: endDate,
        guests: guestCount,
        nights,
        totalAmount,
      });

      setBookingId(res.data.booking._id);
      setShowPaymentBox(true);
      toast.success("Booking created! Confirm payment.");

    } catch {
      toast.error("Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  
  const confirmPayment = async () => {
    if (!paymentMethod)
      return toast.error("Select payment method");

    let imageUrl = "";

    if (receiptImage) {
      const f = new FormData();
      f.append("file", receiptImage);
      const upload = await api.post("/upload/offline-receipt", f);
      imageUrl = upload.data.url;
    }

    try {
      await api.post(SummaryApi.confirmOfflinePayment.url, {
        bookingId,
        paymentMethod,
        transactionId,
        receiptImage: imageUrl,
      });

      toast.success("Booking confirmed!");
      navigate("/owner/bookings");
    } catch {
      toast.error("Payment confirmation failed");
    }
  };


  return (
    <div className="max-w-5xl p-2">
      <h1 className="text-2xl font-semibold mb-8">Create Offline Booking</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT SIDE */}
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
                className="bg-[#233b19] hover:bg-[#1b2e13] text-white"
              >
                {checking ? "Checking..." : "Verify"}
              </Button>
            </div>

            {/* Traveller fields */}
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
                      onChange={(e) =>
                        handleChange("dateOfBirth", e.target.value)
                      }
                      className="mt-1"
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
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Address</Label>
                  <Input
                    value={traveller.address}
                    onChange={(e) => handleChange("address", e.target.value)}
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
                            cities.length ? "Select City" : "Select State first"
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

        {/* RIGHT SIDE */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">

            {/* DATE PICKER */}
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
                  className="absolute mt-2 bg-white shadow-xl border rounded-xl z-50"
                >
                  <DateRange
                    ranges={dateRange}
                    onChange={handleDateSelection}
                    minDate={new Date()}
                    disabledDates={disabledDays}   
                    rangeColors={["#efcc61"]}
                    moveRangeOnFirstSelection={false}
                    showSelectionPreview={false}
                    months={1}
                    direction="horizontal"
                    dayContentRenderer={(date) => {
                      const disabled = isDateDisabled(date);
                      return (
                        <div
                          className={`w-full h-full flex items-center justify-center rounded-full ${
                            disabled
                              ? "bg-red-300 text-white cursor-not-allowed"
                              : "hover:bg-[#efcc61] hover:text-black"
                          }`}
                        >
                          {date.getDate()}
                        </div>
                      );
                    }}
                  />
                </div>
              )}
            </div>

            {/* Guests */}
            <div>
              <Label>Guests</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            {/* Price */}
            <div>
              <Label>Price Per Night (₹)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1"
                placeholder="Enter price"
              />

              {price && (
                <p className="mt-2 text-sm">
                  Total Amount:{" "}
                  <strong>
                    ₹{(Number(price) * nights).toLocaleString()}
                  </strong>
                </p>
              )}
            </div>

            <Button
              className="w-full bg-[#efcc61] hover:bg-[#e6c04f] text-black"
              disabled={loading}
              onClick={handleBooking}
            >
              {loading ? "Creating..." : "Proceed to Payment"}
            </Button>

            {showPaymentBox && (
              <div className="mt-4 border p-4 rounded-lg bg-gray-50 space-y-4">
                <Label>Payment Method</Label>

                <Select
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Method" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>

                {paymentMethod === "upi" && (
                  <>
                    <Label>Transaction ID (Optional)</Label>
                    <Input
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />

                    <Label>Receipt Image (Optional)</Label>
                    <Input
                      type="file"
                      onChange={(e) => setReceiptImage(e.target.files[0])}
                    />
                  </>
                )}

                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={confirmPayment}
                  disabled={!paymentMethod}
                >
                  Confirm Booking
                </Button>
              </div>
            )}

          </CardContent>
        </Card>
      </div>

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
