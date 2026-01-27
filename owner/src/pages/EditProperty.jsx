import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FullPageLoader from "@/components/FullPageLoader";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Clock } from "lucide-react";
import { ArrowLeft, FileText, Utensils, Sun, Moon, Coffee, IndianRupee, Bed, Sparkles, ImageIcon } from "lucide-react";
import { amenitiesOptions } from "@/constants/dropdownOptions";

/* ---------------- TAB BUTTON ---------------- */

const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-10 md:px-12 py-3 rounded-xl text-sm font-medium transition
      ${active
        ? "bg-white shadow-sm text-[#00919e]"
        : "text-gray-500 hover:text-black"}`}
  >
    <Icon size={16} />
    {label}
  </button>
);

/* ---------------- QUANTITY ---------------- */

const Stepper = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2 mt-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-12 h-9 rounded-lg border bg-white text-gray-600 hover:bg-gray-50"
      >
        –
      </button>

      <div className="min-w-[75px] h-9 flex items-center justify-center rounded-lg bg-[#f3f4f6] text-gray-900 font-medium">
        {value}
      </div>

      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-12 h-9 rounded-lg border bg-white text-gray-600 hover:bg-gray-50"
      >
        +
      </button>
    </div>
  );
};

/* ---------------- FOOD PILL ---------------- */

const FoodPill = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium border transition
      ${active
        ? "bg-[#00919e] text-white border-[#00919e]"
        : "bg-white text-gray-700"}`}
  >
    <Icon size={16} />
    {label}
  </button>
);


function TimePicker({ value, onChange }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Clock className="mr-2 h-4 w-4" />
          {value || "Select time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <Input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </PopoverContent>
    </Popover>
  );
}


