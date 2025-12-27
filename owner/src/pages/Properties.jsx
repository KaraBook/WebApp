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
  Users,
  CalendarClock,
  IndianRupee,
  PawPrint,
  Image as ImageIcon,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Properties() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(SummaryApi.getSingleProperty(id).url);
        setProperty(res.data.data);
      } catch (err) {
        console.error("Error loading property:", err);
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

  if (!property) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Property not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  const cover =
    property.coverImage ||
    "https://via.placeholder.com/1600x600?text=No+Cover+Image";

  const gallery = property.galleryPhotos || [];

  const statusBadge = property.isBlocked
    ? "bg-red-100 text-red-700"
    : property.isDraft
    ? "bg-yellow-100 text-yellow-800"
    : "bg-emerald-100 text-emerald-700";

  const handleEditClick = () => {
    if (property.isDraft || property.isBlocked || !property.publishNow) {
      setShowDialog(true);
      return;
    }
    navigate(`/edit-property/${property._id}`);
  };

  return (
    <div className="bg-[#f6f7f8] min-h-screen pb-10">
      {/* HERO */}
      <div className="relative">
        <img
          src={cover}
          alt="cover"
          className="w-full h-[280px] md:h-[420px] object-cover"
        />

        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute bottom-6 left-6 right-6 text-white max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={statusBadge}>
              {property.isBlocked
                ? "Blocked"
                : property.isDraft
                ? "Draft"
                : "Published"}
            </Badge>

            <Badge variant="secondary">5-Star Property</Badge>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mt-2">
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
        {/* LEFT CONTENT */}
        <div className="lg:col-span-2 space-y-6">
          {/* OVERVIEW */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-2">Overview</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {property.description || "No description available."}
            </p>

            <Separator className="my-4" />

            <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <p>
                <strong>Address:</strong> {property.addressLine1}
              </p>
              <p>
                <strong>Type:</strong> {property.propertyType}
              </p>
              <p>
                <strong>Max Guests:</strong> {property.maxGuests}
              </p>
              <p className="flex items-center gap-2">
                <PawPrint className="w-4 h-4 text-primary" />
                Pet Friendly: {property.petFriendly ? "Yes" : "No"}
              </p>
            </div>
          </div>

          {/* AMENITIES */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Amenities & Food</h2>

            <h4 className="text-sm font-medium mb-2">Food Availability</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {property.foodAvailability?.length ? (
                property.foodAvailability.map((f, i) => (
                  <Badge key={i} variant="secondary" className="capitalize">
                    {f}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">Not specified</span>
              )}
            </div>

            <h4 className="text-sm font-medium mb-2">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {property.amenities?.length ? (
                property.amenities.map((a, i) => (
                  <Badge key={i} variant="secondary" className="capitalize">
                    {a}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">Not specified</span>
              )}
            </div>
          </div>

          {/* GALLERY */}
          {gallery.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-primary" />
                Gallery ({gallery.length})
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gallery.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="gallery"
                    className="h-36 w-full object-cover rounded-lg border hover:opacity-90 transition"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm lg:sticky lg:top-24">
            <p className="text-sm text-gray-500">Starting from</p>

            <p className="text-2xl font-bold flex items-center gap-1">
              <IndianRupee className="w-5 h-5" />
              {property.pricingPerNightWeekdays}
              <span className="text-sm text-gray-500 font-normal">/night</span>
            </p>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <p>
                <strong>Max Guests:</strong> {property.maxGuests}
              </p>
              <p>
                <strong>Base Guests:</strong> {property.baseGuests}
              </p>
              <p>
                <strong>Extra Adult:</strong> ₹{property.extraAdultCharge}/night
              </p>
              <p>
                <strong>Extra Child:</strong> ₹{property.extraChildCharge}/night
              </p>
              <p>
                <strong>Min Nights:</strong> {property.minStayNights}
              </p>

              <p className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-primary" />
                Check-in: {property.checkInTime}
              </p>

              <p>Check-out: {property.checkOutTime}</p>
            </div>

            <Button className="w-full mt-5" onClick={handleEditClick}>
              Edit Property
            </Button>

            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => navigate(-1)}
            >
              Back to List
            </Button>
          </div>
        </div>
      </div>

      {/* RESTRICTED EDIT DIALOG */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Edit Restricted
            </AlertDialogTitle>
            <AlertDialogDescription>
              {property.isBlocked
                ? "This property has been blocked by the admin."
                : "Property is in Draft mode. Contact admin to make it live."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction asChild>
              <a href="mailto:support@karabook.com">Contact Admin</a>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
