import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Home } from "lucide-react";
import { useAuthStore } from "../store/auth";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "sonner";
import { useMemo } from "react";
import { Link } from "react-router-dom";

export default function PropertyCard({ property }) {
  const { user, showAuthModal, wishlist, setWishlist, accessToken } = useAuthStore();

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

      const isAdded = updated.includes(property._id);

      if (isAdded) {
        toast.success("Added to wishlist");
      } else {
        toast.success("Removed from wishlist");
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };


  return (
    <Card className="bg-white rounded-[0] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">

      <div className="p-2 relative">
        <div className="relative">
          <Link to={`/properties/${property._id}`}>
            <img
              src={property.coverImage}
              alt={property.propertyName}
              className="w-full max-h-[200px] h-[200px] object-cover transition-transform duration-500 hover:scale-105"
            />
          </Link>

          <button
            onClick={toggleWishlist}
            className="absolute top-3 right-3 p-1 bg-transparent transition"
          >
            <Heart
              className={`w-5 h-5 transition ${inWishlist ? "text-red-500 fill-red-500" : "text-white fill-white"
                }`}
            />
          </button>


          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-gray-800 text-xs font-medium px-3 py-1 shadow-sm flex items-center gap-1">
            <Home className="w-3 h-3 text-gray-500" />
            {property.propertyType || "Club Double Room"}
          </div>
        </div>
      </div>

      <CardContent className="px-4 pb-0">
        <div className="flex justify-between items-center">
          <Link to={`/properties/${property._id}`}>
            <h3 className="text-base font-semibold text-gray-900 mt-1">
              {property.propertyName || "Property Name"}
            </h3>
          </Link>

          <div className="flex items-center text-yellow-400 text-sm mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>
                {i < Math.round(property.averageRating || 0) ? "★" : "☆"}
              </span>
            ))}
            <span className="text-gray-500 text-xs ml-1">
              {property.averageRating ? property.averageRating.toFixed(1) : " 0.0"}
            </span>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-500 mt-1 mb-2">
          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
          <span>{property.city}, {property.state}</span>
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between border-t border-gray-100">
        <div className="text-gray-900 font-semibold text-lg mt-2">
          ₹ {property.pricingPerNightWeekdays?.toLocaleString() || "N/A"}
          <span className="text-sm text-gray-500 font-normal ml-1">/ night</span>
        </div>

        <Link to={`/properties/${property._id}`}>
          <Button
            variant="outline"
            className="rounded-[0] text-sm font-medium border-gray-300 text-gray-700 hover:bg-primary hover:text-white mt-4"
          >
            Reserve Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