export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const galleryInputRef = useRef(null);

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("details");

  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  const [shopActFile, setShopActFile] = useState(null);
  const [shopActPreview, setShopActPreview] = useState(null);

  const [galleryImageFiles, setGalleryImageFiles] = useState([]);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState([]);
  const [removedGalleryImages, setRemovedGalleryImages] = useState([]);

  const [form, setForm] = useState({
    description: "",
    weekday: "",
    weekend: "",
    extraAdult: "",
    extraChild: "",
    room: { ac: 4, nonAc: 1, deluxe: 2, luxury: 1, hall: 1 },
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 10,
    baseGuests: 8,
    checkIn: "08:00",
    checkOut: "23:30",
    food: [],
    amenities: [],
    petFriendly: false,
    isRefundable: true,
    refundNotes: "",
    cancellationPolicy: [
      { minDaysBefore: 14, refundPercent: 100 },
      { minDaysBefore: 7, refundPercent: 50 },
      { minDaysBefore: 0, refundPercent: 0 }
    ]
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getSingleProperty(id).url);
        const p = res.data.data;
        const { total, ...roomOnly } = p.roomBreakdown;

        setForm({
          description: p.description || "",
          weekday: p.pricingPerNightWeekdays || "",
          weekend: p.pricingPerNightWeekend || "",
          extraAdult: p.extraAdultCharge || "",
          extraChild: p.extraChildCharge || "",
          bedrooms: p.bedrooms || 0,
          bathrooms: p.bathrooms || 0,
          room: roomOnly,
          maxGuests: p.maxGuests,
          baseGuests: p.baseGuests,
          checkIn: p.checkInTime,
          checkOut: p.checkOutTime,
          food: (p.foodAvailability || []).map(f =>
            f.trim().toLowerCase().replace(/^\w/, c => c.toUpperCase())
          ),
          amenities: p.amenities || [],
          petFriendly: p.petFriendly || false,
          isRefundable: p.isRefundable ?? true,
          refundNotes: p.refundNotes || "",
          cancellationPolicy: p.cancellationPolicy || [
            { minDaysBefore: 14, refundPercent: 100 },
            { minDaysBefore: 7, refundPercent: 50 },
            { minDaysBefore: 0, refundPercent: 0 }
          ],
        });

        setCoverImagePreview(p.coverImage || null);
        setShopActPreview(p.shopAct || null);
        setGalleryImagePreviews(p.galleryPhotos || []);
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

      const payload = {
        ...form,
        checkInTime: form.checkIn,
        checkOutTime: form.checkOut,
        pricingPerNightWeekdays: form.weekday,
        pricingPerNightWeekend: form.weekend,
        extraAdultCharge: form.extraAdult,
        extraChildCharge: form.extraChild,
        roomBreakdown: form.room,
        foodAvailability: form.food,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        petFriendly: form.petFriendly,
        isRefundable: form.isRefundable,
        refundNotes: form.refundNotes,
        cancellationPolicy: form.cancellationPolicy,
      };

      delete payload.checkIn;
      delete payload.checkOut;
      delete payload.weekday;
      delete payload.weekend;
      delete payload.extraAdult;
      delete payload.extraChild;
      delete payload.room;
      delete payload.food;

      await api.put(SummaryApi.updateOwnerProperty(id).url, payload);

      toast.success("Saved");
      navigate(-1);
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };


  const totalRooms = Object.values(form.room).reduce((a, b) => a + b, 0);

  if (fetching) return <FullPageLoader />;

  return (
    <div className="min-h-screen bg-[#f6f7f8] px-4 md:px-6 py-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <ArrowLeft onClick={() => navigate(-1)} className="cursor-pointer" />
              Edit Property
            </div>
            <h1 className="text-2xl font-bold">West Valley Villa Casa East</h1>
          </div>
          <Button onClick={save} className="bg-primary hover:bg-[#0d5f59] mt-2 md:mt-0">
            Save Changes
          </Button>
        </div>

        {/* TABS */}
        <div className="flex bg-[#f3f4f6] flex-wrap md:flex-nowrap p-1 rounded-xl w-full">
          <TabButton icon={FileText} label="Details" active={tab === "details"} onClick={() => setTab("details")} />
          <TabButton icon={IndianRupee} label="Pricing" active={tab === "pricing"} onClick={() => setTab("pricing")} />
          <TabButton icon={Bed} label="Rooms" active={tab === "rooms"} onClick={() => setTab("rooms")} />
          <TabButton icon={Sparkles} label="Amenities" active={tab === "amenities"} onClick={() => setTab("amenities")} />
          <TabButton icon={Sparkles} label="Policies" active={tab === "policies"} onClick={() => setTab("policies")} />
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
                  className="mt-2 min-h-full"
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
                <Input className="mt-2" value={form.weekday} onChange={(e) => setForm({ ...form, weekday: e.target.value })} />
              </div>
              <div>
                <Label>Weekend Price</Label>
                <Input className="mt-2" value={form.weekend} onChange={(e) => setForm({ ...form, weekend: e.target.value })} />
              </div>
              <div>
                <Label>Extra Adult</Label>
                <Input className="mt-2" value={form.extraAdult} onChange={(e) => setForm({ ...form, extraAdult: e.target.value })} />
              </div>
              <div>
                <Label>Extra Child</Label>
                <Input className="mt-2" value={form.extraChild} onChange={(e) => setForm({ ...form, extraChild: e.target.value })} />
              </div>
            </div>
          )}

          {/* ROOMS */}
          {tab === "rooms" && (
            <div className="space-y-6">

              {/* ---------------- ROOM CONFIGURATION CARD ---------------- */}
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-base font-semibold flex items-center gap-2">
                      <Bed size={18} className="text-[#0f766e]" />
                      Room Configuration
                    </h2>
                    <p className="text-sm text-gray-500">
                      Set the number of rooms by type
                    </p>
                  </div>

                  <div className="bg-gray-100 text-sm px-3 py-1 rounded-full font-semibold">
                    {totalRooms} Total Rooms
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-8">
                  {Object.keys(form.room).map((k) => (
                    <div key={k}>
                      <Label className="text-sm text-gray-600">
                        {k === "nonAc" ? "Non-AC" : k.charAt(0).toUpperCase() + k.slice(1)}
                      </Label>

                      <Stepper
                        value={form.room[k]}
                        onChange={(v) =>
                          setForm({
                            ...form,
                            room: { ...form.room, [k]: v },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>

                {/* BEDROOMS & BATHROOMS */}
                <div className="mt-8 grid grid-cols-5 gap-10">
                  <div>
                    <Label className="text-sm text-gray-600">
                      Bedrooms
                    </Label>
                    <Stepper
                      value={form.bedrooms}
                      onChange={(v) =>
                        setForm({ ...form, bedrooms: v })
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">
                      Bathrooms
                    </Label>
                    <Stepper
                      value={form.bathrooms}
                      onChange={(v) =>
                        setForm({ ...form, bathrooms: v })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* ---------------- GUEST CAPACITY & TIMING CARD ---------------- */}
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <Sparkles size={18} className="text-[#0f766e]" />
                    Guest Capacity & Timing
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-10 mb-6">
                  <div>
                    <Label className="text-sm text-gray-600">
                      Maximum Guests
                    </Label>
                    <Stepper
                      value={form.maxGuests}
                      onChange={(v) =>
                        setForm({ ...form, maxGuests: v })
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">
                      Base Guests
                    </Label>
                    <Stepper
                      value={form.baseGuests}
                      onChange={(v) =>
                        setForm({ ...form, baseGuests: v })
                      }
                    />
                  </div>
                </div>

                <div className="border-t pt-6 grid grid-cols-2 gap-6">
                  <div>
                    <TimePicker value={form.checkIn} onChange={(v) => setForm({ ...form, checkIn: v })} />
                  </div>

                  <div>
                    <TimePicker value={form.checkOut} onChange={(v) => setForm({ ...form, checkOut: v })} />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* AMENITIES */}
          {tab === "amenities" && (
            <div className="space-y-8">

              {amenitiesOptions.map((section) => (
                <div key={section.key} className="bg-white rounded-2xl border p-6">

                  <h3 className="text-base font-semibold mb-1">
                    {section.label}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Select the amenities available at your property
                  </p>

                  <div className="grid grid-cols-4 gap-4">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = form.amenities.includes(item.value);

                      return (
                        <button
                          key={item.value}
                          onClick={() => toggle("amenities", item.value)}
                          className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition
                  ${active
                              ? "border-primary bg-[#00919e]/10 text-[#0f766e]"
                              : "hover:border-gray-300"
                            }
                `}
                        >
                          <div className={`
                  p-2 rounded-lg
                  ${active ? "bg-[#00919e]/20" : "bg-gray-100"}
                `}>
                            <Icon size={18} />
                          </div>

                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                </div>
              ))}

            </div>
          )}


          {tab === "policies" && (
            <div className="space-y-8">

              {/* PET FRIENDLY */}
              <div className="bg-white rounded-2xl border p-6">
                <h3 className="font-semibold mb-3">Pet Friendly</h3>
                <div className="flex gap-4">
                  <Button
                    variant={form.petFriendly ? "default" : "outline"}
                    onClick={() => setForm({ ...form, petFriendly: true })}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={!form.petFriendly ? "default" : "outline"}
                    onClick={() => setForm({ ...form, petFriendly: false })}
                  >
                    No
                  </Button>
                </div>
              </div>

              {/* REFUNDABLE */}
              <div className="bg-white rounded-2xl border p-6">
                <h3 className="font-semibold mb-3">Refund Policy</h3>

                <div className="flex gap-4 mb-4">
                  <Button
                    variant={form.isRefundable ? "default" : "outline"}
                    onClick={() => setForm({ ...form, isRefundable: true })}
                  >
                    Refundable
                  </Button>
                  <Button
                    variant={!form.isRefundable ? "default" : "outline"}
                    onClick={() => setForm({ ...form, isRefundable: false })}
                  >
                    Non-Refundable
                  </Button>
                </div>

                {form.isRefundable && (
                  <>
                    <Label>Refund Notes</Label>
                    <Textarea
                      className="mt-2"
                      rows={3}
                      value={form.refundNotes}
                      onChange={(e) =>
                        setForm({ ...form, refundNotes: e.target.value })
                      }
                    />

                    {/* POLICY RULES */}
                    <div className="mt-6 space-y-3">
                      {form.cancellationPolicy.map((rule, i) => (
                        <div key={i} className="flex gap-4 items-center">
                          <Input
                            type="number"
                            value={rule.minDaysBefore}
                            onChange={(e) => {
                              const cp = [...form.cancellationPolicy];
                              cp[i].minDaysBefore = Number(e.target.value);
                              setForm({ ...form, cancellationPolicy: cp });
                            }}
                            className="w-24"
                          />
                          <span>days before</span>

                          <Input
                            type="number"
                            value={rule.refundPercent}
                            onChange={(e) => {
                              const cp = [...form.cancellationPolicy];
                              cp[i].refundPercent = Number(e.target.value);
                              setForm({ ...form, cancellationPolicy: cp });
                            }}
                            className="w-24"
                          />
                          <span>% refund</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* MEDIA */}
          {tab === "media" && (
            <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-8">

              {/* HEADER */}
              <div>
                <h2 className="text-base font-semibold flex items-center gap-2">
                  <ImageIcon size={18} className="text-[#0f766e]" />
                  Property Images
                </h2>
                <p className="text-sm text-gray-500">
                  Upload high-quality images to showcase your property
                </p>
              </div>

              {/* COVER + SHOP ACT */}
              <div className="grid grid-cols-2 gap-8">

                {/* COVER */}
                <div>
                  <Label className="text-sm">Cover Image</Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Main image shown in listings
                  </p>

                  {/* COVER */}
                  <div className="rounded-xl border overflow-hidden h-48 bg-gray-100 flex items-center justify-center">
                    {coverImagePreview ? (
                      <img
                        src={coverImagePreview}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">No cover uploaded</span>
                    )}
                  </div>

                  <input
                    type="file"
                    className="hidden"
                    id="coverUpload"
                  />
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => document.getElementById("coverUpload").click()}
                  >
                    Upload Cover
                  </Button>
                </div>

                {/* SHOP ACT */}
                <div>
                  <Label className="text-sm">Shop Act Document</Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Optional - for verification
                  </p>

                  <div className="rounded-xl border overflow-hidden h-48 bg-gray-100 flex items-center justify-center">
                    {shopActPreview ? (
                      <img
                        src={shopActPreview}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">No document uploaded</span>
                    )}
                  </div>

                  <input type="file" className="hidden" id="shopActUpload" />
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => document.getElementById("shopActUpload").click()}
                  >
                    Upload Document
                  </Button>
                </div>
              </div>

              {/* GALLERY */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <Label className="text-sm">Gallery Photos</Label>
                    <p className="text-xs text-gray-500">
                      Add 3-10 photos of your property
                    </p>
                  </div>
                  <div className="bg-gray-100 text-xs px-2 py-1 rounded-full">
                    {galleryImagePreviews.length}/10
                  </div>
                </div>

                <input
                  type="file"
                  multiple
                  className="hidden"
                  ref={galleryInputRef}
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files || []);
                    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
                    setGalleryImageFiles(prev => [...prev, ...newFiles]);
                    setGalleryImagePreviews(prev => [...prev, ...newPreviews]);
                  }}
                />

                <div className="grid grid-cols-5 gap-4">
                  {galleryImagePreviews.map((img, i) => (
                    <div
                      key={i}
                      className="h-28 rounded-xl overflow-hidden border"
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}

                  {/* ADD MORE */}
                  <div
                    onClick={() => galleryInputRef.current.click()}
                    className="h-28 rounded-xl border-dashed border flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50"
                  >
                    +
                    <span className="text-xs">Add More</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}