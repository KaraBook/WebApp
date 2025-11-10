import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
    property.coverImage || "https://via.placeholder.com/800x400?text=No+Cover+Image";
  const gallery = property.galleryPhotos || [];
  const statusColor = property.isBlocked
    ? "bg-red-100 text-red-600"
    : property.isDraft
    ? "bg-yellow-100 text-yellow-600"
    : "bg-green-100 text-green-700";

  const handleEditClick = (e) => {
    if (property.isDraft || property.isBlocked || !property.publishNow) {
      e.preventDefault();
      setShowDialog(true);
      return;
    }
    navigate(`/edit-property/${property._id}`);
  };

  return (
    <div className="space-y-8 p-3 w-full mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            {property.propertyName}
            <Badge className={statusColor}>
              {property.isBlocked
                ? "Blocked"
                : property.isDraft
                ? "Draft"
                : "Published"}
            </Badge>
          </h1>
          <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <MapPin className="w-4 h-4 text-emerald-600" />
            {property.city}, {property.state}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          {/* ✅ Fixed edit button — now triggers popup correctly */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleEditClick}
            className="bg-black text-white hover:bg-gray-800"
          >
            Edit Property
          </Button>
        </div>
      </div>

      {/* Cover Image */}
      <Card className="overflow-hidden">
        <img src={cover} alt="Cover" className="w-full h-[400px] object-cover rounded-t-md" />
      </Card>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Home className="w-4 h-4 text-emerald-600" /> Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 space-y-3">
          <p>{property.description || "No description available."}</p>
          <Separator />
          <div className="grid sm:grid-cols-2 gap-4">
            <p><strong>Type:</strong> {property.propertyType}</p>
            <p><strong>Address:</strong> {property.addressLine1}, {property.city}</p>
            <p><strong>Rooms:</strong> {property.totalRooms} total</p>
            <p><strong>Max Guests:</strong> {property.maxGuests}</p>
            <p className="flex items-center gap-2">
              <PawPrint className="w-4 h-4 text-emerald-600" />
              <strong>Pet Friendly:</strong> {property.petFriendly ? "Yes" : "No"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-600" /> Pricing & Stay
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
          <p><strong>Weekdays:</strong> ₹{property.pricingPerNightWeekdays}</p>
          <p><strong>Weekend:</strong> ₹{property.pricingPerNightWeekend}</p>
          <p><strong>Extra Guest Charge:</strong> {property.extraGuestCharge ? `₹${property.extraGuestCharge}` : "N/A"}</p>
          <p><strong>Min Stay Nights:</strong> {property.minStayNights}</p>
          <p className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-emerald-600" />
            <strong>Check-In:</strong> {property.checkInTime}
          </p>
          <p><strong>Check-Out:</strong> {property.checkOutTime}</p>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" /> Amenities & Food
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-1">Food Availability</h4>
            <div className="flex flex-wrap gap-2">
              {property.foodAvailability?.length ? (
                property.foodAvailability.map((f, i) => (
                  <Badge key={i} variant="secondary" className="capitalize">
                    {f}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500">Not specified</span>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {property.amenities?.length ? (
                property.amenities.map((a, i) => (
                  <Badge key={i} variant="secondary" className="capitalize">
                    {a}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500">Not specified</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery */}
      {gallery.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-600" /> Gallery ({gallery.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {gallery.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Gallery ${idx + 1}`}
                  className="rounded-lg h-36 w-full object-cover border hover:opacity-90 transition"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popup Alert */}
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
                : "Your property is currently in Draft mode. Please contact the admin to make it live before editing."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end space-x-2">
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction
              asChild
              className="bg-black text-white"
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
  );
}
