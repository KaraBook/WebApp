import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import FullPageLoader from "@/components/FullPageLoader";


const TabButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-12 py-2 rounded-xl text-sm font-medium transition
      ${active ? "bg-white shadow text-primary" : "text-gray-500 hover:text-black"}`}
  >
    {children}
  </button>
);

const QuantityStepper = ({ value, onChange }) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={() => onChange(Math.max(0, value - 1))}
      className="w-8 h-8 rounded-lg border text-lg"
    >
      –
    </button>
    <div className="w-10 text-center font-medium">{value}</div>
    <button
      type="button"
      onClick={() => onChange(value + 1)}
      className="w-8 h-8 rounded-lg border text-lg"
    >
      +
    </button>
  </div>
);

/* -------------------------------------------------- */

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const [formData, setFormData] = useState({
    description: "",
    weekdayPrice: "",
    weekendPrice: "",
    extraAdult: "",
    extraChild: "",
    roomBreakdown: { ac: 0, nonAc: 0, deluxe: 0, luxury: 0, hall: 0 },
    maxGuests: 10,
    baseGuests: 8,
    checkIn: "08:00",
    checkOut: "23:30",
    amenities: [],
    food: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getSingleProperty(id).url);
        const p = res.data.data;

        setFormData({
          description: p.description || "",
          weekdayPrice: p.pricingPerNightWeekdays || "",
          weekendPrice: p.pricingPerNightWeekend || "",
          extraAdult: p.extraAdultCharge || "",
          extraChild: p.extraChildCharge || "",
          roomBreakdown: p.roomBreakdown,
          maxGuests: p.maxGuests,
          baseGuests: p.baseGuests,
          checkIn: p.checkInTime || "08:00",
          checkOut: p.checkOutTime || "23:30",
          amenities: p.amenities || [],
          food: p.foodAvailability || [],
        });
      } catch {
        toast.error("Failed to load property");
      } finally {
        setFetching(false);
      }
    })();
  }, [id]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.put(SummaryApi.updateOwnerProperty(id).url, formData);
      toast.success("Property updated");
      navigate(`/view-property/${id}`);
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <FullPageLoader />;

  return (
    <div className="min-h-screen bg-[#f9fafb] px-6 py-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <ArrowLeft
                className="cursor-pointer"
                onClick={() => navigate(-1)}
              />
              Edit Property
            </div>
            <h1 className="text-2xl font-bold mt-1">
              West Valley Villa Casa East
            </h1>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl px-6"
          >
            Save Changes
          </Button>
        </div>

        {/* TABS */}
        <div className="flex bg-[#f3f4f6] p-1 rounded-xl w-full">
          <TabButton active={activeTab === "details"} onClick={() => setActiveTab("details")}>Details</TabButton>
          <TabButton active={activeTab === "pricing"} onClick={() => setActiveTab("pricing")}>₹ Pricing</TabButton>
          <TabButton active={activeTab === "rooms"} onClick={() => setActiveTab("rooms")}>Rooms</TabButton>
          <TabButton active={activeTab === "amenities"} onClick={() => setActiveTab("amenities")}>Amenities</TabButton>
          <TabButton active={activeTab === "media"} onClick={() => setActiveTab("media")}>Media</TabButton>
        </div>

        {/* CONTENT CARD */}
        <div className="bg-white rounded-2xl border p-6 space-y-6">

          {/* DETAILS */}
          {activeTab === "details" && (
            <>
              <div>
                <Label>Property Description</Label>
                <Textarea
                  rows={5}
                  className="mt-2"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Food Options</Label>
                <div className="flex gap-3 mt-2">
                  {["Breakfast", "Lunch", "Dinner"].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          food: formData.food.includes(f)
                            ? formData.food.filter((x) => x !== f)
                            : [...formData.food, f],
                        })
                      }
                      className={`px-4 py-2 rounded-full border
                        ${formData.food.includes(f)
                          ? "bg-primary text-white"
                          : "bg-white"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* PRICING */}
          {activeTab === "pricing" && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>Weekday Price</Label>
                <Input
                  value={formData.weekdayPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, weekdayPrice: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Weekend Price</Label>
                <Input
                  value={formData.weekendPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, weekendPrice: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Extra Adult</Label>
                <Input
                  value={formData.extraAdult}
                  onChange={(e) =>
                    setFormData({ ...formData, extraAdult: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Extra Child</Label>
                <Input
                  value={formData.extraChild}
                  onChange={(e) =>
                    setFormData({ ...formData, extraChild: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* ROOMS */}
          {activeTab === "rooms" && (
            <>
              <div className="grid grid-cols-5 gap-6">
                {["ac", "nonAc", "deluxe", "luxury", "hall"].map((key) => (
                  <div key={key}>
                    <Label className="capitalize">
                      {key === "nonAc" ? "Non AC" : key}
                    </Label>
                    <QuantityStepper
                      value={formData.roomBreakdown[key]}
                      onChange={(v) =>
                        setFormData({
                          ...formData,
                          roomBreakdown: {
                            ...formData.roomBreakdown,
                            [key]: v,
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Max Guests</Label>
                  <QuantityStepper
                    value={formData.maxGuests}
                    onChange={(v) =>
                      setFormData({ ...formData, maxGuests: v })
                    }
                  />
                </div>

                <div>
                  <Label>Base Guests</Label>
                  <QuantityStepper
                    value={formData.baseGuests}
                    onChange={(v) =>
                      setFormData({ ...formData, baseGuests: v })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Check In</Label>
                  <Input
                    type="time"
                    value={formData.checkIn}
                    onChange={(e) =>
                      setFormData({ ...formData, checkIn: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Check Out</Label>
                  <Input
                    type="time"
                    value={formData.checkOut}
                    onChange={(e) =>
                      setFormData({ ...formData, checkOut: e.target.value })
                    }
                  />
                </div>
              </div>
            </>
          )}

          {/* AMENITIES */}
          {activeTab === "amenities" && (
            <div className="grid grid-cols-4 gap-4">
              {["WiFi", "AC", "Power Backup", "Parking", "Garden", "Pet Friendly"].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      amenities: formData.amenities.includes(a)
                        ? formData.amenities.filter((x) => x !== a)
                        : [...formData.amenities, a],
                    })
                  }
                  className={`p-4 rounded-xl border text-sm
                    ${formData.amenities.includes(a)
                      ? "border-primary bg-primary/10"
                      : ""}`}
                >
                  {a}
                </button>
              ))}
            </div>
          )}

          {/* MEDIA */}
          {activeTab === "media" && (
            <div className="border-dashed border rounded-xl p-10 text-center text-gray-500">
              Media upload UI goes here (same structure as screenshot)
            </div>
          )}

        </div>
      </div>
    </div>
  );
}