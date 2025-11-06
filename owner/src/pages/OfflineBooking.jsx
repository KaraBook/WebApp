import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Razorpay from "../utils/Razorpay"; // utility function for payment trigger

export default function OfflineBooking() {
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [traveller, setTraveller] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    state: "",
    city: "",
  });

  // fetch villa details (you can adjust to your current endpoint)
  const propertyId = useParams().id || "YOUR_DEFAULT_PROPERTY_ID";

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getSingleProperty(propertyId).url);
        setProperty(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load villa details");
      }
    })();
  }, [propertyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTraveller((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = async () => {
    if (!traveller.firstName || !traveller.email || !traveller.mobile) {
      toast.error("Please fill in traveller details");
      return;
    }

    try {
      setLoading(true);

      // Create order via backend
      const res = await api.post(`/api/payments/create-order`, {
        amount: property.pricingPerNightWeekdays * 100, // convert ₹ → paise
        traveller,
        propertyId,
        mode: "offline",
      });

      const { order } = res.data;

      // Trigger Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "KaraBook",
        description: property.propertyName,
        order_id: order.id,
        prefill: {
          name: `${traveller.firstName} ${traveller.lastName}`,
          email: traveller.email,
          contact: traveller.mobile,
        },
        handler: async (response) => {
          toast.success("Booking successful!");
          await api.post(`/api/payments/verify`, {
            ...response,
            traveller,
            propertyId,
          });
          navigate("/bookings");
        },
        theme: { color: "#000" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Book Villa for Offline Traveller</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Traveller Details */}
        <Card className="shadow-md border">
          <CardHeader>
            <CardTitle>Traveller Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input name="firstName" value={traveller.firstName} onChange={handleChange} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input name="lastName" value={traveller.lastName} onChange={handleChange} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input type="email" name="email" value={traveller.email} onChange={handleChange} />
              </div>
              <div>
                <Label>Mobile</Label>
                <Input name="mobile" value={traveller.mobile} onChange={handleChange} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>State</Label>
                <Input name="state" value={traveller.state} onChange={handleChange} />
              </div>
              <div>
                <Label>City</Label>
                <Input name="city" value={traveller.city} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Villa Summary */}
        <Card className="shadow-md border">
          <CardHeader>
            <CardTitle>Villa Summary</CardTitle>
          </CardHeader>
          {property ? (
            <CardContent className="space-y-3">
              <img
                src={property.coverImage}
                alt={property.propertyName}
                className="rounded-lg h-48 w-full object-cover"
              />
              <h2 className="text-lg font-semibold">{property.propertyName}</h2>
              <p className="text-gray-500">{property.city}, {property.state}</p>
              <div className="flex justify-between mt-2">
                <span className="text-gray-700">Base Price / Night</span>
                <span className="font-medium">₹{property.pricingPerNightWeekdays}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Max Guests</span>
                <span>{property.maxGuests}</span>
              </div>
              <div className="pt-4 border-t mt-4 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Total: ₹{property.pricingPerNightWeekdays}</h3>
                <Button
                  onClick={handlePayment}
                  disabled={loading}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  {loading ? "Processing..." : "Book & Pay"}
                </Button>
              </div>
            </CardContent>
          ) : (
            <CardContent>Loading property...</CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
