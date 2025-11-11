import { useState, useRef, useEffect } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { loadRazorpay } from "../utils/Razorpay";
import SummaryApi from "@/common/SummaryApi";
import api from "../api/axios";

export default function OfflineBooking() {
  const [traveller, setTraveller] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    state: "",
    city: "",
  });

  const [propertyId, setPropertyId] = useState(""); 
  const [guestCount, setGuestCount] = useState(1);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);


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
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (key, val) => {
    setTraveller((prev) => ({ ...prev, [key]: val }));
  };

  const handleBooking = async () => {
    if (!traveller.firstName || !traveller.lastName || !traveller.email || !traveller.mobile) {
      return toast.error("Please fill all traveller details.");
    }
    if (!price || Number(price) <= 0) return toast.error("Enter a valid price.");

    setLoading(true);
    try {
      const { startDate, endDate } = dateRange[0];
      const { data } = await Axios.post(SummaryApi.ownerOfflineBooking.url, {
        traveller,
        propertyId,
        checkIn: startDate,
        checkOut: endDate,
        guests: guestCount,
        totalAmount: Number(price),
      });

      const { order } = data;
      const loaded = await loadRazorpay();
      if (!loaded) return toast.error("Razorpay failed to load");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Offline Villa Booking",
        description: "Owner created booking",
        order_id: order.id,
        handler: async (response) => {
          await Axios.post(SummaryApi.verifyBookingPayment.url, response);
          toast.success("Booking created successfully!");
        },
        prefill: { name: traveller.firstName, email: traveller.email, contact: traveller.mobile },
        theme: { color: "#233b19" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-8">Create Offline Booking</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traveller Details */}
        <Card>
          <CardHeader>
            <CardTitle>Traveller Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name</Label>
                <Input
                  value={traveller.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={traveller.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={traveller.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="example@mail.com"
              />
            </div>

            <div>
              <Label>Mobile</Label>
              <Input
                value={traveller.mobile}
                onChange={(e) =>
                  handleChange("mobile", e.target.value.replace(/\D/g, ""))
                }
                placeholder="10-digit number"
                maxLength={10}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>State</Label>
                <Input
                  value={traveller.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="State"
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={traveller.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="City"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Label>Dates</Label>
              <div
                className="border rounded-lg p-2 cursor-pointer"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                {format(dateRange[0].startDate, "dd MMM")} -{" "}
                {format(dateRange[0].endDate, "dd MMM")}
              </div>
              {showCalendar && (
                <div
                  ref={calendarRef}
                  className="absolute z-50 mt-2 border bg-white shadow-lg rounded-xl"
                >
                  <DateRange
                    ranges={dateRange}
                    onChange={(item) => setDateRange([item.selection])}
                    minDate={new Date()}
                    rangeColors={["#efcc61"]}
                    months={1}
                    direction="horizontal"
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Guests</Label>
              <Input
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                min={1}
                max={20}
              />
            </div>

            <div>
              <Label>Custom Price (₹)</Label>
              <Input
                type="number"
                placeholder="Enter total price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <Button
              className="w-full mt-3 bg-[#efcc61] text-black hover:bg-[#f5d972]"
              disabled={loading}
              onClick={handleBooking}
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
