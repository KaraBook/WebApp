import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  Loader2,
  MapPin,
  Home,
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

export default function ViewProperty() {
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

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-gray-600 w-8 h-8" />
      </div>
    );

  if (!property)
    return (
      <div className="text-center py-20 text-gray-500">
        Property not found
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    );

  const cover =
    property.coverImage || "https://via.placeholder.com/900x450?text=No+Cover+Image";
  const gallery = property.galleryPhotos || [];

  const statusColor = property.isBlocked
    ? "bg-red-50 text-red-600 border border-red-100"
    : property.isDraft
    ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
    : "bg-emerald-50 text-emerald-700 border border-emerald-100";

  const handleEditClick = (e) => {
    if (property.isDraft || property.isBlocked || !property.publishNow) {
      e.preventDefault();
      setShowDialog(true);
      return;
    }
    navigate(`/edit-property/${property._id}`);
  };

  return (
    <div className="bg-[#f5f5f7] min-h-screen px-8 py-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* PAGE HEADER */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[26px] font-semibold text-gray-900 flex items-center gap-3">
              {property.propertyName}
              <Badge className={`${statusColor} rounded-lg px-3 py-1`}>
                {property.isBlocked
                  ? "Blocked"
                  : property.isDraft
                  ? "Draft"
                  : "Published"}
              </Badge>
            </h1>

            <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <MapPin className="w-4 h-4 text-primary" />
              {property.city}, {property.state}
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            <Button
              onClick={handleEditClick}
              className="bg-primary hover:bg-primary/90 text-white px-6"
            >
              Edit Property
            </Button>
          </div>
        </div>

        {/* COVER IMAGE */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <img
            src={cover}
            alt="Cover"
            className="w-full h-[420px] object-cover"
          />
        </div>

        {/* OVERVIEW SECTION */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-primary" />
            <h2 className="text-[18px] font-semibold text-gray-900">Overview</h2>
          </div>

          <Separator />

          <p className="text-sm text-gray-700 leading-relaxed">
            {property.description || "No description available."}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 text-sm mt-2">
            <p><strong>Type:</strong> {property.propertyType}</p>
            <p><strong>Address:</strong> {property.addressLine1}</p>
            <p><strong>Rooms:</strong> {property.totalRooms}</p>
            <p><strong>Max Guests:</strong> {property.maxGuests}</p>

            <p className="flex items-center gap-2">
              <PawPrint className="w-4 h-4 text-primary" />
              <strong>Pet Friendly:</strong> {property.petFriendly ? "Yes" : "No"}
            </p>
          </div>
        </div>

        {/* PRICING SECTION */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-primary" />
            <h2 className="text-[18px] font-semibold text-gray-900">
              Pricing & Stay
            </h2>
          </div>

          <Separator />

          <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <p><strong>Weekdays:</strong> ₹{property.pricingPerNightWeekdays}</p>
            <p><strong>Weekend:</strong> ₹{property.pricingPerNightWeekend}</p>
            <p>
              <strong>Extra Guest Charge:</strong>{" "}
              {property.extraGuestCharge ? `₹${property.extraGuestCharge}` : "N/A"}
            </p>
            <p><strong>Minimum Nights:</strong> {property.minStayNights}</p>

            <p className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-primary" />
              <strong>Check-In:</strong> {property.checkInTime}
            </p>

            <p><strong>Check-Out:</strong> {property.checkOutTime}</p>
          </div>
        </div>

        {/* AMENITIES SECTION */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="text-[18px] font-semibold text-gray-900">
              Amenities & Food
            </h2>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-sm mb-2">Food Availability</h4>
            <div className="flex flex-wrap gap-2">
              {property.foodAvailability?.length ? (
                property.foodAvailability.map((f, i) => (
                  <Badge key={i} className="capitalize bg-gray-100 text-gray-700 hover:text-white ">
                    {f}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Not specified</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {property.amenities?.length ? (
                property.amenities.map((a, i) => (
                  <Badge key={i} className="capitalize bg-gray-100 text-gray-700 hover:text-white ">
                    {a}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Not specified</p>
              )}
            </div>
          </div>
        </div>

        {/* GALLERY SECTION */}
        {gallery.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-4 h-4 text-primary" />
              <h2 className="text-[18px] font-semibold text-gray-900">
                Gallery ({gallery.length})
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  className="rounded-xl h-36 w-full object-cover border border-gray-200 hover:opacity-90 transition"
                  alt="Gallery"
                />
              ))}
            </div>
          </div>
        )}

        {/* RESTRICTED EDIT POPUP */}
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-yellow-500 w-6 h-6" />
                <AlertDialogTitle>Edit Restricted</AlertDialogTitle>
              </div>

              <AlertDialogDescription className="text-gray-600 mt-2">
                {property.isBlocked
                  ? "This property has been blocked by the admin and cannot be edited."
                  : "Your property is currently in Draft mode. Please contact admin to make it live before editing."}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="flex justify-end gap-2">
              <AlertDialogCancel>Close</AlertDialogCancel>

              <AlertDialogAction
                asChild
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <a
                  href="mailto:support@karabook.com?subject=Property%20Approval%20Request"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact Admin
                </a>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
