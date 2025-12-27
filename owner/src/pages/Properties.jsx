import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Loader2,
  MapPin,
  IndianRupee,
  Image as ImageIcon,
  Utensils,
  Users,
  LocationEdit,
} from "lucide-react";

import { amenitiesOptions, foodOptions } from "@/constants/dropdownOptions";

export default function Properties() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getSingleProperty(id).url);
        setProperty(res.data.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
      </div>
    );
  }

  if (!property) return null;

  const {
    propertyName,
    city,
    state,
    area,
    description,
    addressLine1,
    addressLine2,
    maxGuests,
    baseGuests,
    minStayNights,
    roomBreakdown,
    pricingPerNightWeekdays,
    pricingPerNightWeekend,
    extraAdultCharge,
    extraChildCharge,
    publishNow,
    propertyType,
    kycVerified,
    coverImage,
    galleryPhotos = [],
    amenities = [],
    foodAvailability = [],
  } = property;

  const activeAmenities = new Set(amenities);
  const activeFood = new Set(foodAvailability);

  /* -------------------- UI HELPERS -------------------- */
  const PriceBox = ({ label, value }) => (
    <div className="bg-gray-100 p-4 rounded-lg w-[48%]">
      <span className="text-[16px]">{label}</span>
      <p className="font-bold text-[18px]">₹ {value} / night</p>
    </div>
  );

  /* -------------------- JSX -------------------- */
  return (
    <div className="bg-[#f6f7f8] min-h-screen pb-10">

      {/* HEADER */}
      <div className="pt-4 max-w-7xl mx-auto md:px-0 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

          {/* LEFT: NAME + LOCATION */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {propertyName}
            </h1>

            <p className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <MapPin className="w-4 h-4" />
              {city}, {state}
            </p>
          </div>

          {/* RIGHT: BADGES */}
          <div className="flex flex-wrap items-center gap-2">

            {/* PUBLISH STATUS */}
            <span
              className={`px-3 py-2 rounded-[8px] text-[12px] font-medium
          ${publishNow
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-200 text-gray-600"
                }`}
            >
              {publishNow ? "Published" : "Unpublished"}
            </span>

            {/* PROPERTY TYPE */}
            <span className="px-3 py-2 rounded-[8px] text-[12px] font-medium bg-blue-100 text-blue-700 capitalize">
              {propertyType}
            </span>

            {/* KYC STATUS */}
            <span
              className={`px-3 py-2 rounded-[8px] text-[12px] font-medium
          ${kycVerified
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
                }`}
            >
              {kycVerified ? "KYC Verified" : "KYC Pending"}
            </span>

          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="mt-6 max-w-7xl mx-auto md:px-0 px-4">
        <img
          src={coverImage}
          alt="cover"
          className="w-full h-[260px] md:h-[420px] object-cover rounded-2xl"
        />
      </div>

      {/* MOBILE PRICING (below cover) */}
      <div className="block lg:hidden mt-6 px-4">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-2 bg-primary rounded-t-xl p-4">
            <IndianRupee className="w-5 h-5 text-white" />
            <h2 className="text-white uppercase text-[20px] font-[600] tracking-[1.1px]">
              Pricing
            </h2>
          </div>

          <div className="p-4 flex flex-wrap gap-2 justify-between">
            <PriceBox label="Weekday Price" value={pricingPerNightWeekdays} />
            <PriceBox label="Weekend Price" value={pricingPerNightWeekend} />
            <PriceBox label="Extra Adult Price" value={extraAdultCharge} />
            <PriceBox label="Extra Child Price" value={extraChildCharge} />
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto px-4 md:px-0 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* OVERVIEW */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Overview</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
          </div>

          {/* CAPACITY + ADDRESS */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="bg-white rounded-xl shadow-sm w-full md:w-1/2">
              <div className="flex items-center gap-2 p-4">
                <Users className="w-4 h-4" />
                <h2 className="uppercase text-[18px] font-[600] tracking-[1.1px]">
                  Capacity
                </h2>
              </div>

              <Separator />

              {/* BASIC INFO */}
              <div className="p-4 grid grid-cols-2 gap-3 text-sm">
                <div>Max Guests: <strong>{maxGuests}</strong></div>
                <div>Base Guests: <strong>{baseGuests}</strong></div>
                <div>Min Stays: <strong>{minStayNights}</strong></div>
                <div>Total Rooms: <strong>{roomBreakdown?.total ?? 0}</strong></div>
              </div>

              {/* ROOM BREAKDOWN */}
              {roomBreakdown && (
                <>
                  <Separator />

                  <div className="p-4 pt-3">
                    <p className="text-[11px] text-gray-500 mb-2 tracking-wider uppercase">
                      Room Breakdown
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {roomBreakdown.ac > 0 && (
                        <div>AC Rooms: <strong>{roomBreakdown.ac}</strong></div>
                      )}

                      {roomBreakdown.nonAc > 0 && (
                        <div>Non-AC Rooms: <strong>{roomBreakdown.nonAc}</strong></div>
                      )}

                      {roomBreakdown.deluxe > 0 && (
                        <div>Deluxe Rooms: <strong>{roomBreakdown.deluxe}</strong></div>
                      )}

                      {roomBreakdown.luxury > 0 && (
                        <div>Luxury Rooms: <strong>{roomBreakdown.luxury}</strong></div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* ADDRESS */}
            <div className="bg-white rounded-xl shadow-sm w-full md:w-1/2">
              <div className="flex items-center gap-2 p-4">
                <LocationEdit className="w-4 h-4" />
                <h2 className="uppercase text-[18px] font-[600] tracking-[1.1px]">
                  Address
                </h2>
              </div>
              <Separator />

              <div className="p-4 space-y-1 text-sm">
                <p>{addressLine1}</p>
                {addressLine2 && <p>{addressLine2}</p>}
                <p><strong>State:</strong> {state}</p>
                <p><strong>City:</strong> {city}</p>
                <p><strong>Area:</strong> {area}</p>
              </div>
            </div>

          </div>

          {/* AMENITIES & FOOD */}
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">

            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-primary" />
              <h2 className="text-[16px] font-semibold">Amenities & Food</h2>
            </div>

            {/* FOOD */}
            <div>
              <p className="text-[11px] text-gray-500 mb-3 uppercase tracking-wider">
                Food Availability
              </p>

              <div className="flex gap-2 flex-wrap">
                {foodOptions.map(({ label, value, icon: Icon }) =>
                  activeFood.has(value) && (
                    <div
                      key={value}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0596691c] text-[13px] font-medium"
                    >
                      <Icon className="w-4 h-4 text-primary" />
                      {label}
                    </div>
                  )
                )}
              </div>
            </div>

            <Separator />

            {/* AMENITIES */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {amenitiesOptions
                .flatMap((cat) => cat.items)
                .filter((i) => activeAmenities.has(i.value))
                .map(({ label, value, icon: Icon }) => (
                  <div
                    key={value}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#E7E3DE] text-[13px] font-medium"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                    {label}
                  </div>
                ))}
            </div>
          </div>

          {/* GALLERY */}
          {galleryPhotos.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <ImageIcon className="w-5 h-5 text-primary" />
                Gallery ({galleryPhotos.length})
              </h2>

              {/* MOBILE: horizontal scroll */}
              <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto md:overflow-visible">
                {galleryPhotos.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    className="h-36 w-60 md:w-full flex-shrink-0 rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT (DESKTOP PRICING) */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-xl shadow-sm sticky top-24">
            <div className="flex items-center gap-2 bg-primary rounded-t-xl p-4">
              <IndianRupee className="w-5 h-5 text-white" />
              <h2 className="text-white uppercase text-[20px] font-[600] tracking-[1.1px]">
                Pricing
              </h2>
            </div>

            <div className="p-4 flex flex-wrap gap-2 justify-between">
              <PriceBox label="Weekday Price" value={pricingPerNightWeekdays} />
              <PriceBox label="Weekend Price" value={pricingPerNightWeekend} />
              <PriceBox label="Extra Adult Price" value={extraAdultCharge} />
              <PriceBox label="Extra Child Price" value={extraChildCharge} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
