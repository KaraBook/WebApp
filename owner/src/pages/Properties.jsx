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
  Utensils
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
      <div className="relative">
        <img
          src={cover}
          alt="cover"
          className="max-w-7xl w-full h-[260px] md:h-[420px] object-cover rounded-b-2xl"
        />
        <div className="absolute inset-0 bg-black/25 rounded-b-2xl" />

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
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

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

          {/* AMENITIES & FOOD */}
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">

            {/* MAIN TITLE */}
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-600" />
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
              rounded-full
              bg-emerald-50
              text-emerald-700
              text-[13px]
              font-medium
            "
                    >
                      <Icon className="w-4 h-4 text-emerald-600" />
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
                {amenitiesCategories
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
                      <Icon className="w-4 h-4 text-emerald-600" />
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
                <ImageIcon className="w-5 h-5 text-emerald-600" />
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
        <div>
          <div className="bg-white rounded-xl p-6 shadow-sm lg:sticky lg:top-24">
            <p className="text-sm text-gray-500">Starting from</p>

            <p className="text-2xl font-bold flex items-center gap-1">
              <IndianRupee className="w-5 h-5" />
              {property.pricingPerNightWeekdays}
              <span className="text-sm font-normal text-gray-500">
                /night
              </span>
            </p>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <p><strong>Max Guests:</strong> {property.maxGuests}</p>
              <p><strong>Type:</strong> {property.propertyType}</p>

              <p className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-emerald-600" />
                Check-In: {property.checkInTime}
              </p>

              <p>Check-Out: {property.checkOutTime}</p>

              <p><strong>Minimum Nights:</strong> {property.minStayNights}</p>
            </div>

            <Button
              className="w-full mt-5 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => navigate(`/edit-property/${property._id}`)}
            >
              Edit Property
            </Button>

            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to List
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
