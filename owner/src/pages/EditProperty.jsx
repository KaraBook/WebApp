import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FullPageLoader from "@/components/FullPageLoader";

import {
  ArrowLeft,
  FileText,
  Utensils,
  Sun,
  Moon,
  Coffee,
  IndianRupee,
  Bed,
  Sparkles,
  ImageIcon,
} from "lucide-react";

/* ---------------- TAB BUTTON ---------------- */

const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-12 py-3 rounded-xl text-sm font-medium transition
      ${active
        ? "bg-white shadow-sm text-[#0f766e]"
        : "text-gray-500 hover:text-black"}`}
  >
    <Icon size={16} />
    {label}
  </button>
);

/* ---------------- QUANTITY ---------------- */

const Stepper = ({ value, onChange }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={() => onChange(Math.max(0, value - 1))}
      className="w-8 h-8 rounded-lg border text-lg"
    >
      –
    </button>
    <div className="w-10 text-center font-medium">{value}</div>
    <button
      onClick={() => onChange(value + 1)}
      className="w-8 h-8 rounded-lg border text-lg"
    >
      +
    </button>
  </div>
);

/* ---------------- FOOD PILL ---------------- */

const FoodPill = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium border transition
      ${active
        ? "bg-[#0f766e] text-white border-[#0f766e]"
        : "bg-white text-gray-700"}`}
  >
    <Icon size={16} />
    {label}
  </button>
);

/* ===================================================== */

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("details");

  const [form, setForm] = useState({
    description: "",
    weekday: "",
    weekend: "",
    extraAdult: "",
    extraChild: "",
    room: { ac: 4, nonAc: 1, deluxe: 2, luxury: 1, hall: 1 },
    maxGuests: 10,
    baseGuests: 8,
    checkIn: "08:00",
    checkOut: "23:30",
    food: [],
    amenities: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getSingleProperty(id).url);
        const p = res.data.data;

        setForm({
          description: p.description || "",
          weekday: p.pricingPerNightWeekdays || "",
          weekend: p.pricingPerNightWeekend || "",
          extraAdult: p.extraAdultCharge || "",
          extraChild: p.extraChildCharge || "",
          room: p.roomBreakdown,
          maxGuests: p.maxGuests,
          baseGuests: p.baseGuests,
          checkIn: p.checkInTime,
          checkOut: p.checkOutTime,
          food: p.foodAvailability || [],
          amenities: p.amenities || [],
        });
      } catch {
        toast.error("Failed to load");
      } finally {
        setFetching(false);
      }
    })();
  }, [id]);

  const toggle = (key, val) => {
    setForm({
      ...form,
      [key]: form[key].includes(val)
        ? form[key].filter((x) => x !== val)
        : [...form[key], val],
    });
  };

  const save = async () => {
    try {
      setLoading(true);
      await api.put(SummaryApi.updateOwnerProperty(id).url, form);
      toast.success("Saved");
      navigate(-1);
    } catch {
      toast.error("Failed");
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
              <ArrowLeft onClick={() => navigate(-1)} className="cursor-pointer" />
              Edit Property
            </div>
            <h1 className="text-2xl font-bold">West Valley Villa Casa East</h1>
          </div>
          <Button onClick={save} className="bg-[#0f766e] hover:bg-[#0d5f59]">
            Save Changes
          </Button>
        </div>

        {/* TABS */}
        <div className="flex bg-[#f3f4f6] p-1 rounded-xl w-full">
          <TabButton icon={FileText} label="Details" active={tab === "details"} onClick={() => setTab("details")} />
          <TabButton icon={IndianRupee} label="Pricing" active={tab === "pricing"} onClick={() => setTab("pricing")} />
          <TabButton icon={Bed} label="Rooms" active={tab === "rooms"} onClick={() => setTab("rooms")} />
          <TabButton icon={Sparkles} label="Amenities" active={tab === "amenities"} onClick={() => setTab("amenities")} />
          <TabButton icon={ImageIcon} label="Media" active={tab === "media"} onClick={() => setTab("media")} />
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">

          {/* DETAILS */}
          {tab === "details" && (
            <>
              <div>
                <Label className="flex items-center gap-2">
                  <FileText size={16} /> Property Description
                </Label>
                <Textarea
                  rows={5}
                  className="mt-2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Utensils size={16} /> Food Options
                </Label>
                <div className="flex gap-3 mt-3">
                  <FoodPill icon={Coffee} label="Breakfast" active={form.food.includes("Breakfast")} onClick={() => toggle("food", "Breakfast")} />
                  <FoodPill icon={Sun} label="Lunch" active={form.food.includes("Lunch")} onClick={() => toggle("food", "Lunch")} />
                  <FoodPill icon={Moon} label="Dinner" active={form.food.includes("Dinner")} onClick={() => toggle("food", "Dinner")} />
                </div>
              </div>
            </>
          )}

          {/* PRICING */}
          {tab === "pricing" && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>Weekday Price</Label>
                <Input value={form.weekday} onChange={(e) => setForm({ ...form, weekday: e.target.value })} />
              </div>
              <div>
                <Label>Weekend Price</Label>
                <Input value={form.weekend} onChange={(e) => setForm({ ...form, weekend: e.target.value })} />
              </div>
              <div>
                <Label>Extra Adult</Label>
                <Input value={form.extraAdult} onChange={(e) => setForm({ ...form, extraAdult: e.target.value })} />
              </div>
              <div>
                <Label>Extra Child</Label>
                <Input value={form.extraChild} onChange={(e) => setForm({ ...form, extraChild: e.target.value })} />
              </div>
            </div>
          )}

          {/* ROOMS */}
          {tab === "rooms" && (
            <>
              <div className="grid grid-cols-5 gap-6">
                {Object.keys(form.room).map((k) => (
                  <div key={k}>
                    <Label className="capitalize">{k === "nonAc" ? "Non AC" : k}</Label>
                    <Stepper
                      value={form.room[k]}
                      onChange={(v) =>
                        setForm({ ...form, room: { ...form.room, [k]: v } })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Max Guests</Label>
                  <Stepper value={form.maxGuests} onChange={(v) => setForm({ ...form, maxGuests: v })} />
                </div>
                <div>
                  <Label>Base Guests</Label>
                  <Stepper value={form.baseGuests} onChange={(v) => setForm({ ...form, baseGuests: v })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Check In</Label>
                  <Input type="time" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
                </div>
                <div>
                  <Label>Check Out</Label>
                  <Input type="time" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
                </div>
              </div>
            </>
          )}

          {/* AMENITIES */}
          {tab === "amenities" && (
            <div className="grid grid-cols-4 gap-4">
              {["WiFi", "Air Conditioning", "Power Backup", "Parking", "Garden", "Pet Friendly"].map((a) => (
                <button
                  key={a}
                  onClick={() => toggle("amenities", a)}
                  className={`p-4 rounded-xl border text-sm
                    ${form.amenities.includes(a)
                      ? "border-[#0f766e] bg-[#0f766e]/10 text-[#0f766e]"
                      : ""}`}
                >
                  {a}
                </button>
              ))}
            </div>
          )}

          {/* MEDIA */}
          {tab === "media" && (
            <div className="border-dashed border rounded-xl p-10 text-center text-gray-400">
              Drag & drop images here (same as KaraBook UI)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}