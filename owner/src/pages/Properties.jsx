import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  Loader2,
  MapPin,
  IndianRupee,
  CalendarClock,
  ArrowLeft,
  Image as ImageIcon,
  Utensils,
  Users
} from "lucide-react";

import { amenitiesOptions, foodOptions } from "@/constants/dropdownOptions";

export default function Properties() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const cover =
    property.coverImage ||
    "https://via.placeholder.com/1600x600?text=No+Image";

  const gallery = property.galleryPhotos || [];

  const activeAmenities = new Set(property.amenities || []);
  const activeFood = new Set(property.foodAvailability || []);

  return (
    <div className="bg-[#f6f7f8] min-h-screen pb-10">

      {/* HERO */}
      <div className="relative mt-6 max-w-7xl mx-auto">
        <img
          src={cover}
          alt="cover"
          className="w-full h-[260px] md:h-[420px] object-cover rounded-2xl"
        />
        <div className="absolute inset-0 bg-black/25 rounded-2xl" />

        <div className="absolute bottom-6 left-6 right-6 max-w-7xl mx-auto text-white">
          <div className="flex gap-2 mb-2">
            <Badge className="bg-emerald-500 text-white">Published</Badge>
            <Badge className="bg-white/90 text-gray-800">5-Star Property</Badge>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold">
            {property.propertyName}
          </h1>

          <p className="flex items-center gap-2 text-sm mt-1">
            <MapPin className="w-4 h-4" />
            {property.city}, {property.state}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 md:px-0 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* OVERVIEW */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Overview</h2>

            <p className="text-sm text-gray-600 leading-relaxed">
              {property.description}
            </p>

            <Separator className="my-4" />

            <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <p><strong>Address:</strong> {property.addressLine1}</p>
              <p><strong>Type:</strong> {property.propertyType}</p>
            </div>
          </div>

          {/* CAPACITY AND ADDRESS */}
          <div className="flex justify-between gap-2">
            <div className="bg-white rounded-xl p-0 shadow-sm w-[48%]">
            <div className="flex justify-start gap-2 items-center rounded-t-xl p-4">
              <Users className="w-4 h-4 text-black" />
              <h2 className="text-black uppercase text-[18px] font-[600] tracking-[1.1px]">Capacity</h2>
            </div>
            <Separator />
            <div className="mt-0 p-4 flex gap-2 justify-between">
              <div className="flex flex-col">
                <span className="text-[14px]">Max Guests</span>
                <span className="font-[500]">{property.maxGuests}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[14px]">Base Guests</span>
                <span className="font-[500]">{property.baseGuests}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[14px]">Min Stays</span>
                <span className="font-[500]">{property.minStayNights}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[14px]">Total Rooms</span>
                <span className="font-[500]">
                  {property.roomBreakdown?.total ?? 0}
                </span>
              </div>
            </div>
            <div className="p-4 -mt-[25px]">
              <span className="text-[14px] pb-2">Room Breakdown</span>
              <div className="bg-[#0596691c] p-1 pl-4 pr-4 flex flex gap-1 justify-between rounded-[8px]">
                <div className="flex flex-col">
                  <span className="text-[14px]">Ac</span>
                  <span className="font-[500]">
                    {property.roomBreakdown?.ac ?? 0}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px]">Non Ac</span>
                  <span className="font-[500]">
                    {property.roomBreakdown?.nonAc ?? 0}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px]">Deluxe</span>
                  <span className="font-[500]">
                    {property.roomBreakdown?.deluxe ?? 0}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px]">Luxury</span>
                  <span className="font-[500]">
                    {property.roomBreakdown?.luxury ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-0 shadow-sm w-[48%]">
            <div className="flex justify-start gap-2 items-center rounded-t-xl p-4">
              <Users className="w-4 h-4 text-black" />
              <h2 className="text-black uppercase text-[18px] font-[600] tracking-[1.1px]">Capacity</h2>
            </div>
            <Separator />
            
          </div>
          </div>

          {/* AMENITIES & FOOD */}
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">

            {/* MAIN TITLE */}
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-primary" />
              <h2 className="text-[16px] font-semibold text-gray-900">
                Amenities & Food
              </h2>
            </div>

            {/* FOOD AVAILABILITY */}
            <div>
              <p className="text-[11px] text-gray-500 mb-3 tracking-wider uppercase">
                Food Availability
              </p>

              <div className="flex gap-2 flex-wrap">
                {foodOptions.map(({ label, value, icon: Icon }) =>
                  activeFood.has(value) ? (
                    <div
                      key={value}
                      className="
              flex items-center gap-2
              px-4 py-2
              rounded-lg
              bg-[#0596691c]
              text-emerald-700
              text-[13px]
              font-medium
            "
                    >
                      <Icon className="w-4 h-4 text-primary" />
                      {label}
                    </div>
                  ) : null
                )}
              </div>
            </div>

            <Separator />

            {/* AMENITIES */}
            <div>
              <p className="text-[11px] text-gray-500 mb-4 tracking-wider uppercase">
                Amenities
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {amenitiesOptions
                  .flatMap((cat) => cat.items)
                  .filter((item) => activeAmenities.has(item.value))
                  .map(({ label, value, icon: Icon }) => (
                    <div
                      key={value}
                      className="
              flex items-center gap-2
              px-4 py-3
              rounded-xl
              bg-white
              border border-[#E7E3DE]
              text-[13px]
              font-medium
              text-gray-800
            "
                    >
                      <Icon className="w-4 h-4 text-primary" />
                      {label}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* GALLERY */}
          {gallery.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <ImageIcon className="w-5 h-5 text-primary" />
                Gallery ({gallery.length})
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gallery.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    className="h-36 w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-[1.5rem]">
          <div className="bg-white rounded-xl p-0 shadow-sm lg:sticky lg:top-24">
            <div className="flex justify-start gap-2 items-center bg-primary rounded-t-xl p-4">
              <IndianRupee className="w-5 h-5 text-white" />
              <h2 className="text-white uppercase text-[20px] font-[600] tracking-[1.1px]">Pricing</h2>
            </div>
            <div className="w-full bg-white rounded-b-xl p-4 gap-2 flex flex-wrap justify-between items-center">
              <div className="bg-gray-100 p-4 rounded-[8px] w-[48%]">
                <span className="text-[16px]">Weekday Price</span>
                <p className="font-bold text-[18px]">₹ {property.pricingPerNightWeekdays} / night</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-[8px] w-[48%]">
                <span className="text-[16px]">Weekend Price</span>
                <p className="font-bold text-[18px]">₹ {property.pricingPerNightWeekend} / night</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-[8px] w-[48%]">
                <span className="text-[16px]">Extra Adult Price</span>
                <p className="font-bold text-[18px]">₹ {property.extraAdultCharge} / night</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-[8px] w-[48%]">
                <span className="text-[16px]">Extra Child Price</span>
                <p className="font-bold text-[18px]">₹ {property.extraChildCharge} / night</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
