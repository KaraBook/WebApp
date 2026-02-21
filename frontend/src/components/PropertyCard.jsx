import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Home, Star } from "lucide-react";
import { useAuthStore } from "../store/auth";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import { useMemo } from "react";
import { Link } from "react-router-dom";

export default function PropertyCard({ property }) {
  const { user, showAuthModal, wishlist, setWishlist, accessToken } =
    useAuthStore();

  const inWishlist = useMemo(
    () => wishlist.includes(property._id),
    [wishlist, property._id]
  );

  const toggleWishlist = async () => {
    if (!user) {
      showAuthModal();
      return;
    }

    try {
      const res = await Axios.post(
        SummaryApi.toggleWishlist.url,
        { propertyId: property._id },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const updated = res.data.data.properties.map((id) => id.toString());
      setWishlist(updated);

      toast.success(
        updated.includes(property._id)
          ? "Added to wishlist"
          : "Removed from wishlist"
      );
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const stateName = useMemo(() => {
    if (!property.state) return "";
    const stateObj = State.getStateByCodeAndCountry(property.state, "IN");
    return stateObj?.name || property.state;
  }, [property.state]);

  return (
    <Card
      className="
    bg-white
    rounded-2xl
    border border-gray-100
    shadow-[0_4px_12px_rgba(0,0,0,0.06)]
    hover:shadow-[0_14px_30px_rgba(0,0,0,0.12)]
    transition-shadow duration-300
    overflow-hidden
    flex flex-col
  "
    >

      {/* IMAGE */}
      <div className="relative">
        <Link to={`/properties/${property._id}`}>
          <img
            src={property.coverImage}
            alt={property.propertyName}
            className="w-full h-[210px] object-cover"
          />
        </Link>

        {/* Wishlist */}
        <button
          onClick={toggleWishlist}
          className="
            absolute top-3 right-3
            bg-white backdrop-blur
            rounded-full p-2
            shadow-sm
            hover:shadow-md
            transition
          "
        >
          <Heart
            className={`w-4 h-4 ${inWishlist
              ? "text-red-500 fill-red-500"
              : "text-gray-600"
              }`}
          />
        </button>

        {/* Property Type */}
        <div
          className="
            absolute top-3 left-3
            bg-white backdrop-blur
            text-xs font-medium
            px-3 py-1
            rounded-full
            shadow-sm
            flex items-center gap-1
          "
        >
          <Home className="w-3 h-3 text-gray-500" />
          {property.propertyType || "Villa"}
        </div>
      </div>

      {/* CONTENT */}
      <CardContent className="px-4 pt-3 pb-2 flex-1">
        <div className="flex justify-between items-start gap-2">
          <Link to={`/properties/${property._id}`}>
            <h3 className="text-[15px] font-semibold text-gray-900 leading-tight">
              {property.propertyName || "Property Name"}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 text-sm text-gray-800 shrink-0">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />

            <span className="font-medium">
              {property.averageRating ? property.averageRating.toFixed(1) : "0.0"}
            </span>

            <span className="text-gray-500">
              ({property.reviewCount || 0})
            </span>
          </div>

        </div>

        <div className="flex items-center text-sm text-gray-500 mt-1">
          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
          {property.city}, {stateName}
        </div>
      </CardContent>

      <hr className="border-t border-gray-200 mx-4 mb-1" />

      {/* FOOTER */}
      <CardFooter className="px-4 pb-4 pt-2 flex items-center justify-between">
        <div className="text-gray-900 font-semibold text-lg">
          ₹{property.pricingPerNightWeekdays?.toLocaleString() || "N/A"}
          <span className="text-sm text-gray-500 font-normal ml-1">/N</span>
        </div>

        <Link to={`/properties/${property._id}`}>
          <Button
            variant="outline"
            className="
              rounded-[10px]
              text-sm
              px-4
              border-gray-300
              text-gray-700
              hover:bg-primary
              hover:text-white
              transition
            "
          >
            Reserve Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
